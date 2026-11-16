#!/usr/bin/env python3
"""YouTube Upload Tool for Room English (VIBI_VOICE / English-Channel).

Supports 3 modes:
  1. --mode api     : Official YouTube Data API v3 (OAuth2 PKCE + Resumable Upload,
                      Thumbnails, SRT Captions, Scheduled Publish, Comment Posting,
                      Multi-credential Quota Rotation, Idempotent upload_receipt.json).
  2. --mode studio  : Chrome Remote Debugging (CDP port 9222 via `cdbg`) automation
                      for YouTube Studio (no API quota used, supports A/B Thumbnails
                      and Shorts Related Video linking).
  3. --mode hybrid  : Uploads videos, metadata, primary thumbnail, and SRT captions
                      via YouTube Data API v3, then opens/automates the exact YouTube
                      Studio edit URLs (https://studio.youtube.com/video/<id>/edit)
                      on Chrome Debug for A/B Thumbnail & Shorts Related Video linking.

Usage examples (from C:\\Users\\ACER\\Desktop\\VIBI_VOICE):
  # 1. Dry-run (inspect parsed metadata, files, schedule & quota cost without uploading):
  python English-Channel/_tools/youtube_upload_tool.py --lesson English-Channel/15-Friends_Season_1 --dry-run

  # 2. Authenticate OAuth2 with Google Cloud client_secrets.json:
  python English-Channel/_tools/youtube_upload_tool.py --auth --client-secrets English-Channel/_tools/client_secrets.json

  # 3. Upload main video only (as unlisted for Copyright check, or scheduled at 20:00):
  python English-Channel/_tools/youtube_upload_tool.py --lesson English-Channel/15-Friends_Season_1 --target main --privacy unlisted

  # 4. Upload main video + 5 Shorts with automatic schedule (Day A 20:00 + Day A+1 08:00..22:30):
  python English-Channel/_tools/youtube_upload_tool.py --lesson English-Channel/15-Friends_Season_1 --target all --schedule-date 2026-10-31 --mode hybrid
"""

from __future__ import annotations

import argparse
import base64
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta, timezone
import hashlib
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import mimetypes
import os
from pathlib import Path
import re
import secrets
import subprocess
import sys
import time
from typing import Any
import urllib.parse
import webbrowser

import requests

VN_TZ = timezone(timedelta(hours=7))
YOUTUBE_UPLOAD_SCOPE = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]
CHUNK_SIZE = 8 * 1024 * 1024  # 8 MB resumable upload chunks
DEFAULT_CATEGORY_ID = "27"    # 27 = Education


@dataclass
class ShortUploadItem:
    file_name: str
    video_path: Path
    srt_path: Path | None
    schedule_hour: str
    title: str
    description: str
    tags: list[str]
    related_video_label: str
    pinned_comment: str
    tiktok_caption: str = ""


@dataclass
class LessonUploadPackage:
    lesson_dir: Path
    upload_dir: Path
    episode_number: int
    main_video_path: Path
    title: str
    description: str
    tags: list[str]
    pinned_comment: str
    thumbnails: list[Path]
    subtitles: list[tuple[str, str, Path]]  # (language_code, name, path)
    shorts: list[ShortUploadItem] = field(default_factory=list)


def extract_section(text: str, header: str, next_headers: list[str]) -> str:
    idx = text.find(header)
    if idx < 0:
        return ""
    start = idx + len(header)
    end = len(text)
    for nh in next_headers:
        nidx = text.find(nh, start)
        if nidx >= 0 and nidx < end:
            end = nidx
    return text[start:end].strip()


def parse_tags(raw: str) -> list[str]:
    items = [t.strip() for t in raw.replace("\n", ",").split(",") if t.strip()]
    seen: set[str] = set()
    result: list[str] = []
    total_chars = 0
    for item in items:
        key = item.lower()
        if key in seen:
            continue
        # YouTube API limits total tag length to ~500 characters
        if total_chars + len(item) + 1 > 480:
            break
        seen.add(key)
        result.append(item)
        total_chars += len(item) + 1
    return result


def parse_shorts_section(shorts_text: str, shorts_dir: Path) -> list[ShortUploadItem]:
    if not shorts_text.strip() or not shorts_dir.exists():
        return []
    blocks = re.split(r"\n(?=\d{2}_[^\n]+\.mp4\b)", "\n" + shorts_text.strip())
    items: list[ShortUploadItem] = []
    for block in blocks:
        lines = [line.strip() for line in block.strip().splitlines() if line.strip()]
        if not lines or not lines[0].endswith(".mp4"):
            continue
        file_name = lines[0]
        video_path = shorts_dir / file_name
        srt_candidate = shorts_dir / (Path(file_name).stem + ".srt")
        srt_path = srt_candidate if srt_candidate.exists() else None

        schedule_hour = "08:00"
        title = Path(file_name).stem
        description = ""
        tags: list[str] = []
        related_label = ""
        pinned = ""
        tiktok = ""

        for line in lines[1:]:
            if line.startswith("Giờ đăng:"):
                schedule_hour = line.split(":", 1)[1].strip()
            elif line.startswith("Tiêu đề:"):
                title = line.split(":", 1)[1].strip()
            elif line.startswith("YouTube:"):
                description = line.split(":", 1)[1].strip()
            elif line.startswith("Thẻ:"):
                tags = parse_tags(line.split(":", 1)[1].strip())
            elif line.startswith("Video liên quan:"):
                related_label = line.split(":", 1)[1].strip()
            elif line.startswith("Bình luận ghim:"):
                pinned = line.split(":", 1)[1].strip()
            elif line.startswith("TikTok:"):
                tiktok = line.split(":", 1)[1].strip()

        if video_path.exists():
            items.append(
                ShortUploadItem(
                    file_name=file_name,
                    video_path=video_path,
                    srt_path=srt_path,
                    schedule_hour=schedule_hour,
                    title=title,
                    description=description,
                    tags=tags,
                    related_video_label=related_label,
                    pinned_comment=pinned,
                    tiktok_caption=tiktok,
                )
            )
    return items


