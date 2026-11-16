"""Extract local reference frames for visual analysis, not production reuse."""
from pathlib import Path
import json,subprocess,math
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[1]
TOPIC=ROOT/'Chu-De/Be-Mochi-Mam-Xanh'
OUT=TOPIC/'phan-tich-3-video-tham-khao'
OUT.mkdir(exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
report=[]
for n in [1,2,3]:
    file=TOPIC/f'video{n}.mp4'
    folder=OUT/f'video{n}'
    folder.mkdir(exist_ok=True)
    meta=json.loads(subprocess.run(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(file)],capture_output=True,text=True,check=True).stdout)
    duration=float(meta['format']['duration'])
    video=next(s for s in meta['streams'] if s['codec_type']=='video')
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(file),'-vf','fps=1,scale=288:512','-q:v','2',str(folder/'frame-%03d.jpg')],check=True)
    frame_files=sorted(folder.glob('frame-*.jpg'))
    overview=Image.new('RGB',(1152,3*540),(22,29,40));draw=ImageDraw.Draw(overview)
    overview_times=[]
    for i in range(12):
        second=min(len(frame_files)-1,round(i*(len(frame_files)-1)/11))
        overview_times.append(second)
        with Image.open(frame_files[second]) as im:overview.paste(im,((i%4)*288,(i//4)*540))
        draw.text(((i%4)*288+10,(i//4)*540+515),f'Video {n} | ~{second}s',font=font,fill='white')
    overview.save(OUT/f'video{n}-tong-quan.jpg',quality=94)
    samples=list(range(0,len(frame_files),3))
    for page in range(math.ceil(len(samples)/16)):
        sheet=Image.new('RGB',(1152,4*540),(22,29,40));draw=ImageDraw.Draw(sheet)
        for k,second in enumerate(samples[page*16:(page+1)*16]):
            with Image.open(frame_files[second]) as im:sheet.paste(im,((k%4)*288,(k//4)*540))
            draw.text(((k%4)*288+10,(k//4)*540+515),f'Video {n} | ~{second}s',font=font,fill='white')
        sheet.save(OUT/f'video{n}-dien-bien-{page+1}.jpg',quality=94)
    scenes=subprocess.run(['ffmpeg','-hide_banner','-i',str(file),'-vf',"select='gt(scene,0.12)',showinfo",'-an','-f','null','-'],capture_output=True,text=True,encoding='utf-8',errors='replace',check=True)
    import re
    candidates=[float(t) for t in re.findall(r'pts_time:([\d.]+)',scenes.stderr)]
    item={'file':str(file),'durationSeconds':duration,'dimensions':[video['width'],video['height']],'fps':video['avg_frame_rate'],'frames':video.get('nb_frames'),'overviewSeconds':overview_times,'sceneChangeCandidates':candidates,'candidateThreshold':.12,'note':'Scene-change candidates are automated image-change detections; not a confirmed cut list. One-fps frames are approximate timeline samples. No audio listening or full-speed playback represented by this extraction.'}
    report.append(item)
    print(json.dumps(item,ensure_ascii=False),flush=True)
(OUT/'metadata-va-moc-canh.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
