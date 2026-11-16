"""Quet ngach: thu thap video moi noi (flat) cho nhieu kenh, giu JSON phuc vu swipe.py.

Dung: python -I _tools/scan_niches.py <plan.json>
plan.json: [{"label": "...", "channels": [{"url": "..."}], "queries": [{"q": "...", "lang": "vi", "n": 30}]}]
"""
import json, sys, os, io, time
sys.stdout.reconfigure(encoding="utf-8")
from yt_dlp import YoutubeDL

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def opts():
    return {
        "quiet": True, "no_warnings": True, "skip_download": True,
        "extract_flat": "in_playlist", "ignoreerrors": True,
        "socket_timeout": 30, "retries": 2,
    }


def scan_channel(url):
    rows = []
    with YoutubeDL(opts()) as y:
        try:
            info = y.extract_info(url, download=False)
        except Exception as e:
            print("  ! channel fail %s: %s" % (url, type(e).__name__), file=sys.stderr)
            return rows
        if not info:
            return rows
        ch = info.get("channel") or info.get("uploader") or info.get("title") or ""
        for e in info.get("entries") or []:
            if not e:
                continue
            rows.append({
                "channel": ch,
                "title": e.get("title") or "",
                "views": e.get("view_count") or 0,
                "url": e.get("url") or "",
                "duration": e.get("duration") or 0,
                "uploaded": e.get("upload_date") or "",
            })
    return rows


def scan_query(q, lang, n):
    rows = []
    with YoutubeDL(opts()) as y:
        try:
            info = y.extract_info("ytsearch%d:%s" % (n, q), download=False)
        except Exception as e:
            print("  ! query fail %s: %s" % (q, type(e).__name__), file=sys.stderr)
            return rows
        for e in ((info.get("entries") or []) if info else []):
            if not e:
                continue
            rows.append({
                "channel": e.get("channel") or e.get("uploader") or "",
                "title": e.get("title") or "",
                "views": e.get("view_count") or 0,
                "url": e.get("url") or e.get("webpage_url") or "",
                "duration": e.get("duration") or 0,
                "uploaded": e.get("upload_date") or "",
                "lang": lang,
            })
    return rows


def main():
    plan = json.load(io.open(sys.argv[1], encoding="utf-8"))
    out = {}
    for grp in plan:
        label = grp["label"]
        rows = []
        for ch in grp.get("channels", []):
            r = scan_channel(ch["url"])
            print("  channel %s -> %d videos" % (ch["url"], len(r)), file=sys.stderr)
            rows += r
            time.sleep(1)
        for q in grp.get("queries", []):
            r = scan_query(q["q"], q.get("lang", "vi"), q.get("n", 30))
            print("  query '%s' -> %d videos" % (q["q"], len(r)), file=sys.stderr)
            rows += r
            time.sleep(1)
        seen = set()
        uniq = []
        for r in rows:
            k = r["url"]
            if k and k not in seen:
                seen.add(k)
                uniq.append(r)
        out[label] = uniq
        print("[%s] total %d" % (label, len(uniq)), file=sys.stderr)
    dest = os.path.join(BASE, "_tools", "niche_scan.json")
    merged = {}
    if os.path.exists(dest):
        try:
            merged = json.load(io.open(dest, encoding="utf-8"))
        except Exception:
            merged = {}
    merged.update(out)
    io.open(dest, "w", encoding="utf-8").write(json.dumps(merged, ensure_ascii=False, indent=1))
    print("WROTE", dest, "groups=", len(merged))


if __name__ == "__main__":
    main()