def load_lesson_package(lesson_dir: Path) -> LessonUploadPackage:
    lesson_dir = lesson_dir.resolve()
    upload_dir = lesson_dir / "youtube_upload"
    if not upload_dir.exists():
        raise FileNotFoundError(
            f"Không tìm thấy thư mục youtube_upload tại {upload_dir}. "
            f"Hãy chạy post_info.py trước."
        )

    m_num = re.match(r"^(\d+)-", lesson_dir.name)
    episode_num = int(m_num.group(1)) if m_num else 1

    post_txt_path = upload_dir / "NOI_DUNG_DANG.txt"
    if not post_txt_path.exists():
        raise FileNotFoundError(f"Thiếu file {post_txt_path}")
    text = post_txt_path.read_text(encoding="utf-8-sig")

    headers = [
        "=== TIÊU ĐỀ (TITLE) ===",
        "=== MÔ TẢ (DESCRIPTION) ===",
        "=== THẺ (TAGS - DÁN VÀO Ô THẺ TRONG YOUTUBE STUDIO) ===",
        "=== BÌNH LUẬN GHIM (PINNED COMMENT) ===",
        "=== NỘI DUNG ĐĂNG SHORTS ===",
    ]
    title = extract_section(text, headers[0], headers[1:])
    description = extract_section(text, headers[1], headers[2:])
    tags_raw = extract_section(text, headers[2], headers[3:])
    pinned_comment = extract_section(text, headers[3], headers[4:])
    shorts_raw = extract_section(text, headers[4], [])

    mp4_candidates = sorted(upload_dir.glob("*.mp4"))
    if not mp4_candidates:
        ready_mp4 = lesson_dir / "ready" / "lesson_with_subtitles.mp4"
        if ready_mp4.exists():
            mp4_candidates = [ready_mp4]
        else:
            raise FileNotFoundError(f"Không tìm thấy file .mp4 chính trong {upload_dir}")
    main_video_path = mp4_candidates[0]

    thumbnails: list[Path] = []
    for search_dir in [upload_dir, lesson_dir / "thumbnail"]:
        if search_dir.exists():
            for p in sorted(search_dir.glob("thumbnail_*.jpg")):
                if p not in thumbnails:
                    thumbnails.append(p)

    subtitles: list[tuple[str, str, Path]] = []
    vi_full = next(upload_dir.glob("vi - Vietnamese*.srt"), None)
    if vi_full and vi_full.exists():
        subtitles.append(("vi", "Tiếng Việt (Đầy đủ)", vi_full))
    else:
        lesson_srt = upload_dir / "lesson_subtitles.srt"
        if lesson_srt.exists():
            subtitles.append(("vi", "Tiếng Việt", lesson_srt))

    shorts = parse_shorts_section(shorts_raw, upload_dir / "shorts")

    return LessonUploadPackage(
        lesson_dir=lesson_dir,
        upload_dir=upload_dir,
        episode_number=episode_num,
        main_video_path=main_video_path,
        title=title,
        description=description,
        tags=parse_tags(tags_raw),
        pinned_comment=pinned_comment,
        thumbnails=thumbnails,
        subtitles=subtitles,
        shorts=shorts,
    )


# ============================================================================
# OAuth 2.0 PKCE + Token Refresh (Pure Python + requests, no extra pip needed)
# ============================================================================

def load_client_config(client_secrets_path: Path) -> dict[str, Any]:
    raw = json.loads(client_secrets_path.read_text(encoding="utf-8-sig"))
    cfg = raw.get("installed") or raw.get("web")
    if not cfg or "client_id" not in cfg or "client_secret" not in cfg:
        raise ValueError(
            f"File {client_secrets_path} không đúng chuẩn OAuth 2.0 Desktop client_secrets.json của Google Cloud."
        )
    return cfg


