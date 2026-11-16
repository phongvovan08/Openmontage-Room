"""Create a convenient landscape comparison from the three finished masters."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import subprocess,json,sys
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/demo-3-phong-cach-tham-khao'
WORK=ROOT/'scratch/mochi-three-styles'
human='--human' in sys.argv
if human:
    OUT=ROOT/'Chu-De/Be-Mochi-Mam-Xanh/demo-nhan-vat-nguoi-v2'
    WORK=ROOT/'scratch/human-reference-v2'
WORK.mkdir(parents=True,exist_ok=True)
base=Image.new('RGB',(1920,1080),'#101A2C');d=ImageDraw.Draw(base)
font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',26)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',20)
labels=['01 · NGƯỜI VẼ / GIẢI THÍCH','02 · NGƯỜI VẼ / VĂN PHÒNG','03 · NGƯỜI VẼ / THẾ GIỚI 2D'] if human else ['01 · HOẠT HÌNH 2D GIẢI THÍCH','02 · VĂN PHÒNG 3D','03 · THẾ GIỚI 2D NHIỀU LỚP']
for x,text in zip([360,960,1560],labels):
    d.text((x,40),text,font=font,anchor='mm',fill='#FFF8E9')
    d.line((x-70,65,x+70,65),fill='#4ADE80',width=3)
d.text((960,1067),'BÉ MOCHI MẦM XANH  ·  Một câu chuyện, ba cách kể  ·  40 giây',font=small,anchor='mm',fill='#B6C6D5')
background=WORK/'comparison-background.png';base.save(background)
files=['01_mochi_2d_giai_thich_40s.mp4','02_mochi_van_phong_3d_40s.mp4','03_mochi_the_gioi_2d_40s.mp4']
if human:files=['01_nhan_vat_nguoi_giai_thich_40s.mp4','02_nguoi_ve_trong_van_phong_40s.mp4','03_nhan_vat_nguoi_ke_chuyen_40s.mp4']
cmd=['ffmpeg','-nostdin','-y','-v','error','-loop','1','-framerate','30','-i',str(background)]
for f in files:cmd+=['-i',str(OUT/f)]
filters='[1:v]scale=540:960[v1];[2:v]scale=540:960[v2];[3:v]scale=540:960[v3];[0:v][v1]overlay=90:90[a];[a][v2]overlay=690:90[b];[b][v3]overlay=1290:90[out]'
target=OUT/'00_so_sanh_3_phong_cach_40s.mp4'
cmd+=['-filter_complex_threads','2','-filter_complex',filters,'-map','[out]','-map','1:a:0','-c:v','libx264','-crf','19','-preset','fast','-threads','6','-pix_fmt','yuv420p','-c:a','copy','-t','40','-movflags','+faststart',str(target)]
subprocess.run(cmd,check=True)
subprocess.run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(target),'-f','null','-'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(target)],text=True))
v=next(s for s in meta['streams'] if s['codec_type']=='video')
assert (v['width'],v['height'],int(v['nb_frames']))==(1920,1080,1200)
(OUT/'kiem-tra/comparison-metadata.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
subprocess.run(['ffmpeg','-nostdin','-y','-v','error','-ss','8','-i',str(target),'-frames:v','1',str(OUT/'kiem-tra/comparison-8s.jpg')],check=True)
print(json.dumps({'file':str(target),'seconds':float(meta['format']['duration']),'frames':v['nb_frames'],'sizeMB':round(target.stat().st_size/1048576,2),'fullDecode':'pass'}))
