"""Prepare a controlled 40-second comparison: one voice/mix, three original worlds."""
from pathlib import Path
import json, shutil, subprocess, wave
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/demo-3-phong-cach-tham-khao'
PUBLIC=ROOT/'remotion-composer/public/episodes/mochi-three-styles'
PUBLIC.mkdir(parents=True,exist_ok=True)
SPEED=.86
DELAY=1.0
data=json.loads((OUT/'audio/tts_result.json').read_text(encoding='utf-8'))
words=[{'word':w['word'],'start':round(w['start']/SPEED+DELAY,4),'end':round(w['end']/SPEED+DELAY,4),'pageBreakAfter':w.get('pageBreakAfter',False)} for w in data['word_timestamps']]
(ROOT/'remotion-composer/src/mochi-three-styles/words.json').parent.mkdir(parents=True,exist_ok=True)
(ROOT/'remotion-composer/src/mochi-three-styles/words.json').write_text(json.dumps(words,ensure_ascii=False),encoding='utf-8')
for name,source in [('regular.ttf','segoeui.ttf'),('bold.ttf','segoeuib.ttf')]:
    shutil.copyfile(Path('C:/Windows/Fonts')/source,PUBLIC/name)
for i,name in enumerate(['flat','office','world']):
    noise=np.clip(np.random.default_rng(908+i*113).normal(128,30,(256,256)),0,255).astype('uint8')
    Image.fromarray(noise).save(PUBLIC/f'grain-{name}.png')
sr=48000
sound=np.zeros((40*sr,2),dtype=np.float32)
rng=np.random.default_rng(388)
def add(at,duration,hz,gain=.06,noise=0):
    n=int(duration*sr);t=np.arange(n)/sr
    e=np.minimum(1,t/.009)*np.exp(-t/max(.015,duration/4))
    s=(np.sin(2*np.pi*hz*t)+.24*np.sin(2*np.pi*hz*2.001*t)+rng.normal(0,noise,n))*e*gain
    j=int(at*sr);n=min(n,len(sound)-j)
    sound[j:j+n,0]+=s[:n];sound[j:j+n,1]+=s[:n]*.92
for at in [.25,.63,1.01,1.39,1.77]:add(at,.10,100,.04,.45)
for at in [2.05,27.9]:
    add(at,.4,1175,.055);add(at+.11,.5,1568,.04)
for at in [5.8,7.5,9.0,10.5,15.0]:add(at,.16,380,.035,.4)
add(25.3,.26,740,.045)
for i,h in enumerate([523.25,659.25,783.99,1046.5]):add(32.5+i*.16,1.9,h,.035)
with wave.open(str(PUBLIC/'sfx.wav'),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr)
    f.writeframes((np.clip(sound,-1,1)*32767).astype('<i2').tobytes())
music=ROOT/'remotion-composer/public/episodes/mochi-ep01/audio/building_20.wav'
def decode(file,filters=None):
    cmd=['ffmpeg','-nostdin','-v','error','-i',str(file)]
    if filters:cmd+=['-af',filters]
    cmd+=['-ar',str(sr),'-ac','2','-f','f32le','-']
    return np.frombuffer(subprocess.check_output(cmd),dtype='<f4').reshape(-1,2)
# Mix by sample index so the one-second opening silence cannot be removed by
# timestamp normalization in an amix/adelay graph.
voice=decode(OUT/'audio/narration.mp3',f'atempo={SPEED}')
bed=decode(music)[:40*sr]
mix=sound*.65
start=int(DELAY*sr);available=min(len(voice),len(mix)-start)
mix[start:start+available]+=voice[:available]
timeline=np.arange(len(bed))/sr
envelope=np.minimum(1,timeline/2)*np.clip((40-timeline)/3,0,1)
mix[:len(bed)]+=bed*.10*envelope[:,None]
assert len(mix)==40*sr and float(np.max(np.abs(mix)))<1
with wave.open(str(PUBLIC/'master.wav'),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr)
    f.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
shutil.copyfile(PUBLIC/'master.wav',OUT/'audio/master-40s.wav')
def stamp(s):
    ms=round(s*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
pages=[];p=[]
for w in words:
    p.append(w)
    if w['pageBreakAfter'] or len(p)>=5:
        pages.append(p);p=[]
if p:pages.append(p)
(OUT/'audio/phu-de-40s.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(p[0]["start"])} --> {stamp(p[-1]["end"])}\n'+ ' '.join(w['word'] for w in p) for i,p in enumerate(pages))+'\n',encoding='utf-8')
print(json.dumps({'seconds':40,'words':len(words),'lastWordEnd':words[-1]['end'],'tempo':SPEED,'voiceGain':1,'musicGain':.10,'VeoUsed':False}))
