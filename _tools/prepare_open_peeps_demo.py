"""Fetch only CC0 Open Peeps artwork, prepare independent casts and sound mixes."""
from pathlib import Path
import concurrent.futures, hashlib, json, re, shutil, subprocess, urllib.request, wave
import numpy as np

def absolute_path(d):
    tokens=re.findall(r'[AaCcHhLlMmQqSsTtVvZz]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?',d)
    counts={'M':2,'L':2,'H':1,'V':1,'C':6,'S':4,'Q':4,'T':2,'A':7}
    i=0;x=y=sx=sy=0;last='';control=None;result=[];cmd=None
    while i<len(tokens):
        if tokens[i].isalpha():
            cmd=tokens[i];i+=1
            if cmd.upper()=='Z':
                result.append({'cmd':'Z','v':[]});x,y=sx,sy;last='Z';control=None;continue
        kind=cmd.upper();n=counts[kind];v=list(map(float,tokens[i:i+n]));i+=n
        rel=cmd.islower();ox,oy=x,y
        if kind=='H':v=[v[0]+(x if rel else 0),y];kind='L'
        elif kind=='V':v=[x,v[0]+(y if rel else 0)];kind='L'
        elif kind=='A':
            if rel:v[5]+=x;v[6]+=y
        else:
            if rel:
                for j in range(0,n,2):v[j]+=ox;v[j+1]+=oy
        if kind=='S':
            c=[2*x-control[0],2*y-control[1]] if last=='C' and control else [x,y]
            v=c+v;kind='C'
        elif kind=='T':
            c=[2*x-control[0],2*y-control[1]] if last=='Q' and control else [x,y]
            v=c+v;kind='Q'
        x,y=v[-2:]
        if kind=='M':sx,sy=x,y;cmd='l' if rel else 'L'
        control=v[-4:-2] if kind in ['C','Q'] else None
        result.append({'cmd':kind,'v':v});last=kind
    return result

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/demo-open-peeps-2d-25d'
PUBLIC=ROOT/'remotion-composer/public/episodes/open-peeps-demo'
SRC=ROOT/'remotion-composer/src/open-peeps'
BASE='https://raw.githubusercontent.com/Hantuhan/peepstudio/main/public/peeps/atoms/'
CAST={
 'flat': {'head':['short-1'], 'face':['serious','concerned','eyes-closed','smile'],
          'body':['device','hoodie','explaining'], 'pose/standing':['shirt-1','crossed-arms-1']},
 'depth':{'head':['wavy'], 'face':['suspicious','fear','calm','cute'],
          'body':['coffee','sweater','pointing-up'], 'pose/standing':['resting-2','easing-2']},
}
for p in [OUT,PUBLIC,SRC,OUT/'kiem-tra']: p.mkdir(parents=True,exist_ok=True)

def fetch(task):
 style,category,name=task
 url=BASE+category+'/'+name+'.svg'
 data=urllib.request.urlopen(url,timeout=45).read()
 folder=OUT/'assets'/style/category
 folder.mkdir(parents=True,exist_ok=True)
 (folder/(name+'.svg')).write_bytes(data)
 text=data.decode('utf-8')
 inner=re.sub(r'^.*?<svg\b[^>]*>','',text,flags=re.S)
 inner=re.sub(r'</svg>\s*$','',inner)
 inner=re.sub(r'<title>.*?</title>','',inner,flags=re.S)
 # Original art, independent composition code. CSS variables preserve color regions.
 inner=re.sub(r'fill="(?:#000|#000000|#231f20)"','fill="var(--ink)"',inner,flags=re.I)
 inner=re.sub(r'fill="(?:#fff|#ffffff)"','fill="var(--paper)"',inner,flags=re.I)
 if category=='head':
  inner=re.sub(r'(id="🎨-Background" fill=")[^"]+',r'\1var(--skin)',inner)
  inner=inner.replace('var(--ink)','var(--hair)')
 elif category.startswith(('body','pose')):
  inner=re.sub(r'(id="🎨-Background" fill=")[^"]+',r'\1var(--cloth)',inner)
 return style,category,name,inner,{'style':style,'category':category,'name':name,'url':url,'sha256':hashlib.sha256(data).hexdigest()}