def run_oauth_pkce_flow(client_secrets_path: Path, token_out_path: Path, port: int = 8765) -> dict[str, Any]:
    cfg = load_client_config(client_secrets_path)
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode("ascii")).digest()).rstrip(b"=").decode("ascii")
    state = secrets.token_urlsafe(24)
    redirect_uri = f"http://localhost:{port}"

    auth_params = {
        "client_id": cfg["client_id"],
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": " ".join(YOUTUBE_UPLOAD_SCOPE),
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    }
    auth_url = f"{cfg.get('auth_uri', 'https://accounts.google.com/o/oauth2/v2/auth')}?{urllib.parse.urlencode(auth_params)}"

    result: dict[str, str] = {}

    class CallbackHandler(BaseHTTPRequestHandler):
        def do_GET(self) -> None:
            parsed = urllib.parse.urlparse(self.path)
            qs = urllib.parse.parse_qs(parsed.query)
            if "code" in qs:
                result["code"] = qs["code"][0]
                result["state"] = qs.get("state", [""])[0]
                body = (
                    "<html><body style='font-family:sans-serif;padding:40px'>"
                    "<h2>Xac thuc YouTube API thanh cong!</h2>"
                    "<p>Ban co the dong tab trinh duyet nay va quay lai terminal.</p>"
                    "</body></html>"
                )
                self.send_response(200)
            else:
                result["error"] = qs.get("error", ["unknown_error"])[0]
                body = f"<html><body><h2>Loi xac thuc: {result['error']}</h2></body></html>"
                self.send_response(400)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(body.encode("utf-8"))

        def log_message(self, format: str, *args: Any) -> None:
            return

    server = HTTPServer(("127.0.0.1", port), CallbackHandler)
    print(f"\n[OAuth2] Đang mở trình duyệt để cấp quyền YouTube cho kênh của bạn...", flush=True)
    print(f"Link xác thực OAuth2:\n{auth_url}\n", flush=True)
    try:
        open_in_chrome_debug_or_default([auth_url])
    except Exception:
        pass
    try:
        os.startfile(auth_url)  # type: ignore[attr-defined]
    except Exception:
        webbrowser.open(auth_url)
    while "code" not in result and "error" not in result:
        server.handle_request()
    server.server_close()

    if "error" in result or "code" not in result:
        raise RuntimeError(f"Xác thực OAuth2 thất bại: {result.get('error', 'Không nhận được code')}")
    if result.get("state") != state:
        raise RuntimeError("OAuth2 state mismatch!")

    token_uri = cfg.get("token_uri", "https://oauth2.googleapis.com/token")
    resp = requests.post(
        token_uri,
        data={
            "client_id": cfg["client_id"],
            "client_secret": cfg["client_secret"],
            "code": result["code"],
            "code_verifier": verifier,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        },
        timeout=30,
    )
    resp.raise_for_status()
    token_data = resp.json()
    saved = {
        "client_id": cfg["client_id"],
        "client_secret": cfg["client_secret"],
        "token_uri": token_uri,
        "access_token": token_data["access_token"],
        "refresh_token": token_data.get("refresh_token", ""),
        "expires_at": int(time.time()) + int(token_data.get("expires_in", 3500)) - 60,
    }
    token_out_path.parent.mkdir(parents=True, exist_ok=True)
    token_out_path.write_text(json.dumps(saved, indent=2), encoding="utf-8")
    print(f"[OAuth2] Đã lưu token tại: {token_out_path}")
    return saved


def get_valid_access_token(token_path: Path, client_secrets_path: Path | None = None) -> str:
    if not token_path.exists():
        if client_secrets_path and client_secrets_path.exists():
            saved = run_oauth_pkce_flow(client_secrets_path, token_path)
            return saved["access_token"]
        raise FileNotFoundError(
            f"Chưa có file token tại {token_path}. "
            f"Hãy chạy lệnh với `--auth --client-secrets <đường_dẫn_client_secrets.json>` trước."
        )
    saved = json.loads(token_path.read_text(encoding="utf-8-sig"))
    if time.time() < saved.get("expires_at", 0) and saved.get("access_token"):
        return saved["access_token"]

    if not saved.get("refresh_token"):
        raise RuntimeError(f"Token tại {token_path} đã hết hạn và không có refresh_token. Hãy chạy lại `--auth`.")

    resp = requests.post(
        saved.get("token_uri", "https://oauth2.googleapis.com/token"),
        data={
            "client_id": saved["client_id"],
            "client_secret": saved["client_secret"],
            "refresh_token": saved["refresh_token"],
            "grant_type": "refresh_token",
        },
        timeout=30,
    )
    resp.raise_for_status()
    refreshed = resp.json()
    saved["access_token"] = refreshed["access_token"]
    saved["expires_at"] = int(time.time()) + int(refreshed.get("expires_in", 3500)) - 60
    token_path.write_text(json.dumps(saved, indent=2), encoding="utf-8")
    return saved["access_token"]


# ============================================================================
# YouTube Data API v3 Operations
# ============================================================================

