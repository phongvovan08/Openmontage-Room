#!/usr/bin/env python3
"""TikTok Studio Upload & Schedule Tool for Room English (VIBI_VOICE / English-Channel).

Automates https://www.tiktok.com/tiktokstudio/upload via Chrome Remote Debugging (CDP port 9222):
  1. Reads the 5 Shorts and their `TikTok:` captions + schedule hours (`08:00`, `12:00`, `17:00`, `21:00`, `22:30`)
     directly from `<lesson>/youtube_upload/NOI_DUNG_DANG.txt`.
  2. Injects each `.mp4` Short into TikTok Studio's `<input type="file" accept="video/*">` via `DOM.setFileInputFiles`.
  3. Replaces the default filename caption in `.public-DraftEditor-content` with the full `TikTok:` caption + hashtags.
  4. Either posts immediately (`--post-now`) or selects `Schedule`, picks the target Date (`YYYY-MM-DD`) and Time (`HH:MM`),
     and clicks `[data-e2e="post_video_button"]`.
  5. Saves `tiktok_receipt.json` inside `<lesson>/youtube_upload/` to prevent duplicate uploads.

Usage examples:
  # 1. Dry-run (check 5 Shorts, TikTok captions & schedule):
  python -X utf8 English-Channel/_tools/tiktok_upload_tool.py --lesson English-Channel/11-Friends_Season_1 --schedule-date 2026-10-31 --dry-run

  # 2. Upload & schedule 5 Shorts of Episode 11 on TikTok Studio for 2026-10-31 (08:00, 12:00, 17:00, 21:00, 22:30):
  python -u -X utf8 English-Channel/_tools/tiktok_upload_tool.py --lesson English-Channel/11-Friends_Season_1 --schedule-date 2026-10-31
"""

from __future__ import annotations

import argparse
import asyncio
from datetime import datetime, timedelta
import json
from pathlib import Path
import subprocess
import sys
import time
from typing import Any

import requests
import websockets  # type: ignore[import-not-found]

from youtube_upload_tool import ShortUploadItem, load_lesson_package


def load_tiktok_receipt(receipt_path: Path) -> dict[str, Any]:
    if receipt_path.exists():
        return json.loads(receipt_path.read_text(encoding="utf-8-sig"))
    return {"shorts": {}}


def save_tiktok_receipt(receipt_path: Path, data: dict[str, Any]) -> None:
    receipt_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ensure_chrome_debug(debug_port: int = 9222) -> None:
    try:
        r = requests.get(f"http://127.0.0.1:{debug_port}/json/version", timeout=2)
        if r.ok:
            return
    except requests.RequestException:
        pass

    chrome_exe = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
    if not chrome_exe.exists():
        raise FileNotFoundError(f"Không tìm thấy Chrome tại {chrome_exe}")
    print(f"[TikTok CDP] Đang khởi động Chrome Debug (port {debug_port})...", flush=True)
    subprocess.Popen(
        [
            str(chrome_exe),
            f"--remote-debugging-port={debug_port}",
            r"--user-data-dir=C:\Users\ACER\chrome-debug",
            "https://www.tiktok.com/tiktokstudio/upload",
        ]
    )
    time.sleep(5)


