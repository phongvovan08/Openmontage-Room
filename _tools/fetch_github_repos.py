import json, io, os, sys, urllib.request, urllib.error, time

sys.stdout.reconfigure(encoding="utf-8")

REPOS = [
    "bangtutorial/bang-motion",
    "kaomei/stickman-video-director",
    "CopilotKit/openbot",
    "filippocalippo/StykAnimate-App",
    "krillinai/OpenCreator",
    "mromidev/claude-animated-shorts",
    "howznguyen/shorts-kit",
    "sonlovinbot-team/Muse-animated-short-film",
    "useapi/muse-api",
    "CopilotKit/openmuse",
    "d4ncboz/museai",
    "sarpstar/cinecode",
    "OpenMontageInc/OpenMontage",
    "d4vinci/Scrapling",
    "jakeschincariol/youtube-agent-skill",
    "harry0703/MoneyPrinterTurbo",
    "Cuongyd196/cit-voice-studio",
    "morluto/rea",
    "JuneYaooo/rea-video",
]

HDRS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Accept": "application/vnd.github+json"}

def get(url, raw=False):
    req = urllib.request.Request(url, headers=HDRS)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
            return data.decode("utf-8", "replace") if raw else json.loads(data.decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"__http_error__": e.code, "__url__": url}
    except Exception as e:
        return {"__error__": str(e), "__url__": url}

out = {}
for repo in REPOS:
    print("Fetching", repo, flush=True)
    meta = get("https://api.github.com/repos/" + repo)
    rec = {"repo": repo}
    if "__http_error__" in meta or "__error__" in meta:
        rec["error"] = meta
        out[repo] = rec
        continue
    rec.update({
        "full_name": meta.get("full_name"),
        "description": meta.get("description"),
        "homepage": meta.get("homepage"),
        "language": meta.get("language"),
        "topics": meta.get("topics"),
        "stars": meta.get("stargazers_count"),
        "forks": meta.get("forks_count"),
        "open_issues": meta.get("open_issues_count"),
        "size_kb": meta.get("size"),
        "created_at": meta.get("created_at"),
        "updated_at": meta.get("updated_at"),
        "pushed_at": meta.get("pushed_at"),
        "license": (meta.get("license") or {}).get("spdx_id"),
        "default_branch": meta.get("default_branch"),
        "archived": meta.get("archived"),
        "owner_type": (meta.get("owner") or {}).get("type"),
    })
    # root contents
    contents = get("https://api.github.com/repos/%s/contents/" % repo)
    if isinstance(contents, list):
        rec["root_files"] = [
            {"name": c.get("name"), "type": c.get("type"), "size": c.get("size")}
            for c in contents[:80]
        ]
    else:
        rec["root_files"] = contents
    # languages
    langs = get("https://api.github.com/repos/%s/languages" % repo)
    if isinstance(langs, dict) and "__http_error__" not in langs:
        rec["languages"] = langs
    # README
    branch = rec.get("default_branch") or "main"
    rm = get("https://raw.githubusercontent.com/%s/%s/README.md" % (repo, branch), raw=True)
    if isinstance(rm, str) and not rm.startswith("404:"):
        rec["readme"] = rm[:6000]
    else:
        rm2 = get("https://raw.githubusercontent.com/%s/%s/readme.md" % (repo, branch), raw=True)
        rec["readme"] = rm2[:6000] if isinstance(rm2, str) else ""
    out[repo] = rec
    time.sleep(0.4)

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "github_repos.json")
with io.open(path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print("WROTE", path)
for r, v in out.items():
    if "error" in v:
        print("  !!", r, v["error"])
    else:
        print("  ok", r, "| stars", v.get("stars"), "| lang", v.get("language"), "| pushed", v.get("pushed_at"))