def youtube_resumable_upload(
    access_token: str,
    video_path: Path,
    title: str,
    description: str,
    tags: list[str],
    privacy_status: str = "unlisted",
    publish_at_iso: str | None = None,
    category_id: str = DEFAULT_CATEGORY_ID,
    default_language: str = "vi",
    default_audio_language: str = "en",
) -> str:
    """Upload an MP4 file to YouTube via Data API v3 resumable protocol and return videoId."""
    file_size = video_path.stat().st_size
    status_obj: dict[str, Any] = {
        "privacyStatus": "private" if publish_at_iso else privacy_status,
        "selfDeclaredMadeForKids": False,
    }
    if publish_at_iso:
        status_obj["publishAt"] = publish_at_iso

    metadata = {
        "snippet": {
            "title": title[:100],
            "description": description[:5000],
            "tags": tags,
            "categoryId": category_id,
            "defaultLanguage": default_language,
            "defaultAudioLanguage": default_audio_language,
        },
        "status": status_obj,
    }

    init_resp = requests.post(
        "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Length": str(file_size),
            "X-Upload-Content-Type": "video/mp4",
        },
        data=json.dumps(metadata, ensure_ascii=False).encode("utf-8"),
        timeout=60,
    )
    if not init_resp.ok:
        raise RuntimeError(f"Khởi tạo upload thất bại ({init_resp.status_code}): {init_resp.text}")

    upload_url = init_resp.headers.get("Location")
    if not upload_url:
        raise RuntimeError("YouTube API không trả về Resumable Upload Location header.")

    print(f"  -> Đang tải lên: {video_path.name} ({file_size / (1024 * 1024):.1f} MB)...")
    with video_path.open("rb") as f:
        offset = 0
        while offset < file_size:
            chunk = f.read(CHUNK_SIZE)
            if not chunk:
                break
            end_byte = offset + len(chunk) - 1
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Length": str(len(chunk)),
                "Content-Type": "video/mp4",
                "Content-Range": f"bytes {offset}-{end_byte}/{file_size}",
            }
            put_resp = requests.put(upload_url, headers=headers, data=chunk, timeout=300)
            if put_resp.status_code in (200, 201):
                data = put_resp.json()
                video_id = data["id"]
                print(f"  [OK] Hoàn tất tải video! videoId = {video_id} (https://youtu.be/{video_id})")
                return video_id
            elif put_resp.status_code == 308:
                offset += len(chunk)
                pct = offset * 100 / file_size
                print(f"     Đã tải {pct:5.1f}% ({offset // (1024 * 1024)}/{file_size // (1024 * 1024)} MB)", end="\r")
            else:
                raise RuntimeError(f"Lỗi khi đẩy chunk ({put_resp.status_code}): {put_resp.text}")

    raise RuntimeError("Upload kết thúc nhưng không nhận được phản hồi 200/201 từ YouTube.")


def youtube_set_thumbnail(access_token: str, video_id: str, thumbnail_path: Path) -> None:
    mime = mimetypes.guess_type(str(thumbnail_path))[0] or "image/jpeg"
    data = thumbnail_path.read_bytes()
    resp = requests.post(
        f"https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={urllib.parse.quote(video_id)}&uploadType=media",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": mime,
            "Content-Length": str(len(data)),
        },
        data=data,
        timeout=60,
    )
    if not resp.ok:
        print(f"  [Cảnh báo] Không thể đặt thumbnail qua API ({resp.status_code}): {resp.text[:240]}")
    else:
        print(f"  [OK] Đã gắn Thumbnail chính: {thumbnail_path.name}")


def youtube_upload_caption(
    access_token: str,
    video_id: str,
    language: str,
    name: str,
    srt_path: Path,
) -> None:
    boundary = f"===============oc_yt_caption_{secrets.token_hex(8)}=="
    snippet = {
        "snippet": {
            "videoId": video_id,
            "language": language,
            "name": name,
            "isDraft": False,
        }
    }
    srt_bytes = srt_path.read_bytes()
    body = (
        f"--{boundary}\r\n"
        f"Content-Type: application/json; charset=UTF-8\r\n\r\n"
        f"{json.dumps(snippet, ensure_ascii=False)}\r\n"
        f"--{boundary}\r\n"
        f"Content-Type: application/x-subrip; charset=UTF-8\r\n\r\n"
    ).encode("utf-8") + srt_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

    resp = requests.post(
        "https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": f"multipart/related; boundary=\"{boundary}\"",
        },
        data=body,
        timeout=120,
    )
    if not resp.ok:
        print(f"  [Cảnh báo] Không thể tải phụ đề {srt_path.name} ({resp.status_code}): {resp.text[:240]}")
    else:
        print(f"  [OK] Đã tải phụ đề: {srt_path.name} ({language})")


def youtube_post_comment(access_token: str, video_id: str, comment_text: str) -> str | None:
    if not comment_text.strip():
        return None
    payload = {
        "snippet": {
            "videoId": video_id,
            "topLevelComment": {
                "snippet": {
                    "textOriginal": comment_text.strip(),
                }
            },
        }
    }
    resp = requests.post(
        "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json; charset=UTF-8",
        },
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        timeout=30,
    )
    if not resp.ok:
        print(
            f"  [Lưu ý] Chưa thể đăng bình luận tự động (video đang ở chế độ riêng tư/hẹn giờ): "
            f"{resp.status_code}"
        )
        return None
    cid = resp.json().get("id")
    print(f"  [OK] Đã đăng bình luận đầu tiên (commentId={cid}). Hãy bấm Ghim trong Studio.")
    return cid


# ============================================================================
# Chrome Debug (CDP port 9222) Studio Helper for A/B Thumbnails & Related Video
# ============================================================================