tasks=[(s,c,n) for s,cats in CAST.items() for c,names in cats.items() for n in names]
art={s:{} for s in CAST}; manifest=[]
for s,c,n,inner,record in concurrent.futures.ThreadPoolExecutor(max_workers=6).map(fetch,tasks):
 art[s][c+'/'+n]=inner;manifest.append(record)
(SRC/'art.json').write_text(json.dumps(art,ensure_ascii=False),encoding='utf-8')
deform={}
for style,key in [('flat','body/device'),('depth','body/coffee')]:
    paths=[]
    def compile_path(m):
        index=len(paths);paths.append(absolute_path(m.group(1)))
        return ' d="__d'+str(index)+'__"'
    template=re.sub(r'\sd="([^"]+)"',compile_path,art[style][key])
    deform[style]={'template':template,'paths':paths}
(SRC/'deform.json').write_text(json.dumps(deform,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
words=json.loads((ROOT/'remotion-composer/src/mochi-three-styles/words.json').read_text(encoding='utf-8'))
(SRC/'words.json').write_text(json.dumps(words,ensure_ascii=False),encoding='utf-8')
for name,source in [('regular.ttf','segoeui.ttf'),('bold.ttf','segoeuib.ttf')]:
 shutil.copyfile(Path('C:/Windows/Fonts')/source,PUBLIC/name)

sr=48000;duration=40
voicefile=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/demo-3-phong-cach-tham-khao/audio/narration.mp3'
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(voicefile),'-af','atempo=0.86','-ar',str(sr),'-ac','2','-f','f32le','-'])
voice=np.frombuffer(raw,dtype='<f4').reshape(-1,2)
t=np.arange(sr*duration)/sr
for style in CAST:
 mix=np.zeros((len(t),2),dtype=np.float64)
 mix[sr:sr+len(voice)]+=voice
 fade=np.minimum(1,t/2)*np.clip((40-t)/2,0,1)
 # Different original harmonic beds and transition effects for the two films.
 for i,f in enumerate(([146.83,220,293.66] if style=='flat' else [130.81,196,261.63])):
  env=(.65+.35*np.sin(t*.4+i))*.012*fade
  for ch in range(2):mix[:,ch]+=np.sin(2*np.pi*(f+ch*.13)*t+i)*env
 rng=np.random.default_rng(310 if style=='flat' else 825)
 for at,f in [(2.30,1046.5),(23.35,880),(28.5,1318.5)]:
  tx=np.arange(int(.65*sr))/sr
  sig=(np.sin(2*np.pi*f*tx)+.22*np.sin(2*np.pi*f*2*tx))*np.exp(-tx*9)*np.minimum(1,tx/.01)*.038
  n=int(at*sr);mix[n:n+len(tx)]+=sig[:,None]
 for at in [5.7,10.4,20,32.3]:
  tx=np.arange(int(.22*sr))/sr
  sig=np.convolve(rng.normal(size=len(tx)),np.ones(17)/17,'same')*np.sin(np.pi*tx/.22)**2*.045
  n=int((at-.05)*sr);mix[n:n+len(tx)]+=sig[:,None]
 assert np.max(np.abs(mix))<.99
 with wave.open(str(PUBLIC/(style+'.wav')),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((mix*32767).astype('<i2').tobytes())

(OUT/'asset-manifest.json').write_text(json.dumps({'artwork':'Open Peeps by Pablo Stanley','artLicense':'CC0','licenseSource':'https://www.openpeeps.com/','repository':'https://github.com/Hantuhan/peepstudio','applicationCodeCopied':False,'independentVisualSets':True,'assets':manifest},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'downloaded':len(manifest),'styles':list(CAST),'duration':duration}))
