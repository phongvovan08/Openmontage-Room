"""Stage the original artwork and build sample-aligned sound for a still-art animatic."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json,shutil,subprocess,wave
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/thiet-ke-rieng-tin-nhan'
PUBLIC=ROOT/'remotion-composer/public/episodes/original-paper-story'
PUBLIC.mkdir(parents=True,exist_ok=True)
(OUT/'kiem-tra').mkdir(exist_ok=True)
timeline=json.loads((OUT/'timeline.json').read_text(encoding='utf-8'))
manifest=[]
for scene in timeline['scenes']:
    file=OUT/scene['image'];assert file.exists(),file
    shutil.copyfile(file,PUBLIC/file.name)
    with Image.open(file) as im:
        manifest.append({'id':scene['id'],'file':scene['image'],'width':im.width,'height':im.height,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
for name,source in [('regular.ttf','segoeui.ttf'),('bold.ttf','segoeuib.ttf')]:
    shutil.copyfile(Path('C:/Windows/Fonts')/source,PUBLIC/name)
sr=48000
def decode(file,filters=None):
    cmd=['ffmpeg','-nostdin','-v','error','-i',str(file)]
    if filters:cmd+=['-af',filters]
    return np.frombuffer(subprocess.check_output(cmd+['-ar',str(sr),'-ac','2','-f','f32le','-']),dtype='<f4').reshape(-1,2)
old=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/demo-3-phong-cach-tham-khao/audio'
voice=decode(old/'narration.mp3','atempo=0.86')
music=decode(ROOT/'remotion-composer/public/episodes/mochi-ep01/audio/building_20.wav')[:40*sr]
mix=np.zeros((40*sr,2),dtype=np.float32)
mix[sr:sr+len(voice)]+=voice
t=np.arange(len(music))/sr
mix[:len(music)]+=music*.10*(np.minimum(1,t/2)*np.clip((40-t)/3,0,1))[:,None]
rng=np.random.default_rng(726)
for at in [5.7,10.4,20,23.3,32.3]:
    n=int(.32*sr);tx=np.arange(n)/sr
    noise=rng.normal(0,1,n);noise=np.convolve(noise,np.ones(9)/9,mode='same')
    env=np.sin(np.pi*tx/.32)**2
    sig=noise*env*.028
    start=int((at-.08)*sr);mix[start:start+n,0]+=sig;mix[start:start+n,1]+=sig*.85
for at,freq in [(2.08,1174.66),(27.80,1318.51)]:
    tx=np.arange(int(.7*sr))/sr
    sig=(np.sin(2*np.pi*freq*tx)+.3*np.sin(2*np.pi*freq*2*tx))*np.exp(-tx*8)*np.minimum(1,tx/.01)*.028
    start=int(at*sr);mix[start:start+len(sig),0]+=sig;mix[start:start+len(sig),1]+=sig*.94
assert len(mix)==sr*40 and np.max(np.abs(mix))<1
with wave.open(str(PUBLIC/'master.wav'),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((mix*32767).astype('<i2').tobytes())
(OUT/'audio').mkdir(exist_ok=True)
shutil.copyfile(PUBLIC/'master.wav',OUT/'audio/master-40s.wav')
shutil.copyfile(old/'phu-de-40s.srt',OUT/'audio/phu-de-40s.srt')
(OUT/'asset-manifest.json').write_text(json.dumps({'artworkProvider':'built-in image_gen','referenceVideoFramesUsed':False,'VeoUsed':False,'durationSeconds':40,'voice':'Existing Haitrieu narration, atempo=0.86, one-second lead-in','musicGain':.10,'narrationGain':1,'assets':manifest},ensure_ascii=False,indent=2),encoding='utf-8')
font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',20)
sheet=Image.new('RGB',(1620,1024),'#EDE5D5');draw=ImageDraw.Draw(sheet)
for i,scene in enumerate(timeline['scenes']):
    with Image.open(OUT/scene['image']) as im:sheet.paste(im.resize((270,480)),(i*270,40))
    draw.text((i*270+12,9),f'{scene["id"]} / {scene["from"]}–{scene["to"]}s',font=font,fill='#29333D')
sheet=sheet.crop((0,0,1620,520))
sheet.save(OUT/'kiem-tra/bo-tranh-tong-quan.jpg',quality=95)
print(json.dumps({'assets':len(manifest),'audioSeconds':40,'peak':round(float(np.max(np.abs(mix))),4)}))
