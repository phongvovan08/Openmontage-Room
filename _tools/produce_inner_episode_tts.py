"""Resume-safe episode narration with the existing Vibi helper; no duplicate POST retries."""
from pathlib import Path
import importlib.util,json,sys,time,urllib.request,hashlib
ROOT=Path(__file__).resolve().parents[1]
EP=ROOT/"Chu-De/Tam-Ly-Noi-Tam/episodes/01-mot-cau-noi-thoang-qua"
OUT=ROOT/"Chu-De/Tam-Ly-Noi-Tam/assets/tap-01/audio/haitrieu"
OUT.mkdir(parents=True,exist_ok=True)
JOURNAL=OUT/"vibi-tasks.json"
spec=importlib.util.spec_from_file_location("vibi_workspace",ROOT/"_tools/vibi_tts.py")
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
sys.stdout.reconfigure(encoding="utf-8")
VOICE="1ad2682d-1c78-4bb2-8061-b7cc216362c9"
def save(d): JOURNAL.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding="utf-8")
def post_once(body):
    request=urllib.request.Request(v.API+"/v1/text-to-speech/"+VOICE,method="POST",
        data=json.dumps(body,ensure_ascii=False).encode("utf-8"),
        headers={"xi-api-key":v.api_key(),"Content-Type":"application/json","User-Agent":v.USER_AGENT})
    with urllib.request.urlopen(request,timeout=75) as r:return json.loads(r.read())
def main():
    text=(EP/"LOI_DAN.txt").read_text(encoding="utf-8").strip()
    meta=json.loads((EP/"script-metadata.json").read_text(encoding="utf-8"))
    positions=[text.index(c["opening_line"]) for c in meta["chapters"]]
    sections=[text[positions[i]:positions[i+1] if i+1<len(positions) else len(text)].strip() for i in range(len(positions))]
    digest=hashlib.sha256(text.encode()).hexdigest()
    state=json.loads(JOURNAL.read_text(encoding="utf-8")) if JOURNAL.exists() else {
        "script_sha256":digest,"voice_name":"Haitrieu","voice_id":VOICE,
        "provider":"minimax","model_id":"speech-2.8-hd","voice_settings":{"speed":1.0,"pitch":0,"vol":1},
        "runs":{},"credit_balance_before":v.call("GET","/v1/auth/me").get("credit_balance")}
    assert state["script_sha256"]==digest,"Narration script changed; review before submitting new tasks."
    save(state)
    for i,section in enumerate(sections,1):
        key=f"ch{i:02d}"
        (OUT/(key+".txt")).write_text(section+"\n",encoding="utf-8")
        run=state["runs"].setdefault(key,{})
        if run.get("task_id"):continue
        if run.get("submission_started"):raise RuntimeError("Ambiguous submission for "+key+"; inspect history before retry.")
        body={"text":section,"provider":"minimax","model_id":"speech-2.8-hd","language_code":"Vietnamese",
            "voice_settings":state["voice_settings"],"export_transcript":True}
        run.update({"submission_started":True,"characters":len(section)})
        save(state)
        task=post_once(body);run.update({"task_id":task["id"],"status":task.get("status")});save(state)
        print(key+": submitted",flush=True)
    pending={key for key in state["runs"] if not ((OUT/(key+".raw.mp3")).exists() and (OUT/(key+".srt")).exists())}
    deadline=time.monotonic()+900
    while pending:
        if time.monotonic()>deadline:raise TimeoutError("Retain task journal; rerun to resume polling.")
        tasks=v.call("GET","/v1/history?page_size=100&page=0").get("tasks",[])
        by_id={task["id"]:task for task in tasks}
        for key in list(pending):
            run=state["runs"][key];task=by_id.get(run["task_id"]) or v.call("GET","/v1/history/"+run["task_id"])
            status=task.get("status")
            if status!=run.get("status"):print(key+": "+str(status),flush=True)
            run["status"]=status;save(state)
            if status=="failed":
                run["error"]=task.get("error");save(state);raise RuntimeError(key+" failed; no auto resubmit")
            if status!="completed":continue
            result=task.get("result") or {};srt=v.srt_url(result)
            if not srt:raise RuntimeError("Missing SRT; inspect completed task "+key)
            (OUT/(key+".raw.mp3")).write_bytes(v.download(result["audio_url"]))
            (OUT/(key+".srt")).write_text(v.download(srt).decode("utf-8-sig"),encoding="utf-8")
            run["settings_returned"]=(task.get("metadata") or {}).get("voice_settings")
            save(state);pending.remove(key);print(key+": MP3 + SRT saved",flush=True)
        if pending:time.sleep(4)
    state["credit_balance_after"]=v.call("GET","/v1/auth/me").get("credit_balance")
    state["observed_balance_delta"]=state["credit_balance_before"]-state["credit_balance_after"]
    save(state)
    print("All nine chapters downloaded.",flush=True)
if __name__=="__main__": main()