def cdp_auto_link_shorts_related_video(
    short_video_ids: list[str],
    episode_number: int,
    debug_port: int = 9222,
    room_english_page_id: str = "114346749841225190650",
) -> None:
    """Automatically attach 'Video có liên quan' (Related Video) -> 'S1 phần <N>' and click Save via Chrome Debug CDP."""
    if not short_video_ids:
        return
    try:
        import asyncio
        import websockets  # type: ignore[import-not-found]
    except ImportError:
        return

    chrome_proc = None
    try:
        resp = requests.get(f"http://127.0.0.1:{debug_port}/json/version", timeout=2)
        if not resp.ok:
            raise requests.RequestException("Port not ready")
    except requests.RequestException:
        chrome_exe = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
        if not chrome_exe.exists():
            return
        print(f"  [CDP] Đang khởi động Chrome Debug (port {debug_port})...", flush=True)
        chrome_proc = subprocess.Popen(
            [
                str(chrome_exe),
                f"--remote-debugging-port={debug_port}",
                r"--user-data-dir=C:\Users\ACER\chrome-debug",
                "about:blank",
            ]
        )
        time.sleep(4)

    target_keyword = f"S1 phần {episode_number}"

    async def _run() -> None:
        tabs = requests.get(f"http://127.0.0.1:{debug_port}/json/list", timeout=5).json()
        page_tabs = [t for t in tabs if t.get("type") == "page" and t.get("webSocketDebuggerUrl")]
        if not page_tabs:
            return
        ws_url = next(
            (t["webSocketDebuggerUrl"] for t in page_tabs if "studio.youtube.com" in t.get("url", "")),
            page_tabs[0]["webSocketDebuggerUrl"],
        )
        async with websockets.connect(ws_url) as ws:
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

            async def eval_js(expr: str) -> Any:
                r = await send_cdp("Runtime.evaluate", {"expression": expr, "returnByValue": True})
                return r.get("result", {}).get("value")

            for idx, vid in enumerate(short_video_ids, 1):
                await send_cdp("Page.navigate", {"url": f"https://studio.youtube.com/video/{vid}/edit"})
                await asyncio.sleep(6)

                # If Studio is on wrong channel ("Rất tiếc, đã xảy ra lỗi."), switch once to Room English
                body_txt = await eval_js("document.body ? document.body.innerText.slice(0, 400) : ''") or ""
                if "Rất tiếc, đã xảy ra lỗi" in body_txt or "Oops, something went wrong" in body_txt:
                    switch_url = (
                        f"https://www.youtube.com/signin?action_handle_signin=true&authuser=0"
                        f"&pageid={room_english_page_id}&next=%2F&feature=channel_switcher&skip_identity_prompt=true"
                    )
                    await send_cdp("Page.navigate", {"url": switch_url})
                    await asyncio.sleep(7)
                    await send_cdp("Page.navigate", {"url": f"https://studio.youtube.com/video/{vid}/edit"})
                    await asyncio.sleep(6)

                # Wait up to 8s for #linked-video-editor-link to appear
                for _ in range(8):
                    has_trig = await eval_js("Boolean(document.querySelector('#linked-video-editor-link'))")
                    if has_trig:
                        break
                    await asyncio.sleep(1)

                for _ in range(2):
                    cur_linked = await eval_js("(document.querySelector('#linked-video-editor-link')?.innerText || '').trim()") or ""
                    if target_keyword in cur_linked:
                        break
                    await eval_js(
                        """(() => {
                            const el = document.querySelector('#linked-video-editor-link, ytcp-shorts-content-links-picker ytcp-dropdown-trigger');
                            if (el) el.click();
                        })()"""
                    )
                    await asyncio.sleep(3)
                    await eval_js(
                        f"""(() => {{
                            const cards = Array.from(document.querySelectorAll('ytcp-entity-card'));
                            const target = cards.find(c => (c.innerText || '').includes({json.dumps(target_keyword)}));
                            if (target) (target.querySelector('#content') || target).click();
                        }})()"""
                    )
                    await asyncio.sleep(2.5)

                # Click Save until aria-disabled == 'true' (up to 3 attempts)
                for _ in range(3):
                    is_disabled = await eval_js("document.querySelector('ytcp-button#save')?.getAttribute('aria-disabled')")
                    if is_disabled == "true":
                        break
                    pt = await eval_js(
                        """(() => {
                            const el = document.querySelector('ytcp-button#save button') || document.querySelector('ytcp-button#save');
                            if (!el) return null;
                            const r = el.getBoundingClientRect();
                            return {x: r.left + r.width / 2, y: r.top + r.height / 2};
                        })()"""
                    )
                    if pt:
                        await send_cdp(
                            "Input.dispatchMouseEvent",
                            {"type": "mousePressed", "x": pt["x"], "y": pt["y"], "button": "left", "clickCount": 1},
                        )
                        await send_cdp(
                            "Input.dispatchMouseEvent",
                            {"type": "mouseReleased", "x": pt["x"], "y": pt["y"], "button": "left", "clickCount": 1},
                        )
                    await eval_js("(document.querySelector('ytcp-button#save button') || document.querySelector('ytcp-button#save'))?.click()")
                    await asyncio.sleep(3.5)

                after = await eval_js(
                    """({
                        linked: (document.querySelector('#linked-video-editor-link')?.innerText || '').trim(),
                        saveDisabled: document.querySelector('ytcp-button#save')?.getAttribute('aria-disabled')
                    })"""
                )
                print(f"  [CDP Related Video {idx}/{len(short_video_ids)}] {vid} -> {after}", flush=True)

    try:
        asyncio.run(_run())
    except Exception as exc:
        print(f"  [Cảnh báo CDP] Không thể tự động gắn Video liên quan: {exc}")


