"""Analyze the sprite atlas for runtime UV mapping; preserve the original PNG."""
from pathlib import Path
from PIL import Image
from scipy.ndimage import label,find_objects
import numpy as np,json,shutil
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/thiet-ke-rieng-tin-nhan'
PUBLIC=ROOT/'remotion-composer/public/episodes/original-paper-story'
file=OUT/'rig/nhan-vat-cac-bo-phan.png'
im=Image.open(file).convert('RGBA');a=np.asarray(im);w,h=im.size
assert np.mean(a[:,:,3]==0)>.2,'Sprite sheet must have genuine transparency'
names=['head','torso','upperArmL','upperArmR','forearmL','forearmR','thighL','thighR','shinL','shinR','shoeL','shoeR','headQuarter','phone','mug','plant']
parts={}
for i,name in enumerate(names):
    x0=round(i%4*w/4);x1=round((i%4+1)*w/4)
    y0=round(i//4*h/4);y1=round((i//4+1)*h/4)
    alpha=a[y0:y1,x0:x1,3]
    labels,n=label(alpha>180)
    sizes=np.bincount(labels.ravel());sizes[0]=0
    assert n and sizes.max()>150,(name,n)
    slices=find_objects(labels)[int(np.argmax(sizes))-1]
    sy,sx=slices
    left=max(0,x0+sx.start-2);right=min(w,x0+sx.stop+2)
    top=max(0,y0+sy.start-2);bottom=min(h,y0+sy.stop+2)
    item={'x':left,'y':top,'width':right-left,'height':bottom-top}
    if name.startswith(('upperArm','forearm','thigh','shin')):
        mask=a[top:bottom,left:right,3]>180
        ph,pw=mask.shape
        end=.79 if name.startswith('forearm') else .93
        def joint(y):
            lo=max(0,round((y-.035)*ph));hi=min(ph,round((y+.035)*ph))
            yy,xx=np.nonzero(mask[lo:hi])
            return [round(float(xx.mean())/pw,5) if len(xx) else .5,y]
        item['jointA']=joint(.07);item['jointB']=joint(end)
    parts[name]=item
faces=np.asarray(Image.open(OUT/'rig/bieu-cam-khuon-mat.png').convert('RGBA'))
fh,fw=faces.shape[:2]
for i,name in enumerate(['headFear','headHappy']):
    x0=round(i*fw/2);x1=round((i+1)*fw/2)
    labels,n=label(faces[:,x0:x1,3]>180);sizes=np.bincount(labels.ravel());sizes[0]=0
    sy,sx=find_objects(labels)[int(np.argmax(sizes))-1]
    left=max(0,x0+sx.start-2);right=min(fw,x0+sx.stop+2);top=max(0,sy.start-2);bottom=min(fh,sy.stop+2)
    parts[name]={'x':left,'y':top,'width':right-left,'height':bottom-top,'source':'faces'}
payload={'width':w,'height':h,'faceWidth':fw,'faceHeight':fh,'parts':parts,'alphaThresholdForBounds':180,'runtimeAlphaTest':.55,'note':'Original atlases remain unmodified; bounding boxes are used only to map texture UVs while rendering.'}
(OUT/'rig/atlas.json').write_text(json.dumps(payload,indent=2),encoding='utf-8')
PUBLIC.mkdir(parents=True,exist_ok=True)
for name in ['nhan-vat-cac-bo-phan.png','nen-tuong-phong.png','bieu-cam-khuon-mat.png','atlas.json']:
    shutil.copyfile(OUT/'rig'/name,PUBLIC/name)
dest=ROOT/'remotion-composer/src/paper-puppet/atlas.json';dest.parent.mkdir(parents=True,exist_ok=True)
dest.write_text(json.dumps(payload,indent=2),encoding='utf-8')
print(json.dumps(payload))
