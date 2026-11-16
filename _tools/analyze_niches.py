"""Phan tich niche_scan.json: top video vuot trung vi kenh + cong thuc hook + thong ke nhanh."""
import json, io, os, sys, statistics, collections, re
sys.stdout.reconfigure(encoding="utf-8")

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOKS = os.path.join(BASE, ".agents", "skills", "youtube-agent-skill__yt-script", "hooks.json")
FORMULAS = json.load(io.open(HOOKS, encoding="utf-8"))["hooks"]


def classify(title):
    scored = []
    for f in FORMULAS:
        n = sum(1 for p in f["match"] if re.search(p, title, re.I))
        if n:
            scored.append((n, f["name"]))
    scored.sort(reverse=True)
    return scored[0][1] if scored else "Unclassified"


def fmt_dur(s):
    s = int(s or 0)
    return "%d:%02d" % (s // 60, s % 60)


def analyze(rows):
    bych = collections.defaultdict(list)
    for r in rows:
        if r["views"] > 0:
            bych[r["channel"]].append(r["views"])
    med = {c: statistics.median(v) for c, v in bych.items() if len(v) >= 4}
    out = []
    for r in rows:
        m = med.get(r["channel"])
        if m and m > 0 and r["views"] >= m * 2.0:
            out.append((r["views"] / m, r["channel"], r["views"], m, r))
    out.sort(key=lambda x: -x[0])
    return out, med, bych


def main():
    d = json.load(io.open(os.path.join(BASE, "_tools", "niche_scan.json"), encoding="utf-8"))
    only = sys.argv[1:] if len(sys.argv) > 1 else None
    for label, rows in d.items():
        if only and label not in only:
            continue
        out, med, bych = analyze(rows)
        total = sum(r["views"] for r in rows)
        longs = [r for r in rows if (r["duration"] or 0) >= 480]
        longs_long = [r for r in longs if (r["duration"] or 0) >= 900]
        print("=" * 78)
        print("NGACH: %s" % label)
        mv = int(statistics.median([r["views"] for r in rows])) if rows else 0
        print("  video=%d  kenh=%d  tongluotxem=%s  trungvi_luotxem/video=%s" % (
            len(rows), len(bych), format(total, ","), format(mv, ",")))
        if longs:
            print("  >=8phut: %d video (trungvi %s luot) | >=15phut: %d video" % (
                len(longs), format(int(statistics.median([r["views"] for r in longs])), ","), len(longs_long)))
        dated = [r for r in rows if r.get("uploaded")]
        if dated:
            dated.sort(key=lambda r: r["uploaded"])
            recent = dated[-40:]
            print("  40 video moi nhat (uploaded %s..%s): trungvi %s luot, max %s" % (
                recent[0]["uploaded"], recent[-1]["uploaded"],
                format(int(statistics.median([r["views"] for r in recent])), ","),
                format(max(r["views"] for r in recent), ",")))
        print("  TOP vuot trungvi:")
        for mult, ch, views, m, r in out[:8]:
            print("   x%6.1f  %9s luot (trungvi kenh %s)  %s  [%s] %s  %s" % (
                mult, format(views, ","), format(int(m), ","), fmt_dur(r["duration"]),
                classify(r["title"]), r["title"][:58], ch[:28]))
        top_ch = sorted(med.items(), key=lambda x: -x[1])[:6]
        print("  Kenh manh nhat (trung vi cao): " + ", ".join(
            "%s (%s)" % (c[:26], format(int(v), ",")) for c, v in top_ch))
        print()


if __name__ == "__main__":
    main()