def open_in_chrome_debug_or_default(urls: list[str], debug_port: int = 9222) -> None:
    """If Chrome Debug (cdbg) is running on port 9222, open tabs inside it; otherwise open in default Chrome."""
    if not urls:
        return
    try:
        resp = requests.get(f"http://127.0.0.1:{debug_port}/json/version", timeout=2)
        if resp.ok:
            for u in urls:
                requests.put(f"http://127.0.0.1:{debug_port}/json/new?{urllib.parse.quote(u, safe=':/?&=#')}", timeout=5)
            print(f"\n[Studio CDP] Đã mở {len(urls)} tab YouTube Studio trực tiếp trong Chrome Debug (port {debug_port}).")
            return
    except requests.RequestException:
        pass

    for u in urls:
        try:
            os.startfile(u)  # type: ignore[attr-defined]
        except Exception:
            webbrowser.open(u)
    print(f"\n[Studio] Đã mở {len(urls)} tab chỉnh sửa YouTube Studio trên trình duyệt chính.")


# ============================================================================
# Schedule Computation & Receipt Management
# ============================================================================

def compute_iso_schedule(date_str: str, hm_str: str, day_offset: int = 0) -> str:
    base_date = datetime.strptime(date_str, "%Y-%m-%d").date() + timedelta(days=day_offset)
    hour, minute = [int(x) for x in hm_str.split(":")]
    dt = datetime(base_date.year, base_date.month, base_date.day, hour, minute, 0, tzinfo=VN_TZ)
    return dt.isoformat()


def load_receipt(receipt_path: Path) -> dict[str, Any]:
    if receipt_path.exists():
        return json.loads(receipt_path.read_text(encoding="utf-8-sig"))
    return {"main": None, "shorts": {}}