async def upload_shorts_to_tiktok(
    shorts: list[ShortUploadItem],
    schedule_date: str | None,
    post_now: bool,
    receipt_path: Path,
    interval_minutes: int | None = None,
    debug_port: int = 9222,
) -> None:
    ensure_chrome_debug(debug_port)
    receipt = load_tiktok_receipt(receipt_path)

    # Precompute schedule datetimes if interval_minutes is set
    # TikTok requires scheduled time >= now + 20 minutes, rounded to 5-minute increments
    base_sched_dt: datetime | None = None
    if interval_minutes is not None:
        now = datetime.now()
        earliest = now + timedelta(minutes=20)
        rem = earliest.minute % 5
        if rem != 0:
            earliest += timedelta(minutes=(5 - rem))
        base_sched_dt = earliest.replace(second=0, microsecond=0)
        # If previous shorts in this lesson were already scheduled today, align base_sched_dt from the first one
        first_saved = receipt.get("shorts", {}).get(shorts[0].file_name) if shorts else None
        if isinstance(first_saved, dict) and first_saved.get("scheduleDate") and first_saved.get("scheduleHour") not in (None, "now"):
            try:
                saved_dt = datetime.strptime(
                    f"{first_saved['scheduleDate']} {first_saved['scheduleHour']}",
                    "%Y-%m-%d %H:%M",
                )
                if saved_dt + timedelta(minutes=interval_minutes) >= earliest:
                    base_sched_dt = saved_dt
            except ValueError:
                pass

    tabs = requests.get(f"http://127.0.0.1:{debug_port}/json/list", timeout=5).json()
    page_tabs = [t for t in tabs if t.get("type") == "page" and t.get("webSocketDebuggerUrl")]
    if not page_tabs:
        raise RuntimeError("Không tìm thấy tab nào trong Chrome Debug.")
    ws_url = next(
        (t["webSocketDebuggerUrl"] for t in page_tabs if "tiktok.com" in t.get("url", "")),
        page_tabs[0]["webSocketDebuggerUrl"],
    )

    async with websockets.connect(ws_url, max_size=None) as ws:
        msg_id = 1

        async def send_cdp(method: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
            nonlocal msg_id
            mid = msg_id
            msg_id += 1
            await ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))
            while True:
                m = json.loads(await ws.recv())
                if m.get("id") == mid:
                    return m.get("result", {})

        await send_cdp("Page.bringToFront")

        async def eval_js(expr: str) -> Any:
            r = await send_cdp("Runtime.evaluate", {"expression": expr, "returnByValue": True})
            return r.get("result", {}).get("value")

        async def mouse_click_xy(x: float, y: float) -> None:
            await send_cdp(
                "Input.dispatchMouseEvent",
                {"type": "mousePressed", "x": x, "y": y, "button": "left", "clickCount": 1},
            )
            await send_cdp(
                "Input.dispatchMouseEvent",
                {"type": "mouseReleased", "x": x, "y": y, "button": "left", "clickCount": 1},
            )

        for idx, s in enumerate(shorts, 1):
            existing = receipt.get("shorts", {}).get(s.file_name)
            if isinstance(existing, dict) and existing.get("status") in ("scheduled", "posted"):
                print(f"  [{idx}/{len(shorts)}] Đã đăng/hẹn lịch {s.file_name} trên TikTok trước đó, bỏ qua.", flush=True)
                continue

            caption = s.tiktok_caption.strip() or f"{s.title} #hoctienganh #friends #RoomEnglish"
            if base_sched_dt is not None and interval_minutes is not None:
                now_dt = datetime.now() + timedelta(minutes=20)
                rem_m = now_dt.minute % 5
                if rem_m != 0:
                    now_dt += timedelta(minutes=(5 - rem_m))
                min_valid_dt = now_dt.replace(second=0, microsecond=0)
                item_dt = max(min_valid_dt, base_sched_dt + timedelta(minutes=(idx - 1) * interval_minutes))
                base_sched_dt = item_dt - timedelta(minutes=(idx - 1) * interval_minutes)
                eff_date: str | None = item_dt.strftime("%Y-%m-%d")
                eff_hour = item_dt.strftime("%H:%M")
            else:
                eff_date = schedule_date
                eff_hour = s.schedule_hour

            print(f"\n=== [{idx}/{len(shorts)}] ĐĂNG TIKTOK: {s.file_name} ===", flush=True)
            print(f"  Caption : {caption}", flush=True)
            if eff_date and not post_now:
                print(f"  Hẹn lịch: {eff_date} {eff_hour}", flush=True)

            await eval_js("window.onbeforeunload = null;")
            await send_cdp("Page.navigate", {"url": "https://www.tiktok.com/tiktokstudio/upload"})
            await asyncio.sleep(6)

            # Wait up to 10s for input[type=file]
            for _ in range(10):
                has_input = await eval_js("Boolean(document.querySelector('input[type=file]'))")
                if has_input:
                    break
                await asyncio.sleep(1)

            doc = await send_cdp("DOM.getDocument", {"depth": -1})
            q = await send_cdp(
                "DOM.querySelector",
                {"nodeId": doc["root"]["nodeId"], "selector": "input[type=file]"},
            )
            if not q.get("nodeId"):
                raise RuntimeError("Không tìm thấy input[type=file] trên trang TikTok Studio Upload.")

            await send_cdp(
                "DOM.setFileInputFiles",
                {"nodeId": q["nodeId"], "files": [str(s.video_path.resolve())]},
            )
            print("  -> Đã nạp file video, đang chờ TikTok xử lý...", flush=True)

            # Wait for DraftEditor caption box & video upload completion ("Replace" button appears when upload finishes)
            for _ in range(120):
                ready = await eval_js(
                    """(() => {
                        const ed = document.querySelector('.public-DraftEditor-content[contenteditable=true]');
                        const btns = Array.from(document.querySelectorAll('button')).map(b => (b.innerText||'').trim());
                        return Boolean(ed) && btns.includes('Replace');
                    })()"""
                )
                if ready:
                    break
                await asyncio.sleep(1)

            # Wait an extra 1.5s after "Replace" appears so TikTok's default filename prefill settles
            await asyncio.sleep(1.5)

            # Replace caption in DraftJS editor via React Fiber EditorState and verify mobile preview caption
            expected_prefix = caption[:20].strip()
            cap_json = json.dumps(caption)
            for _cap_try in range(3):
                await eval_js(
                    f"""(() => {{
                        window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
                        const ed = document.querySelector('.public-DraftEditor-content[contenteditable=true]');
                        if (!ed) return false;
                        const fk = Object.keys(ed).find(k => k.startsWith('__reactFiber'));
                        let cur = fk ? ed[fk] : null;
                        while (cur && !cur.memoizedProps?.editorState) {{
                            cur = cur.return;
                        }}
                        if (!cur) return false;
                        const es = cur.memoizedProps.editorState;
                        const cs = es.getCurrentContent();
                        const EditorState = es.constructor;
                        const ContentState = cs.constructor;
                        const newCs = ContentState.createFromText({cap_json});
                        let newEs = EditorState.push(es, newCs, 'insert-characters');
                        newEs = EditorState.moveSelectionToEnd(newEs);
                        cur.memoizedProps.onChange(newEs);
                        return true;
                    }})()"""
                )
                await asyncio.sleep(0.6)
                cur_cap = await eval_js(
                    "document.querySelector('[data-e2e=\"mobile_preview_container\"] .caption')?.innerText?.trim() || ''"
                ) or ""
                if cur_cap.startswith(expected_prefix):
                    break
                print(f"  [Thử lại caption {_cap_try + 1}/3] Hiện tại preview: {cur_cap[:40]!r}", flush=True)
                await asyncio.sleep(1.0)

            # Set Schedule if eff_date is provided
            if eff_date and not post_now:
                await eval_js(
                    """(() => {
                        const rad = document.querySelector('input[type=radio][value=schedule]');
                        if (rad) (rad.closest('label') || rad).click();
                    })()"""
                )
                await asyncio.sleep(1.5)

                # 1. Pick Date (YYYY-MM-DD)
                await eval_js("document.querySelectorAll('input.TUXTextInputCore-input')[1]?.scrollIntoView({block: 'center'})")
                await asyncio.sleep(0.5)
                target_dt = datetime.strptime(eff_date, "%Y-%m-%d").date()
                cur_date_str = await eval_js("document.querySelectorAll('input.TUXTextInputCore-input')[1]?.value || ''")
                if cur_date_str != eff_date:
                    await eval_js("document.querySelectorAll('input.TUXTextInputCore-input')[1]?.click()")
                    await asyncio.sleep(1.2)
                    if cur_date_str:
                        cur_dt = datetime.strptime(cur_date_str, "%Y-%m-%d").date()
                        months_diff = (target_dt.year - cur_dt.year) * 12 + (target_dt.month - cur_dt.month)
                        for _ in range(max(0, months_diff)):
                            await eval_js(
                                """(() => {
                                    const arrows = Array.from(document.querySelectorAll('span.arrow'));
                                    if (arrows.length >= 2) arrows[1].click();
                                })()"""
                            )
                            await asyncio.sleep(0.8)
                    day_str = str(target_dt.day)
                    await eval_js(
                        f"""(() => {{
                            const days = Array.from(document.querySelectorAll('span.day.valid'));
                            const d = days.find(el => el.innerText.trim() === {json.dumps(day_str)});
                            if (d) d.click();
                        }})()"""
                    )
                    await asyncio.sleep(1.0)

                # 2. Pick Time (HH:MM, minute rounded to nearest multiple of 5) via React Fiber onPick(hourInt, minInt)
                hh_str, mm_str = eff_hour.split(":")
                hh_int = int(hh_str)
                mm_int = (int(mm_str) // 5) * 5
                hh_target = f"{hh_int:02d}"
                mm_target = f"{mm_int:02d}"
                target_time_str = f"{hh_target}:{mm_target}"

                for _time_try in range(3):
                    await eval_js(
                        f"""(() => {{
                            const p = document.querySelector('.tiktok-timepicker-time-picker-container');
                            if (!p) return;
                            const fk = Object.keys(p).find(k => k.startsWith('__reactFiber'));
                            const mp = fk ? p[fk]?.return?.memoizedProps : null;
                            if (mp && typeof mp.onPick === 'function') {{
                                mp.onPick({hh_int}, {mm_int});
                                if (typeof mp.onClose === 'function') mp.onClose();
                            }}
                        }})()"""
                    )
                    await asyncio.sleep(0.6)
                    cur_time_val = await eval_js("document.querySelectorAll('input.TUXTextInputCore-input')[0]?.value || ''")
                    if cur_time_val == target_time_str:
                        break

                sched_vals = await eval_js(
                    "Array.from(document.querySelectorAll('input.TUXTextInputCore-input')).map(i => i.value)"
                )
                print(f"  -> Đã chọn lịch trên TikTok Studio: {sched_vals}", flush=True)

            # Scroll Schedule/Post button into view first, wait for scroll to finish, then click
            for _ in range(5):
                cur_url = await eval_js("location.href") or ""
                if "/tiktokstudio/content" in cur_url:
                    break

                # Check if "Continue to post?" confirmation modal is open and click "Post now"
                modal_clicked = await eval_js(
                    """(() => {
                        const btns = Array.from(document.querySelectorAll('.common-modal-footer button, .TUXModal button'));
                        const p = btns.find(b => b.innerText.trim() === 'Post now' || b.innerText.trim() === 'Schedule' || b.innerText.trim() === 'Continue');
                        if (p) { p.click(); return p.innerText.trim(); }
                        return null;
                    })()"""
                )
                if modal_clicked:
                    print(f"  -> Đã xác nhận hộp thoại 'Continue to post?' ({modal_clicked})...", flush=True)
                    await asyncio.sleep(5)
                    continue

                btn_text = await eval_js(
                    """(() => {
                        const btn = document.querySelector('[data-e2e=post_video_button]');
                        if (!btn) return null;
                        btn.scrollIntoView({block: 'center'});
                        btn.click();
                        return (btn.innerText || '').trim();
                    })()"""
                )
                if btn_text:
                    print(f"  [OK] Đã bấm nút '{btn_text}' cho {s.file_name}!", flush=True)
                await asyncio.sleep(2.5)
                # Immediately check if "Continue to post?" modal popped up
                modal_clicked = await eval_js(
                    """(() => {
                        const btns = Array.from(document.querySelectorAll('.common-modal-footer button, .TUXModal button'));
                        const p = btns.find(b => b.innerText.trim() === 'Post now' || b.innerText.trim() === 'Schedule' || b.innerText.trim() === 'Continue');
                        if (p) { p.click(); return p.innerText.trim(); }
                        return null;
                    })()"""
                )
                if modal_clicked:
                    print(f"  -> Đã xác nhận hộp thoại 'Continue to post?' ({modal_clicked})...", flush=True)
                await asyncio.sleep(4.5)

            # Disable beforeunload just in case before moving to next item
            await eval_js("window.onbeforeunload = null;")

            final_url = await eval_js("location.href") or ""
            if "/tiktokstudio/content" not in final_url:
                raise RuntimeError(f"Chưa chuyển về /tiktokstudio/content sau khi bấm Schedule cho {s.file_name} (URL: {final_url})")

            receipt.setdefault("shorts", {})[s.file_name] = {
                "caption": caption,
                "scheduleDate": eff_date if not post_now else None,
                "scheduleHour": eff_hour if not post_now else "now",
                "status": "posted" if post_now else "scheduled",
                "uploadedAt": datetime.now().isoformat(),
            }
            save_tiktok_receipt(receipt_path, receipt)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(description="Tool tự động đăng & hẹn giờ 5 Shorts lên TikTok Studio qua Chrome Debug.")
    parser.add_argument("--lesson", type=Path, required=True, help="Thư mục bài học, VD: English-Channel/11-Friends_Season_1")
    parser.add_argument("--schedule-date", help="Ngày hẹn đăng trên TikTok (YYYY-MM-DD), VD: 2026-10-31")
    parser.add_argument(
        "--interval-minutes",
        type=int,
        help="Hẹn lịch các video cách nhau N phút tính từ thời điểm hiện tại (+20 phút tối thiểu của TikTok), VD: --interval-minutes 10",
    )
    parser.add_argument("--post-now", action="store_true", help="Đăng công khai ngay lập tức thay vì hẹn lịch")
    parser.add_argument("--dry-run", action="store_true", help="Chỉ kiểm tra danh sách 5 Shorts & TikTok caption")
    args = parser.parse_args()

    pkg = load_lesson_package(args.lesson)
    if args.dry_run:
        print("=" * 76)
        print(f"KIỂM TRA GÓI ĐĂNG TIKTOK STUDIO (DRY-RUN) — TẬP {pkg.episode_number}")
        print("=" * 76)
        for idx, s in enumerate(pkg.shorts, 1):
            sched = f"{args.schedule_date} {s.schedule_hour}" if args.schedule_date else ("Đăng ngay" if args.post_now else s.schedule_hour)
            print(f"  {idx}. {s.file_name} ({s.video_path.stat().st_size / (1024*1024):.1f} MB) | Lịch: {sched}")
            print(f"     TikTok Caption: {s.tiktok_caption}")
        print("=" * 76)
        return 0

    if not args.schedule_date and not args.post_now and args.interval_minutes is None:
        parser.error("Cần truyền `--schedule-date YYYY-MM-DD`, `--interval-minutes N` hoặc `--post-now`.")

    receipt_path = pkg.upload_dir / "tiktok_receipt.json"
    asyncio.run(
        upload_shorts_to_tiktok(
            pkg.shorts,
            args.schedule_date,
            args.post_now,
            receipt_path,
            interval_minutes=args.interval_minutes,
        )
    )
    print(f"\n[Hoàn tất] Đã lưu biên nhận TikTok tại: {receipt_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

