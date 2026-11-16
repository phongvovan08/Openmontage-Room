#!/usr/bin/env python3
"""
TurboFlow Chrome Debug CLI (port 9222)
Automates batch image and video generation on Google Flow via the TurboFlow extension.
"""

import argparse
import asyncio
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.request
import websockets

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

CDP_LIST_URL = "http://127.0.0.1:9222/json/list"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
CHROME_USER_DATA = r"C:\Users\ACER\chrome-debug"
TURBOFLOW_URL_PART = "bnfjjfgjpdagdiiiifdkjbjnadgdjaoe/sidepanel.html"
DOWNLOADS_DIR = os.path.expanduser(r"~\Downloads")


def get_cdp_targets():
    try:
        with urllib.request.urlopen(CDP_LIST_URL, timeout=3) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None


def ensure_chrome_debug():
    targets = get_cdp_targets()
    if targets is not None:
        return targets

    print("[TurboFlow] Chrome Debug port 9222 not open. Launching Chrome Debug...", flush=True)
    subprocess.Popen([
        CHROME_PATH,
        "--remote-debugging-port=9222",
        f"--user-data-dir={CHROME_USER_DATA}",
        "https://flow.google.com/?pli=1",
    ])
    for _ in range(15):
        time.sleep(1)
        targets = get_cdp_targets()
        if targets is not None:
            return targets
    raise RuntimeError("Failed to connect to Chrome Debug on port 9222.")


async def cdp_eval(ws, expr, msg_id=1):
    await ws.send(json.dumps({
        "id": msg_id,
        "method": "Runtime.evaluate",
        "params": {"expression": expr, "awaitPromise": True},
    }))
    while True:
        raw = await ws.recv()
        data = json.loads(raw)
        if data.get("id") == msg_id:
            return data.get("result", {}).get("result", {}).get("value")