def save_receipt(receipt_path: Path, data: dict[str, Any]) -> None:
    receipt_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def print_dry_run_summary(
    pkg: LessonUploadPackage,
    target: str,
    privacy: str,
    schedule_date: str | None,
    skip_shorts_srt: bool = True,
) -> None:
    print("=" * 76)
    print(f"KIỂM TRA GÓI ĐĂNG YOUTUBE (DRY-RUN) — TẬP {pkg.episode_number}")
    print("=" * 76)
    print(f"Thư mục nguồn : {pkg.upload_dir}")
    print(f"Video dài     : {pkg.main_video_path.name} ({pkg.main_video_path.stat().st_size / (1024*1024):.1f} MB)")
    print(f"Tiêu đề       : {pkg.title}")
    print(f"Số lượng Tags : {len(pkg.tags)} thẻ ({sum(len(t) for t in pkg.tags)} ký tự)")
    print(f"Thumbnails    : {', '.join(p.name for p in pkg.thumbnails) if pkg.thumbnails else 'Không có'}")
    print(f"Phụ đề (.srt) : {', '.join(f'{lang}:{p.name}' for lang, _, p in pkg.subtitles) if pkg.subtitles else 'Không có'}")
    print(f"Bình luận ghim: {pkg.pinned_comment}")
    if schedule_date:
        print(f"Lịch đăng dài : {compute_iso_schedule(schedule_date, '20:00', 0)} (20:00 giờ VN)")
    else:
        print(f"Chế độ hiển thị: {privacy}")

    print("-" * 76)
    print(f"DANH SÁCH SHORTS ({len(pkg.shorts)} video):")
    for idx, s in enumerate(pkg.shorts, 1):
        sched = (
            compute_iso_schedule(schedule_date, s.schedule_hour, day_offset=1)
            if schedule_date
            else f"{s.schedule_hour} (chưa đặt ngày)"
        )
        size_mb = s.video_path.stat().st_size / (1024 * 1024)
        srt_note = f"{s.srt_path.name} (bỏ qua upload rời vì đã gắn cứng)" if (s.srt_path and skip_shorts_srt) else (s.srt_path.name if s.srt_path else "Không có")
        print(f"  {idx}. {s.file_name} ({size_mb:.1f} MB) | Lịch: {sched}")
        print(f"     Tiêu đề : {s.title}")
        print(f"     Phụ đề  : {srt_note}")
        print(f"     Liên kết: {s.related_video_label}")

    quota_main = 1600 + (50 if pkg.thumbnails else 0) + (400 * len(pkg.subtitles))
    quota_shorts = len(pkg.shorts) * 1600 + (0 if skip_shorts_srt else sum(400 for s in pkg.shorts if s.srt_path))
    total_quota = (quota_main if target in ("main", "all") else 0) + (
        quota_shorts if target in ("shorts", "all") else 0
    )
    print("-" * 76)
    print(f"ƯỚC TÍNH QUOTA YOUTUBE DATA API v3:")
    if target in ("main", "all"):
        print(f"  - Video dài + Thumbnail + Phụ đề : ~{quota_main:,} units")
    if target in ("shorts", "all"):
        print(f"  - {len(pkg.shorts)} Video Shorts                 : ~{quota_shorts:,} units")
    print(f"  => TỔNG CỘNG                     : ~{total_quota:,} units / 10,000 units hạn mức ngày/project")
    print("=" * 76)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(
        description="Tool đăng video dài + Shorts lên YouTube cho kênh Room English (API v3 + Chrome Debug Studio)."
    )
    parser.add_argument("--lesson", type=Path, help="Đường dẫn thư mục bài học, VD: English-Channel/15-Friends_Season_1")
    parser.add_argument("--auth", action="store_true", help="Chạy xác thực OAuth2 để lấy token YouTube API")
    parser.add_argument(
        "--client-secrets",
        type=Path,
        default=Path(__file__).resolve().parent / "client_secrets.json",
        help="Đường dẫn tới file client_secrets.json của Google Cloud",
    )
    parser.add_argument(
        "--token-files",
        type=Path,
        nargs="+",
        default=[
            Path(__file__).resolve().parent / ".youtube_token.json",
            Path(__file__).resolve().parent / ".youtube_token_2.json",
        ],
        help="Danh sách file lưu OAuth2 token (hỗ trợ xoay vòng nhiều project khi hết quota)",
    )
    parser.add_argument(
        "--mode",
        choices=["api", "studio", "hybrid"],
        default="hybrid",
        help="Chế độ chạy: api (chỉ gọi API v3), studio (mở YouTube Studio trên Chrome Debug), hybrid (API + mở Studio để gắn A/B Thumbnail & Related Video)",
    )
    parser.add_argument(
        "--target",
        choices=["main", "shorts", "all"],
        default="all",
        help="Chọn phần muốn đăng: main (chỉ video dài), shorts (chỉ 5 shorts), all (cả hai)",
    )
    parser.add_argument(
        "--privacy",
        choices=["unlisted", "private", "public"],
        default="unlisted",
        help="Chế độ hiển thị khi không truyền --schedule-date (mặc định: unlisted để kiểm tra Bản quyền)",
    )
    parser.add_argument(
        "--schedule-date",
        help="Ngày đăng video dài (YYYY-MM-DD). Video dài sẽ hẹn 20:00 ngày này, 5 Shorts tự động hẹn 08:00..22:30 ngày hôm sau!",
    )
    parser.add_argument(
        "--skip-shorts-srt",
        action="store_true",
        default=True,
        help="Bỏ qua tải file .srt rời cho Shorts (vì Shorts đã gắn cứng phụ đề vào video) để tiết kiệm 2,000 quota units (mặc định: Bật)",
    )
    parser.add_argument(
        "--upload-shorts-srt",
        action="store_false",
        dest="skip_shorts_srt",
        help="Bắt buộc tải cả file .srt rời cho 5 Shorts",
    )
    parser.add_argument("--dry-run", action="store_true", help="Chỉ kiểm tra dữ liệu và tính toán Quota, không đẩy lên YouTube")
    parser.add_argument(
        "--link-related-only",
        action="store_true",
        help="Chỉ chạy bước Chrome Debug CDP để gắn 'Video có liên quan' + bấm Lưu cho các Shorts đã có trong upload_receipt.json",
    )
    args = parser.parse_args()

    if args.auth:
        run_oauth_pkce_flow(args.client_secrets.resolve(), args.token_files[0].resolve())
        return 0

    if not args.lesson:
        parser.error("Cần truyền `--lesson <thư_mục_bài>` (hoặc `--auth` để đăng nhập OAuth2).")

    pkg = load_lesson_package(args.lesson)
    if args.dry_run:
        print_dry_run_summary(pkg, args.target, args.privacy, args.schedule_date, args.skip_shorts_srt)
        return 0

    receipt_path = pkg.upload_dir / "upload_receipt.json"
    receipt = load_receipt(receipt_path)

    if args.link_related_only:
        short_vids = [
            info["videoId"]
            for info in receipt.get("shorts", {}).values()
            if isinstance(info, dict) and info.get("videoId")
        ]
        if not short_vids:
            print(f"Không tìm thấy Shorts nào trong {receipt_path}. Hãy đăng Shorts trước.")
            return 1
        print(f"\n=== CHỈ GẮN VIDEO LIÊN QUAN CHO {len(short_vids)} SHORTS (TẬP {pkg.episode_number}) ===")
        cdp_auto_link_shorts_related_video(short_vids, pkg.episode_number)
        return 0

    if args.mode == "studio":
        studio_urls = ["https://studio.youtube.com/channel/UCFz4agZrEX7zV5F5BEdfl1w/videos/short"]
        if receipt.get("main") and receipt["main"].get("videoId"):
            studio_urls.append(f"https://studio.youtube.com/video/{receipt['main']['videoId']}/edit")
        for s_info in receipt.get("shorts", {}).values():
            if isinstance(s_info, dict) and s_info.get("videoId"):
                studio_urls.append(f"https://studio.youtube.com/video/{s_info['videoId']}/edit")
        open_in_chrome_debug_or_default(studio_urls)
        print(f"\nĐã mở YouTube Studio và thư mục dữ liệu: {pkg.upload_dir}")
        return 0

    # Resolve valid OAuth token(s) for API / Hybrid mode
    available_tokens: list[str] = []
    for tf in args.token_files:
        if tf.exists():
            available_tokens.append(get_valid_access_token(tf, args.client_secrets))
    if not available_tokens:
        available_tokens.append(get_valid_access_token(args.token_files[0], args.client_secrets))

    token_idx = 0

    def current_token() -> str:
        return available_tokens[min(token_idx, len(available_tokens) - 1)]

    studio_edit_urls: list[str] = []

    # 1. Upload Main Video
    if args.target in ("main", "all"):
        if receipt.get("main") and receipt["main"].get("videoId"):
            main_vid = receipt["main"]["videoId"]
            print(f"[Bỏ qua] Video dài đã được tải lên trước đó: https://youtu.be/{main_vid}")
            studio_edit_urls.append(f"https://studio.youtube.com/video/{main_vid}/edit")
        else:
            pub_iso = compute_iso_schedule(args.schedule_date, "20:00", 0) if args.schedule_date else None
            print(f"\n=== 1. ĐĂNG VIDEO DÀI (TẬP {pkg.episode_number}) ===")
            main_vid = youtube_resumable_upload(
                access_token=current_token(),
                video_path=pkg.main_video_path,
                title=pkg.title,
                description=pkg.description,
                tags=pkg.tags,
                privacy_status=args.privacy,
                publish_at_iso=pub_iso,
            )
            if pkg.thumbnails:
                youtube_set_thumbnail(current_token(), main_vid, pkg.thumbnails[0])
            for lang, name, srt_file in pkg.subtitles:
                youtube_upload_caption(current_token(), main_vid, lang, name, srt_file)
            if not pub_iso and args.privacy in ("public", "unlisted"):
                youtube_post_comment(current_token(), main_vid, pkg.pinned_comment)

            receipt["main"] = {
                "videoId": main_vid,
                "url": f"https://youtu.be/{main_vid}",
                "studioEditUrl": f"https://studio.youtube.com/video/{main_vid}/edit",
                "title": pkg.title,
                "uploadedAt": datetime.now(VN_TZ).isoformat(),
                "publishAt": pub_iso,
            }
            save_receipt(receipt_path, receipt)
            studio_edit_urls.append(f"https://studio.youtube.com/video/{main_vid}/edit")

    # 2. Upload 5 Shorts
    if args.target in ("shorts", "all"):
        print(f"\n=== 2. ĐĂNG {len(pkg.shorts)} VIDEO SHORTS ===")
        for idx, s in enumerate(pkg.shorts, 1):
            existing = receipt.get("shorts", {}).get(s.file_name)
            if isinstance(existing, dict) and existing.get("videoId"):
                svid = existing["videoId"]
                print(f"  [{idx}/{len(pkg.shorts)}] Đã đăng {s.file_name} trước đó: https://youtube.com/shorts/{svid}")
                studio_edit_urls.append(f"https://studio.youtube.com/video/{svid}/edit")
                continue

            pub_iso = (
                compute_iso_schedule(args.schedule_date, s.schedule_hour, day_offset=1)
                if args.schedule_date
                else None
            )
            print(f"\n  [{idx}/{len(pkg.shorts)}] {s.file_name} -> {s.title}")
            try:
                svid = youtube_resumable_upload(
                    access_token=current_token(),
                    video_path=s.video_path,
                    title=s.title,
                    description=s.description,
                    tags=s.tags,
                    privacy_status=args.privacy,
                    publish_at_iso=pub_iso,
                )
            except RuntimeError as err:
                if "quotaExceeded" in str(err) and token_idx + 1 < len(available_tokens):
                    token_idx += 1
                    print(f"  [Quota] Chuyển sang token dự phòng #{token_idx + 1}...")
                    svid = youtube_resumable_upload(
                        access_token=current_token(),
                        video_path=s.video_path,
                        title=s.title,
                        description=s.description,
                        tags=s.tags,
                        privacy_status=args.privacy,
                        publish_at_iso=pub_iso,
                    )
                else:
                    raise

            if not args.skip_shorts_srt and s.srt_path:
                youtube_upload_caption(current_token(), svid, "vi", "Tiếng Việt", s.srt_path)

            receipt.setdefault("shorts", {})[s.file_name] = {
                "videoId": svid,
                "url": f"https://youtube.com/shorts/{svid}",
                "studioEditUrl": f"https://studio.youtube.com/video/{svid}/edit",
                "title": s.title,
                "uploadedAt": datetime.now(VN_TZ).isoformat(),
                "publishAt": pub_iso,
            }
            save_receipt(receipt_path, receipt)
            studio_edit_urls.append(f"https://studio.youtube.com/video/{svid}/edit")

    print(f"\n[Hoàn tất] Đã lưu biên nhận upload tại: {receipt_path}")

    if args.mode == "hybrid" and studio_edit_urls:
        print("\n=== 3. TỰ ĐỘNG GẮN VIDEO LIÊN QUAN CHO SHORTS TRÊN CHROME DEBUG ===")
        short_vids = [
            info["videoId"]
            for info in receipt.get("shorts", {}).values()
            if isinstance(info, dict) and info.get("videoId")
        ]
        if short_vids:
            cdp_auto_link_shorts_related_video(short_vids, pkg.episode_number)
        else:
            open_in_chrome_debug_or_default(studio_edit_urls)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
