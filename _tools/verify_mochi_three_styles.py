"""Inspect frames and validate complete playable outputs for all three demo films."""
from pathlib import Path
import hashlib,json,re,subprocess,sys
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/demo-3-phong-cach-tham-khao'
QA=OUT/'kiem-tra'
FILMS=[('flat','01_mochi_2d_giai_thich_40s.mp4'),('office','02_mochi_van_phong_3d_40s.mp4'),('world','03_mochi_the_gioi_2d_40s.mp4')]
if '--human' in sys.argv:
    OUT=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/demo-nhan-vat-nguoi-v2'
    QA=OUT/'kiem-tra'
    FILMS=[('flat','01_nhan_vat_nguoi_giai_thich_40s.mp4'),('office','02_nguoi_ve_trong_van_phong_40s.mp4'),('world','03_nhan_vat_nguoi_ke_chuyen_40s.mp4')]
if '--paper' in sys.argv:
    OUT=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/thiet-ke-rieng-tin-nhan'
    QA=OUT/'kiem-tra'
    FILMS=[('puppet','video-2_5d-co-khop-40s.mp4')]
SECONDS=[1,3.5,8,12,17,21.5,25,30,34.5,38.5]
font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',20)
def sheet(key,encoded=False):
    result=Image.new('RGB',(1350,1024),'#172B4F');draw=ImageDraw.Draw(result)
    for i,sec in enumerate(SECONDS):
        source=QA/(f'encoded-{key}-{sec}s.jpg' if encoded else f'{key}-{sec}s.png')
        with Image.open(source) as im:result.paste(im.resize((270,480)),(i%5*270,i//5*512))
        draw.text((i%5*270+10,i//5*512+482),f'{key} / {sec}s',font=font,fill='white')
    result.save(QA/(f'encoded-{key}-tong-quan.jpg' if encoded else f'{key}-tong-quan.jpg'),quality=94)
if '--stills' in sys.argv:
    for key,_ in FILMS:sheet(key)
    print('Created three contact sheets.');raise SystemExit
reports=[]
for key,name in FILMS:
    file=OUT/name
    meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(file)],text=True))
    v=next(s for s in meta['streams'] if s['codec_type']=='video');a=next(s for s in meta['streams'] if s['codec_type']=='audio')
    assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1080,1920,'30/1',1200),name
    assert abs(float(meta['format']['duration'])-40)<.08,name
    assert v['codec_name']=='h264' and a['codec_name']=='aac',name
    assert abs(float(a['duration'])-40)<.03,(name,'audio duration')
    subprocess.run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(file),'-f','null','-'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    check=subprocess.run(['ffmpeg','-nostdin','-hide_banner','-i',str(file),'-vf','blackdetect=d=0.3:pic_th=0.98:pix_th=0.05','-af','astats=metadata=0:reset=0','-f','null','-'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True,check=True)
    black=re.findall(r'black_start:[^\r\n]+',check.stderr)
    peaks=[float(v) for v in re.findall(r'Peak level dB:\s*(-?[\d.]+)',check.stderr)]
    assert not black,(name,black)
    assert peaks and max(peaks)<0,(name,peaks)
    pcm=subprocess.check_output(['ffmpeg','-nostdin','-v','error','-i',str(file),'-map','0:a:0','-f','s16le','-acodec','pcm_s16le','-'])
    for sec in SECONDS:
        subprocess.run(['ffmpeg','-nostdin','-y','-v','error','-ss',str(sec),'-i',str(file),'-frames:v','1','-q:v','2',str(QA/f'encoded-{key}-{sec}s.jpg')],check=True)
    sheet(key,True)
    reports.append({'file':name,'sizeMB':round(file.stat().st_size/1048576,2),'durationSeconds':float(meta['format']['duration']),'frames':int(v['nb_frames']),'width':v['width'],'height':v['height'],'codec':v['codec_name'],'audioCodec':a['codec_name'],'fullDecode':'pass','blackIntervals':black,'peakDb':max(peaks),'audioPCMsha256':hashlib.sha256(pcm).hexdigest(),'fileSHA256':hashlib.sha256(file.read_bytes()).hexdigest()})
    print(json.dumps(reports[-1]),flush=True)
assert len(set(r['audioPCMsha256'] for r in reports))==1,'Comparison audio differs'
# Check actual waveform alignment, independently of container timestamps.
import numpy as np
from scipy.signal import correlate
def samples(file,tempo=None):
    cmd=['ffmpeg','-nostdin','-v','error','-i',str(file)]
    if tempo:cmd+=['-af',f'atempo={tempo}']
    cmd+=['-ar','8000','-ac','1','-f','f32le','-']
    return np.frombuffer(subprocess.check_output(cmd),dtype='float32')
voice=samples(OUT/'audio/narration.mp3',.86)
master=samples(OUT/FILMS[0][1])
lag=float((np.argmax(correlate(master,voice,mode='full',method='fft'))-len(voice)+1)/8000)
assert abs(lag-1)<.012,('Unexpected voice offset',lag)
(QA/'verification.json').write_text(json.dumps({'allPassed':True,'sameDecodedAudio':True if len(reports)>1 else None,'expectedVoiceDelaySeconds':1,'measuredVoiceDelaySeconds':lag,'films':reports},ensure_ascii=False,indent=2),encoding='utf-8')
