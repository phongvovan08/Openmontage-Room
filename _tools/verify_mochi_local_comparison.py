"""Verify two locally animated sample films and build encoded-frame contact sheets."""
from pathlib import Path
import hashlib,json,re,subprocess
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/so-sanh-svg-va-truyen-tranh'
QA=OUT/'kiem-tra'
SECONDS=[3,13,20,28,36,48,60,72,82,90,98,106,112]
FILMS=[('svg','01_mochi_hoat_hinh_svg_114s.mp4'),('story','02_mochi_truyen_tranh_chuyen_dong_114s.mp4')]

def run(args,binary=False):
    p=subprocess.run(args,capture_output=True,**({} if binary else {'text':True,'encoding':'utf-8','errors':'replace'}))
    if p.returncode: raise RuntimeError(p.stderr)
    return p

result={'films':[],'continuousPlaybackReviewed':False}
for key,name in FILMS:
    file=OUT/name
    data=json.loads(run(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(file)]).stdout)
    v=next(s for s in data['streams'] if s['codec_type']=='video')
    assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1920,1080,'30/1',3420)
    assert abs(float(data['format']['duration'])-114)<.05
    assert any(s['codec_type']=='audio' for s in data['streams'])
    decode=run(['ffmpeg','-v','error','-xerror','-i',str(file),'-f','null','-'])
    assert not decode.stderr.strip(),decode.stderr
    audio=run(['ffmpeg','-hide_banner','-nostats','-i',str(file),'-vn','-af','astats=metadata=0:reset=0','-f','null','-']).stderr
    peak=max(float(n) for n in re.findall(r'Peak level dB:\s*([-\d.]+)',audio))
    assert peak<0,peak
    black=run(['ffmpeg','-hide_banner','-nostats','-i',str(file),'-an','-vf','blackdetect=d=0.3:pic_th=0.98:pix_th=0.05','-f','null','-']).stderr
    black_intervals=[line for line in black.splitlines() if 'black_start:' in line]
    assert not black_intervals,black_intervals
    pcm=run(['ffmpeg','-v','error','-i',str(file),'-vn','-f','s16le','-acodec','pcm_s16le','-'],binary=True).stdout
    canvas=Image.new('RGB',(1920,5*388),'#eadfc8');draw=ImageDraw.Draw(canvas)
    font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
    for i,sec in enumerate(SECONDS):
        frame=QA/f'{key}-encoded-{sec}s.jpg'
        run(['ffmpeg','-v','error','-y','-ss',str(sec),'-i',str(file),'-frames:v','1','-q:v','2',str(frame)])
        x=(i%3)*640;y=(i//3)*388
        with Image.open(frame) as im: canvas.paste(im.resize((640,360)),(x,y))
        draw.text((x+12,y+364),f'{key} | {sec}s',font=font,fill='#243347')
    canvas.save(QA/f'kiem-tra-mp4-{key}.jpg',quality=94)
    result['films'].append({'file':name,'duration':float(data['format']['duration']),'frames':int(v['nb_frames']),'dimensions':[v['width'],v['height']],'fps':30,'fullDecodePassed':True,'peakDbFS':peak,'blackIntervals':black_intervals,'audioPcmSha256':hashlib.sha256(pcm).hexdigest(),'sampleSeconds':SECONDS,'visualReview':'Pending contact-sheet inspection'})
    print(json.dumps(result['films'][-1],ensure_ascii=False),flush=True)
assert result['films'][0]['audioPcmSha256']==result['films'][1]['audioPcmSha256'],'The comparison audio differs'
result['identicalDecodedAudio']=True
(OUT/'kiem-tra/verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print('PASS: both films decode fully and contain identical audio.',flush=True)