async def ensure_flow_project_open(targets):
    flow_tabs = [
        t for t in targets
        if ("flow.google.com" in t.get("url", "") or "labs.google" in t.get("url", "")) and t.get("type") == "page"
    ]
    if not flow_tabs:
        req = urllib.request.Request(
            "http://127.0.0.1:9222/json/new?https://labs.google/fx/vi/tools/flow",
            method="PUT",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            flow_tab = json.loads(resp.read().decode("utf-8"))
        await asyncio.sleep(5)
    else:
        flow_tab = flow_tabs[0]

    async with websockets.connect(flow_tab["webSocketDebuggerUrl"]) as ws:
        await ws.send(json.dumps({"id": 99, "method": "Page.bringToFront"}))
        await ws.recv()
        url = await cdp_eval(ws, "location.href", 1)
        if "/project/" not in str(url):
            print("[TurboFlow] Waiting for Google Flow landing page to mount...", flush=True)
            res = "no_button"
            for attempt in range(10):
                res = await cdp_eval(ws, """
                (() => {
                    const btns = Array.from(document.querySelectorAll('button, a'));
                    const firstProj = document.querySelector('a[href*="/project/"]');
                    if (firstProj) {
                        firstProj.click();
                        return 'clicked_existing';
                    }
                    const newBtn = btns.find(b => b.innerText && (
                        b.innerText.includes('Dự án mới') ||
                        b.innerText.includes('New project') ||
                        b.innerText.includes('Create with Flow') ||
                        b.innerText.includes('Tạo bằng Flow')
                    ));
                    if (newBtn) {
                        newBtn.click();
                        return 'clicked_new';
                    }
                    return 'no_button';
                })()
                """, 10 + attempt)
                if res != "no_button":
                    break
                await asyncio.sleep(1.5)
            print(f"[TurboFlow] Flow landing action: {res}", flush=True)
            for _ in range(10):
                await asyncio.sleep(1.5)
                url = await cdp_eval(ws, "location.href", 30)
                if "/project/" in str(url):
                    break
        return url


def parse_prompts_file(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read().strip()

    if path.endswith(".json"):
        data = json.loads(content)
        if isinstance(data, list):
            return [re.sub(r"\s+", " ", str(x)).strip() for x in data if str(x).strip()]

    if path.endswith(".md"):
        blocks = re.findall(r"```(?:text|prompt)?\s*\n([\s\S]*?)```", content)
        if blocks:
            return [re.sub(r"\s+", " ", b).strip() for b in blocks if b.strip()]

    lines = [re.sub(r"\s+", " ", line).strip() for line in content.splitlines()]
    return [line for line in lines if line and not line.startswith("#")]


async def find_active_turboflow_target(targets):
    turbo_tabs = [t for t in targets if TURBOFLOW_URL_PART in t.get("url", "")]
    if not turbo_tabs:
        print("[TurboFlow] Opening TurboFlow UI tab automatically...", flush=True)
        req = urllib.request.Request(
            "http://127.0.0.1:9222/json/new?chrome-extension://bnfjjfgjpdagdiiiifdkjbjnadgdjaoe/sidepanel.html",
            method="PUT",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            created = json.loads(resp.read().decode("utf-8"))
        await asyncio.sleep(3)
        targets = get_cdp_targets() or [created]
        turbo_tabs = [t for t in targets if TURBOFLOW_URL_PART in t.get("url", "")]
        if not turbo_tabs:
            raise RuntimeError("TurboFlow sidepanel target not found. Open the TurboFlow sidepanel in Chrome Debug.")
    for tt in reversed(turbo_tabs):
        async with websockets.connect(tt["webSocketDebuggerUrl"]) as ws:
            w = await cdp_eval(ws, "document.body ? document.body.offsetWidth : 0", 1)
            if w and int(w) > 0:
                return tt
    return turbo_tabs[-1]


async def run_cli(args):
    targets = ensure_chrome_debug()
    flow_url = await ensure_flow_project_open(targets)
    targets = get_cdp_targets()
    turbo = await find_active_turboflow_target(targets)

    async with websockets.connect(turbo["webSocketDebuggerUrl"]) as ws:
        if args.status:
            st = await cdp_eval(ws, """
            JSON.stringify({
                connected: document.body.innerText.includes('Connected'),
                mode: document.querySelector('button[data-mode].active')?.dataset?.mode,
                videoModel: document.getElementById('setting-video-quality')?.value,
                imageModel: document.getElementById('setting-image-model')?.value,
                folder: document.getElementById('setting-folder')?.value,
                snippet: document.body.innerText.slice(0, 350).replace(/\\n+/g, ' | ')
            }, null, 2)
            """, 10)
            print(f"Flow Project URL: {flow_url}")
            print(f"TurboFlow Status:\n{st}")
            return

        prompts = []
        if args.prompts_file:
            prompts = parse_prompts_file(args.prompts_file)
        elif args.prompt:
            prompts = [re.sub(r"\s+", " ", p).strip() for p in args.prompt if p.strip()]

        if not prompts:
            raise ValueError("Provide --prompts-file or at least one --prompt.")

        vid_ratio_map = {"16:9": "landscape", "9:16": "portrait", "landscape": "landscape", "portrait": "portrait"}
        img_ratio_map = {
            "16:9": "IMAGE_ASPECT_RATIO_LANDSCAPE",
            "4:3": "IMAGE_ASPECT_RATIO_LANDSCAPE_FOUR_THREE",
            "1:1": "IMAGE_ASPECT_RATIO_SQUARE",
            "3:4": "IMAGE_ASPECT_RATIO_PORTRAIT_THREE_FOUR",
            "9:16": "IMAGE_ASPECT_RATIO_PORTRAIT",
        }

        cfg = {
            "mode": args.mode,
            "videoModel": args.model,
            "imageModel": args.image_model,
            "vidRatio": vid_ratio_map.get(args.ratio, "portrait"),
            "imgRatio": img_ratio_map.get(args.ratio, "IMAGE_ASPECT_RATIO_PORTRAIT"),
            "count": str(args.count),
            "res": args.res,
            "duration": str(args.duration),
            "folder": args.folder,
            "promptsText": "\n".join(prompts),
        }

        setup_res = await cdp_eval(ws, f"""
        (() => {{
            const cfg = {json.dumps(cfg)};
            const controlTab = document.querySelector('button.tab[data-tab="control"]');
            if (controlTab) controlTab.click();

            const modeBtn = document.querySelector(`button[data-mode="${{cfg.mode}}"]`);
            if (modeBtn) modeBtn.click();

            if (cfg.mode === 'video') {{
                const sel = document.getElementById('setting-video-quality');
                if (sel) {{
                    sel.value = cfg.videoModel;
                    sel.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
                document.querySelector(`button[data-vid-ratio="${{cfg.vidRatio}}"]`)?.click();
                document.querySelector(`button[data-vid-count="${{cfg.count}}"]`)?.click();
                document.querySelector(`button[data-vid-res="${{cfg.res}}"]`)?.click();
                document.querySelector(`button[data-vid-duration="${{cfg.duration}}"]`)?.click();
                document.querySelector('button[data-vid-mode="text"]')?.click();
                const autoDl = document.getElementById('setting-autodownload-videos');
                if (autoDl && !autoDl.checked) autoDl.click();
            }} else {{
                const sel = document.getElementById('setting-image-model');
                if (sel) {{
                    const opt = Array.from(sel.options).find(o => o.text.toLowerCase().includes(cfg.imageModel.toLowerCase()));
                    if (opt) {{
                        sel.value = opt.value;
                        sel.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    }}
                }}
                document.querySelector(`button[data-img-ratio="${{cfg.imgRatio}}"]`)?.click();
                document.querySelector(`button[data-img-count="${{cfg.count}}"]`)?.click();
                const autoDl = document.getElementById('setting-autodownload-images');
                if (autoDl && !autoDl.checked) autoDl.click();
            }}

            const folderInput = document.getElementById('setting-folder');
            if (folderInput) {{
                folderInput.value = cfg.folder;
                folderInput.dispatchEvent(new Event('input', {{ bubbles: true }}));
                folderInput.dispatchEvent(new Event('change', {{ bubbles: true }}));
            }}

            const singleToggle = document.getElementById('single-prompt-toggle');
            if (singleToggle && singleToggle.checked) singleToggle.click();

            const ta = document.getElementById('prompt-input');
            if (ta) {{
                ta.value = cfg.promptsText;
                ta.dispatchEvent(new Event('input', {{ bubbles: true }}));
                ta.dispatchEvent(new Event('change', {{ bubbles: true }}));
            }}

            return JSON.stringify({{
                promptCountLabel: document.body.innerText.match(/\\d+ prompts?/)?.[0] || 'unknown',
                folderValue: folderInput?.value
            }});
        }})()
        """, 20)
        print(f"[TurboFlow] Configured batch ({len(prompts)} prompts): {setup_res}", flush=True)

        if not args.dry_run:
            await cdp_eval(ws, "document.getElementById('btn-start')?.click()", 21)
            print("[TurboFlow] Clicked #btn-start! Generation started.", flush=True)

        if args.wait and not args.dry_run:
            norm_folder = args.folder.replace("_", "-")
            dl_folder = os.path.join(DOWNLOADS_DIR, norm_folder)
            ext = "*.mp4" if args.mode == "video" else "*.*"
            expected = len(prompts) * int(args.count)
            start_ts = time.time()

            for step in range(90):
                await asyncio.sleep(6)
                files = [
                    f for f in (glob.glob(os.path.join(dl_folder, ext)) if os.path.exists(dl_folder) else [])
                    if os.path.getmtime(f) >= start_ts - 10 and not f.endswith(".crdownload")
                ]
                print(f"[{step*6}s] Downloaded in {dl_folder}: {len(files)}/{expected}", flush=True)
                if len(files) >= expected:
                    print(f"[TurboFlow] All {len(files)} files downloaded to {dl_folder}!", flush=True)
                    if args.out_dir:
                        os.makedirs(args.out_dir, exist_ok=True)
                        for f in sorted(files):
                            shutil.copy2(f, os.path.join(args.out_dir, os.path.basename(f)))
                        print(f"[TurboFlow] Copied {len(files)} files to {args.out_dir}", flush=True)
                    break


def main():
    parser = argparse.ArgumentParser(description="TurboFlow Chrome Debug Batch CLI")
    parser.add_argument("--status", action="store_true", help="Check connection status")
    parser.add_argument("--mode", choices=["video", "image"], default="video")
    parser.add_argument("--model", default="omni_flash", help="Video model: omni_flash | fast | lite | quality")
    parser.add_argument("--image-model", default="pro", help="Image model: pro | 2.1 | lite")
    parser.add_argument("--ratio", default="9:16", help="Aspect ratio: 9:16 | 16:9 | 1:1 | 4:3 | 3:4")
    parser.add_argument("--duration", type=int, default=10, help="Video duration: 4 | 6 | 8 | 10")
    parser.add_argument("--res", default="720p", help="Video resolution: 720p | 360p")
    parser.add_argument("--count", type=int, default=1, help="Outputs per prompt: 1..4")
    parser.add_argument("--folder", default="turboflow-batch", help="Download subfolder inside Downloads")
    parser.add_argument("--prompts-file", help="Path to .txt, .json, or .md file containing prompts")
    parser.add_argument("--prompt", action="append", help="Single prompt string (can be passed multiple times)")
    parser.add_argument("--out-dir", help="Optional target directory to copy finished files into")
    parser.add_argument("--wait", action="store_true", help="Wait for all files to finish downloading")
    parser.add_argument("--dry-run", action="store_true", help="Configure TurboFlow UI without clicking Start")
    args = parser.parse_args()
    asyncio.run(run_cli(args))


if __name__ == "__main__":
    main()

