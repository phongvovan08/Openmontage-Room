"""Prepare existing voice, a shared mix and procedural textures; no API calls."""
from pathlib import Path
import json, re, shutil, subprocess, wave
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT/'remotion-composer/public/episodes/mochi-local-comparison'
OUT = ROOT/'Chu-De/Be-Mochi-Mam-Xanh/so-sanh-svg-va-truyen-tranh'
PUBLIC.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
for name, source in [('regular.ttf','segoeui.ttf'),('bold.ttf','segoeuib.ttf')]:
    shutil.copyfile(Path('C:/Windows/Fonts')/source, PUBLIC/name)
text=(ROOT/'remotion-composer/src/beMochiEp01FullData.ts').read_text(encoding='utf-8')
words=json.loads(re.search(r'MOCHI_EP01_FULL_WORDS[^=]*=\s*(\[[\s\S]*?\]);',text)[1])
words=[w for w in words if w['end']<=109.5]
(PUBLIC/'captions.json').write_text(json.dumps(words,ensure_ascii=False),encoding='utf-8')
(OUT/'loi-ke.txt').write_text(' '.join(w['word'] for w in words)+'\n',encoding='utf-8')

for style, seed in [('svg',2401),('story',7403)]:
    rng=np.random.default_rng(seed)
    noise=np.clip(rng.normal(128,32,(256,256)),0,255).astype('uint8')
    Image.fromarray(noise).save(PUBLIC/f'grain-{style}.png')

sr=48000
sound=np.zeros((114*sr,2),dtype=np.float32)
rng=np.random.default_rng(15)
def add(at, duration, frequency=500, gain=.08, noise=.0):
    n=int(duration*sr); t=np.arange(n)/sr
    envelope=np.sin(np.pi*np.minimum(1,t/.012)/2)*np.exp(-t/max(.015,duration/4))
    signal=(np.sin(2*np.pi*frequency*t)*.7+np.sin(2*np.pi*frequency*2.003*t)*.2+rng.normal(0,noise,n))*envelope*gain
    start=int(at*sr); available=min(n,len(sound)-start)
    if available>0:
        sound[start:start+available,0]+=signal[:available]
        sound[start:start+available,1]+=signal[:available]*.92
for at in [11,16.5,25.5,32.5,44,56.7,68,78.9,86,94.2,103]: add(max(0,at-.06),.24,430+int(at)*3,.055,.35)
for at in [3,5,8,36,39,47,51]: add(at,.07,1900,.018,.8)
add(94.4,.09,950,.07,.4)
add(103.1,.75,1320,.09)
for i,hz in enumerate([523.25,659.25,783.99,1046.5,1318.5]): add(109.6+i*.18,1.8,hz,.055)
with wave.open(str(PUBLIC/'sfx.wav'),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr)
    f.writeframes((np.clip(sound,-1,1)*32767).astype('<i2').tobytes())

voice=ROOT/'remotion-composer/public/episodes/mochi-ep01-full/narration.mp3'
music=ROOT/'remotion-composer/public/episodes/mochi-ep01/audio/building_20.wav'
filters=(
    '[0:a]atrim=end=109.5,asetpts=PTS-STARTPTS,afade=t=out:st=109.35:d=0.15,apad=whole_dur=114[v];'
    '[1:a]atrim=end=114,asetpts=PTS-STARTPTS,volume=0.05,afade=t=in:d=2,afade=t=out:st=110:d=4[m];'
    '[2:a]volume=0.35[s];[v][m][s]amix=inputs=3:duration=longest:normalize=0,atrim=end=114[out]'
)
cmd=['ffmpeg','-y','-v','error','-i',str(voice),'-stream_loop','-1','-i',str(music),'-i',str(PUBLIC/'sfx.wav'),'-filter_complex',filters,'-map','[out]','-ar','48000','-ac','2',str(PUBLIC/'master.wav')]
subprocess.run(cmd,check=True)
shutil.copyfile(PUBLIC/'master.wav',OUT/'am-thanh-so-sanh.wav')
manifest={'durationSeconds':114,'voiceEndSeconds':109.5,'narrationOrigin':'Existing Haitrieu narration, first chapter of full episode; originally produced by Vibi, no new API request.',
          'musicGain':.05,'narrationGain':1,'sfxGain':.35,'wordCount':len(words),'visualSources':'Both styles are newly authored procedural SVG/CSS; no Veo clips or AI-generated raster artwork.'}
(OUT/'nguon-va-thong-so.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(manifest,ensure_ascii=False))
