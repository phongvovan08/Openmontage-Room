import json, io, os, re, sys, urllib.request, urllib.error, time

sys.stdout.reconfigure(encoding="utf-8")

REPOS = [
    "OpenMontageInc/OpenMontage",
    "d4vinci/Scrapling",
    "jakeschincariol/youtube-agent-skill",
    "harry0703/MoneyPrinterTurbo",
    "Cuongyd196/cit-voice-studio",
    "morluto/rea",
    "JuneYaooo/rea-video",
]

HDRS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}

def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers=HDRS)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")

def parse(html):
    d = {}
    m = re.search(r'<meta name="description" content="([^"]*)"', html)
    if m:
        d["meta_description"] = m.group(1)
    m = re.search(r'<meta property="og:description" content="([^"]*)"', html)
    if m:
        d["og_description"] = m.group(1)
    m = re.search(r'<meta property="og:title" content="([^"]*)"', html)
    if m:
        d["og_title"] = m.group(1)
    m = re.search(r'([\d,\.]+k?)\s*</span>\s*\n?\s*</a>\s*\n?\s*<span[^>]*>\s*stars', html, re.I)
    stars = re.findall(r'id="repo-stars-counter-star"[^>]*title="([\d,]+)"', html)
    if stars:
        d["stars"] = stars[0]
    forks = re.findall(r'id="repo-network-counter"[^>]*title="([\d,]+)"', html)
    if forks:
        d["forks"] = forks[0]
    lic = re.findall(r'([A-Za-z0-9\-\. ]+)\s+license', html)
    if lic:
        d["license_guess"] = lic[0].strip()
    langs = re.findall(r'<span class="color-fg-default text-bold mr-1">([A-Za-z0-9+#\-\. ]+)</span>\s*([\d\.]+)%', html)
    if langs:
        d["languages"] = [{"lang": a.strip(), "pct": float(b)} for a, b in langs][:6]
    # commits
    cm = re.search(r'([\d,]+)\s*Commits?', html)
    if cm:
        d["commits"] = cm.group(1)
    # about description block
    ab = re.findall(r'<p class="f4 my-3">([^<]{20,400})</p>', html)
    if ab:
        d["about"] = [s.strip() for s in ab[:3]]
    return d

out = {}
for repo in REPOS:
    rec = {"repo": repo}
    print("==", repo, flush=True)
    for branch in ("main", "master"):
        try:
            raw = fetch("https://raw.githubusercontent.com/%s/%s/README.md" % (repo, branch))
            rec["readme_head"] = raw[:3500]
            rec["readme_branch"] = branch
            rec["readme_len"] = len(raw)
            break
        except Exception as e:
            rec.setdefault("readme_errors", []).append("%s: %s" % (branch, e))
    try:
        html = fetch("https://github.com/" + repo)
        rec["page"] = parse(html)
    except Exception as e:
        rec["page_error"] = str(e)
    out[repo] = rec
    time.sleep(0.6)

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "github_repos_html.json")
with io.open(path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print("WROTE", path)
for r, v in out.items():
    p = v.get("page", {})
    print(" ", r, "| stars", p.get("stars"), "| license", p.get("license_guess"), "| commits", p.get("commits"), "| readme_len", v.get("readme_len"))
