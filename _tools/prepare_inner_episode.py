"""Prepare normalized narration, cue-aligned timeline and public Remotion assets."""
from pathlib import Path
import json,re,subprocess,shutil,math,sys,hashlib
import numpy as np
from scipy.io.wavfile import write as write_wav
ROOT=Path(__file__).resolve().parents[1]
EP=ROOT/"Chu-De/Tam-Ly-Noi-Tam/episodes/01-mot-cau-noi-thoang-qua"
ASSETS=ROOT/"Chu-De/Tam-Ly-Noi-Tam/assets/tap-01"
AUDIO=ASSETS/"audio/haitrieu"
PUBLIC=ROOT/"remotion-composer/public/episodes/inner-01"
PROJECT=ROOT/"projects/tam-ly-noi-tam-tap01-v2"
FPS=30
sys.stdout.reconfigure(encoding="utf-8")
def run(args):return subprocess.run(args,capture_output=True,text=True,encoding="utf-8",errors="replace",check=True)
def duration(path):
    return float(json.loads(run(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(path)]).stdout)["format"]["duration"])
def sec(stamp):
    h,m,s,ms=map(int,re.split("[:,]",stamp));return h*3600+m*60+s+ms/1000
def stamp(t):
    ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
def parse(path):
    raw=path.read_text(encoding="utf-8-sig").strip()
    matches=re.findall(r"(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\s*\n(.*?)(?=\n\s*\n|\Z)",raw,re.S)
    return [{"start":sec(a),"end":sec(b),"text":" ".join(t.split())} for a,b,t in matches]
def public(path):
    rel=path.relative_to(ASSETS);dest=PUBLIC/rel;dest.parent.mkdir(parents=True,exist_ok=True)
    if not dest.exists() or dest.stat().st_mtime<path.stat().st_mtime:shutil.copy2(path,dest)
    return "episodes/inner-01/"+rel.as_posix()
def normalize(raw,output):
    if output.exists() and output.stat().st_mtime>=raw.stat().st_mtime:return
    measured=run(["ffmpeg","-hide_banner","-i",str(raw),"-af","aformat=channel_layouts=mono,loudnorm=I=-18:TP=-2:LRA=11:print_format=json","-f","null","-"]).stderr
    d=json.loads(re.search(r'\{\s*"input_i".*?\}',measured,re.S).group(0))
    af=(f"aformat=channel_layouts=mono,loudnorm=I=-18:TP=-2:LRA=11:measured_I={d['input_i']}:measured_TP={d['input_tp']}:"
        f"measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true")
    run(["ffmpeg","-y","-v","error","-i",str(raw),"-af",af,"-ar","44100","-ac","1","-c:a","pcm_s16le",str(output)])
def synthesize_bed():
    out=ASSETS/"music/original-ambient.wav";out.parent.mkdir(parents=True,exist_ok=True)
    if out.exists():return out
    sr=44100;seconds=48;n=sr*seconds;t=np.arange(n)/sr
    left=np.zeros(n);right=np.zeros(n)
    chords=[[146.83,220,293.66,349.23],[130.81,196,261.63,329.63],[174.61,220,261.63,349.23],[130.81,196,293.66,349.23]]
    for j,chord in enumerate(chords):
        start=j*12;local=t-start;env=np.where(local>=0,(1-np.exp(-np.maximum(local,0)/2))*np.exp(-np.maximum(local,0)/7),0)
        for k,f in enumerate(chord):
            a=0.024*(np.sin(2*np.pi*f*t)+0.12*np.sin(4*np.pi*f*t))
            left+=a*env;right+=0.024*(np.sin(2*np.pi*f*1.0003*t+0.11*k)+0.12*np.sin(4*np.pi*f*t))*env
        for k,f in enumerate(chord):
            hit=t-(start+k*2.15);e=np.where(hit>=0,np.exp(-np.maximum(hit,0)/2.3)*(1-np.exp(-np.maximum(hit,0)*35)),0)
            tone=0.022*(np.sin(2*np.pi*f*2*t)+0.24*np.sin(2*np.pi*f*4*t))*e
            left+=tone;right+=tone*0.8
    fade=np.minimum(1,t/2)*np.minimum(1,(seconds-t)/3)
    audio=np.stack([left*fade,right*fade],axis=1)
    audio*=0.115/max(0.001,np.max(np.abs(audio)))
    write_wav(str(out),sr,(audio*32767).astype(np.int16))
    sfx=ASSETS/"sfx";sfx.mkdir(exist_ok=True)
    tt=np.arange(round(sr*0.11))/sr
    click=0.06*np.sin(2*np.pi*(1000*tt-2000*tt*tt))*np.exp(-tt*65)*(1-np.exp(-tt*600))
    write_wav(str(sfx/"soft-click.wav"),sr,(click*32767).astype(np.int16))
    return out
