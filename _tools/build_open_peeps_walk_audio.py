from pathlib import Path
import json,wave
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'remotion-composer/public/episodes/open-peeps-demo'
QA=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/demo-open-peeps-2d-25d/kiem-tra'
steps=json.loads((QA/'walk-motion-checks.json').read_text())
for mode in ['flat','depth']:
 with wave.open(str(PUBLIC/(mode+'.wav')),'rb') as f:
  sr=f.getframerate();mix=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2).astype(np.float64)/32768*.86
 rng=np.random.default_rng(345 if mode=='flat' else 891)
 for i,contact in enumerate(steps[mode]['contacts']):
  at=contact['time'];t=np.arange(int(.13*sr))/sr
  noise=rng.normal(size=len(t));noise=np.convolve(noise,np.ones(11)/11,'same')
  thud=np.sin(2*np.pi*(105 if mode=='flat' else 85)*t)*np.exp(-t*55)
  sig=(thud*.034+noise*np.exp(-t*40)*.07)*np.minimum(1,t/.002)
  n=int(at*sr);length=min(len(sig),len(mix)-n)
  pan=.85 if contact['foot']=='left' else 1
  mix[n:n+length,0]+=sig[:length]*pan;mix[n:n+length,1]+=sig[:length]*(1.85-pan)
 peak=np.max(np.abs(mix))
 if peak>.86:mix*=.86/peak
 with wave.open(str(PUBLIC/(mode+'-walk.wav')),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((mix*32767).astype('<i2').tobytes())
 print(mode,'footsteps',len(steps[mode]['contacts']),'peak',round(float(np.max(np.abs(mix))),4))
