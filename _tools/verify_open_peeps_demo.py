from pathlib import Path
import hashlib,json,subprocess
import numpy as np
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/demo-open-peeps-2d-25d';QA=OUT/'kiem-tra'
result={'videos':[]}
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',18)
for key,name in [('flat','open-peeps-2d-v2-di-lai-40s.mp4'),('depth','open-peeps-2_5d-v2-di-lai-40s.mp4')]:
 file=OUT/name
 meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(file)]))
 video=next(s for s in meta['streams'] if s['codec_type']=='video')
 audio=next(s for s in meta['streams'] if s['codec_type']=='audio')
 subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','null','-'],check=True)
 samples=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(file),'-map','0:a','-f','f32le','-ac','1','-ar','48000','-']),dtype='<f4')
 checks={'duration40s':abs(float(meta['format']['duration'])-40)<.05,'resolution1080p':(video['width'],video['height'])==(1920,1080),'frames1200':int(video['nb_frames'])==1200,'fps30':video['r_frame_rate']=='30/1','h264':video['codec_name']=='h264','aac':audio['codec_name']=='aac','noAudioClipping':float(np.max(np.abs(samples)))<.999,'fullDecode':True}
 canvas=Image.new('RGB',(1440,909),'#e0d8cb');draw=ImageDraw.Draw(canvas)
 times=[3.5,8,15,21.5,25,30,35]
 for i,t in enumerate(times):
  dest=QA/f'{key}-v2-mp4-{t}s.jpg'
  subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(file),'-frames:v','1','-q:v','2',str(dest)],check=True)
  image=Image.open(dest).convert('RGB');assert np.asarray(image).mean()>20
  x=i%3*480;y=i//3*303
  canvas.paste(image.resize((480,270)),(x,y+29));draw.text((x+8,y+3),f'{key} / {t}s',font=font,fill='#263635')
 canvas.save(QA/f'{key}-v2-mp4-contact.jpg',quality=95)
 walk=Image.new('RGB',(1600,520),'#e0d8cb');wd=ImageDraw.Draw(walk)
 for i,t in enumerate([.8,1,1.2,1.4,11.1,11.3,11.5,15.6]):
  dest=QA/f'{key}-v2-walk-mp4-{t}s.jpg'
  subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(file),'-frames:v','1','-q:v','2',str(dest)],check=True)
  x=i%4*400;y=i//4*260;walk.paste(Image.open(dest).convert('RGB').resize((400,225)),(x,y+28));wd.text((x+6,y+3),f'{key} / {t}s',font=font,fill='#263635')
 walk.save(QA/f'{key}-v2-walk-mp4-sheet.jpg',quality=95)
 result['videos'].append({'file':name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'bytes':file.stat().st_size,'duration':meta['format']['duration'],'peakDbFS':round(float(20*np.log10(np.max(np.abs(samples)))),2),'checks':checks})
result['walkChecks']=json.loads((QA/'walk-motion-checks.json').read_text())
result['allPassed']=all(all(v['checks'].values()) for v in result['videos'])
(QA/'verification-v2.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result))
assert result['allPassed']