def main():
    PUBLIC.mkdir(parents=True,exist_ok=True)
    meta=json.loads((EP/"script-metadata.json").read_text(encoding="utf-8"))
    stock=json.loads((ASSETS/"stock-manifest.json").read_text(encoding="utf-8"))["assets"]
    stock_by={a["id"]:a for a in stock}
    chapters=[];cues=[];words=[];parts=[];offset=0;audio_qc=[]
    for i,ch in enumerate(meta["chapters"],1):
        label=f"ch{i:02d}";raw=AUDIO/(label+".raw.mp3");wav=AUDIO/(label+".normalized.wav")
        normalize(raw,wav);d=duration(wav);local=parse(AUDIO/(label+".srt"))
        assert local and all(c["end"]>c["start"] for c in local),label
        last=max(c["end"] for c in local)
        tail=max(0,last-d)+0.25+(0.15 if i<9 else 1.5)
        padded=AUDIO/(label+".padded.wav")
        if not padded.exists() or padded.stat().st_mtime<wav.stat().st_mtime:
            run(["ffmpeg","-y","-v","error","-i",str(wav),"-af",f"apad=pad_dur={tail:.5f}","-c:a","pcm_s16le",str(padded)])
        full=duration(padded);parts.append(padded)
        chapters.append({"id":i,"name":ch["name"],"start":round(offset,6),"end":round(offset+full,6)})
        for c in local:
            cue={**c,"start":round(offset+c["start"],6),"end":round(offset+c["end"],6),"chapterId":i};cues.append(cue)
            tokens=c["text"].split();span=(c["end"]-c["start"])/len(tokens)
            for k,w in enumerate(tokens):
                words.append({"word":w,"startMs":round((offset+c["start"]+k*span)*1000),"endMs":round((offset+c["start"]+(k+1)*span)*1000),"pageBreakAfter":k==len(tokens)-1})
        audio_qc.append({"chapter":i,"duration_raw":duration(raw),"duration_normalized":d,"duration_with_gap":full,"cues":len(local),"srt_end":last})
        offset+=full
        print(f"Prepared {label}: {full:.2f}s",flush=True)
    concat=AUDIO/"concat.txt";concat.write_text("".join("file '"+p.as_posix()+"'\n" for p in parts),encoding="utf-8")
    narration=AUDIO/"narration-haitrieu.wav"
    if not narration.exists() or narration.stat().st_mtime<max(p.stat().st_mtime for p in parts):
        run(["ffmpeg","-y","-v","error","-f","concat","-safe","0","-i",str(concat),"-c:a","pcm_s16le",str(narration)])
    offset=duration(narration);chapters[-1]["end"]=offset
    srt=AUDIO/"narration-haitrieu.srt";srt.write_text("".join(f"{i}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c['text']}\n\n" for i,c in enumerate(cues,1)),encoding="utf-8")
    (AUDIO/"captions.words.json").write_text(json.dumps({"timing_method":"Each exported Vibi SRT cue split into words with interpolated timing; word timing is approximate.","captions":words},ensure_ascii=False,indent=2),encoding="utf-8")
    bed=synthesize_bed()
    for path in [ASSETS/"ai/bedroom-night.png",ASSETS/"fonts/BeVietnamPro-Regular.ttf",ASSETS/"fonts/BeVietnamPro-SemiBold.ttf",bed,ASSETS/"sfx/soft-click.wav"]:public(path)
    pools={
        1:["6940967","6279142","3727447","7628845"],2:["7252685","5970593","7448472","7693468","8126001"],
        3:["7252685","5970593","7279195","4992563"],4:["8550694","4710717","6279142","7628845"],
        5:["6279142","5212605","6781562","6940967"],6:["7279195","6781562","6940967","3727447"],
        7:["4992563","7224885","7204590","7252685","7448472","8126001","5970593","7279195"],
        8:["5212605","6781562","7628845","6279142"],9:["8550694","4710717","7204590","5592509","6279142"]}
    beats=[];beatindex=0;previous_kind="";same_kind=0
    image=public(ASSETS/"ai/bedroom-night.png")
    for ch in chapters:
        chapter_cues=[c for c in cues if c["chapterId"]==ch["id"]]
        groups=[];group=[]
        for cue in chapter_cues:
            group.append(cue)
            if cue["end"]-group[0]["start"]>=10.0:groups.append(group);group=[]
        if group:
            if groups and group[-1]["end"]-group[0]["start"]<4:groups[-1].extend(group)
            else:groups.append(group)
        for j,group in enumerate(groups):
            start=ch["start"] if j==0 else groups[j-1][-1]["end"]
            end=ch["end"] if j==len(groups)-1 else group[-1]["end"]
            spoken=" ".join(c["text"] for c in group);cid=ch["id"]
            beat={"id":f"beat-{beatindex:03d}","start":round(start,6),"end":round(end,6),"chapterId":cid,"kind":"footage"}
            sid=pools[cid][j%len(pools[cid])];a=stock_by["stock-"+sid]
            beat.update({"media":public(ASSETS/a["path"]),"mediaDuration":a["duration_seconds"],"mediaStart":0,"sourceCredit":"Pexels · "+a["creator"]})
            if cid==1 and j==0:
                beat.update({"kind":"phone","title":"02:07","text":"Về chuyện lúc họp, em muốn nói là…","media":image,"sourceCredit":"Tình huống hư cấu · Hình ảnh minh họa AI"})
            elif cid==1 and j in [1,len(groups)-1]:
                beat.update({"kind":"image","media":image,"sourceCredit":"Hình ảnh minh họa AI · OpenMontage"})
            elif cid==2 and "Em nghĩ đơn giản quá" in spoken:
                beat.update({"kind":"question","title":"Em nghĩ đơn giản quá.","text":"Một lời góp ý còn bỏ lửng.","media":image,"sourceCredit":"Tình huống hư cấu · Hình ảnh minh họa"})
            elif cid==3 and j==len(groups)//2:
                beat.update({"kind":"question","title":"Đề xuất thiếu ở đâu?","text":"Phần còn chưa được nói rõ.","sourceCredit":""})
            elif cid==4 and ("Mình trình bày" in spoken or "kém từ lâu" in spoken):
                beat.update({"kind":"comparison","title":"Lời đã nghe · Điều đang suy đoán","left":"“Em nghĩ đơn giản quá.”","right":"“Mọi người nghĩ mình không đủ năng lực.”","sourceCredit":""})
            elif cid==5 and ("nghiên cứu" in spoken or "rumination" in spoken):
                a=stock_by["wikimedia-sleeping-man"];beat.update({"kind":"source","title":"Khi một suy nghĩ cứ quay lại","text":"Suy nghĩ lặp lại có liên hệ với căng thẳng trước ngủ; không giải thích mọi đêm khó ngủ.","media":public(ASSETS/a["path"]),"sourceCredit":"Minh họa nghệ thuật: John Singer Sargent · MET CC0 | Nguồn: Tousignant và cs., 2019"})
            elif cid==5 and ("Dòng" in spoken or "dòng" in spoken or "ghi chú" in spoken or "phần cần" in spoken):
                beat.update({"kind":"note","title":"GHI CHÚ · TỐI NAY","lines":["“Em nghĩ đơn giản quá.”","Mình sợ mọi người nghĩ mình không đủ năng lực.","Mình chưa biết đề xuất thiếu ở đâu."],"sourceCredit":""})
            elif cid==6 and j in [0,1]:
                beat.update({"kind":"note","title":"HỎI SÁNG MAI","lines":["Chị giúp em chỉ ra hai chỗ cần sửa trước được không?","Trao đổi riêng sau lịch đầu ngày."],"sourceCredit":""})
            elif cid==7 and ("Em nghĩ đơn giản quá" in spoken):
                beat.update({"kind":"question","title":"Chị chỉ giúp em hai chỗ cần sửa?","text":"Một câu hỏi cụ thể, nói trong cuộc trao đổi riêng.","media":public(ASSETS/"stock/pexels-7252685.mp4"),"mediaDuration":stock_by["stock-7252685"]["duration_seconds"],"sourceCredit":""})
            elif cid==7 and ("chỗ đầu tiên" in spoken or "chỗ thứ hai" in spoken):
                beat.update({"kind":"note","title":"HAI VIỆC ĐỂ SỬA ĐỀ XUẤT","lines":["Tách trường hợp dùng mẫu và trường hợp xử lý riêng.","Ghi rõ người tiếp nhận và cách chuyển vấn đề khó."],"sourceCredit":""})
            elif cid==8 and j==1:
                beat.update({"kind":"question","title":"Một câu hỏi rõ hơn.","text":"Không bảo đảm người khác sẽ phản hồi tử tế.","sourceCredit":""})
            elif cid==9 and j==len(groups)-1:
                beat.update({"kind":"footage","media":public(ASSETS/"stock/pexels-7204590.mp4"),"mediaDuration":stock_by["stock-7204590"]["duration_seconds"],"sourceCredit":"Pexels · "+stock_by["stock-7204590"]["creator"]})
            # Break long sequences of the same visual grammar with restrained text or an illustrative image.
            if beat["kind"]==previous_kind:same_kind+=1
            else:same_kind=1
            if same_kind>=3:
                if cid in [1,6]:beat.update({"kind":"image","media":image,"sourceCredit":"Hình ảnh minh họa AI · OpenMontage"})
                else:
                    beat.update({"kind":"question","title":ch["name"],"text":"","sourceCredit":""})
                same_kind=1
            # Recognizable stock actors must not be cast as the person making a hurtful remark.
            if cid == 2 or (cid == 7 and j != 4):
                if any(pid in beat.get("media", "") for pid in ["7448472", "7693468", "8126001"]):
                    safe = stock_by["stock-7252685" if j % 2 else "stock-5970593"]
                    beat.update({"media": public(ASSETS/safe["path"]), "mediaDuration": safe["duration_seconds"], "sourceCredit": "Pexels · "+safe["creator"]})
            previous_kind=beat["kind"]
            beats.append(beat);beatindex+=1
    # Explicit known-in-frame credits are preserved per beat; complete source links live in description.
    props={"durationSeconds":offset,"narration":public(narration),"music":public(bed),
        "fontRegular":"episodes/inner-01/fonts/BeVietnamPro-Regular.ttf","fontSemibold":"episodes/inner-01/fonts/BeVietnamPro-SemiBold.ttf",
        "chapters":chapters,"beats":beats,"captions":words,
        "sfx":[{"src":"episodes/inner-01/sfx/soft-click.wav","start":b["start"]+0.15,"volume":0.18} for b in beats if b["kind"]=="phone"]}
    props_path=ROOT/"remotion-composer/public/demo-props/inner-01-haitrieu.json"
    props_path.write_text(json.dumps(props,ensure_ascii=False,indent=2),encoding="utf-8")
    (PROJECT/"artifacts/scene-plan-timed.json").write_text(json.dumps({"chapters":chapters,"beats":beats},ensure_ascii=False,indent=2),encoding="utf-8")
    (AUDIO/"audio-qc.json").write_text(json.dumps({"chapters":audio_qc,"duration_seconds":offset,"subtitle_cues":len(cues),"word_captions":len(words),"word_timing":"interpolated_from_exported_SRT"},ensure_ascii=False,indent=2),encoding="utf-8")
    assets=[]
    for a in stock:
        assets.append({"id":a["id"],"type":a["type"],"path":str((ASSETS/a["path"]).relative_to(ROOT)),"source_tool":a["source_tool"],"scene_id":a.get("scene_id","all"),"provider":"pexels" if a["type"]=="video" else "wikimedia","license":a["license"],"original_url":a.get("source_url",a.get("original_url",""))})
    assets.extend([{"id":"ai-bedroom","type":"image","path":str((ASSETS/"ai/bedroom-night.png").relative_to(ROOT)),"source_tool":"image_gen.imagegen","scene_id":"chapter-01","provider":"built-in imagegen","subtype":"fictional illustration"},{"id":"haitrieu-narration","type":"narration","path":str(narration.relative_to(ROOT)),"source_tool":"_tools/vibi_tts.py","scene_id":"all","provider":"vibi/minimax","model":"speech-2.8-hd","duration_seconds":offset},{"id":"original-music","type":"music","path":str(bed.relative_to(ROOT)),"source_tool":"local procedural synthesis","scene_id":"all","license":"Original generated for this episode"}])
    manifest={"version":"1.0","assets":assets,"metadata":{"props":str(props_path.relative_to(ROOT)),"voice":"Haitrieu","word_timing":"Interpolated within Vibi sentence SRT cues; approximate word highlighting."}}
    (PROJECT/"artifacts/asset-manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"duration":offset,"minutes":offset/60,"chapters":len(chapters),"beats":len(beats),"captions":len(words),"props":str(props_path)},ensure_ascii=False),flush=True)
if __name__=="__main__":main()

