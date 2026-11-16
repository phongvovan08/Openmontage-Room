"""Inspect the encoded Mochi full episode and prepare chapter contact sheets."""
from pathlib import Path
import json
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'Chu-De/Be-Mochi-Mam-Xanh/tap-01-full-7-cam-xuc-ky-la'
VIDEO = OUT / 'be_mochi_tap01_full_7_cam_xuc_16x9.mp4'
QC = OUT / 'kiem-tra-render'
QC.mkdir(exist_ok=True)

def run(args):
    result = subprocess.run(args, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result

metadata = json.loads(run(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(VIDEO)]).stdout)
stream = next(s for s in metadata['streams'] if s['codec_type'] == 'video')
assert (stream['width'], stream['height'], stream['r_frame_rate'], int(stream['nb_frames'])) == (1920, 1080, '30/1', 17700), stream
assert abs(float(metadata['format']['duration']) - 590) < 0.1
assert any(s['codec_type'] == 'audio' for s in metadata['streams'])

# One frame comfortably inside every shot, plus chapter card and closing checks.
# Parse shot timing from the actual source instead of trusting a copied schedule.
import re
source = (ROOT/'remotion-composer/src/BeMochiEp01Full16x9.tsx').read_text(encoding='utf-8')
shots = [(int(n),float(start),float(end)) for n,start,end in re.findall(r'shotNumber:\s*(\d+),\s*startSec:\s*([\d.]+),\s*endSec:\s*([\d.]+)',source)]
assert len(shots) == 30
frames = []
for number, start, end in shots:
    second = min(start+3, end-0.5)
    file = QC / f'canh-{number:02d}.jpg'
    run(['ffmpeg','-v','error','-y','-ss',str(second),'-i',str(VIDEO),'-frames:v','1','-q:v','2',str(file)])
    frames.append((number, second, file))
run(['ffmpeg','-v','error','-y','-ss','588','-i',str(VIDEO),'-frames:v','1','-q:v','2',str(QC/'ket-phim-588s.jpg')])

font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
for sheet in range(3):
    canvas = Image.new('RGB',(1280,5*388),(18,24,34))
    draw = ImageDraw.Draw(canvas)
    for idx,(number,second,file) in enumerate(frames[sheet*10:(sheet+1)*10]):
        x,y=(idx%2)*640,(idx//2)*388
        with Image.open(file) as frame:
            canvas.paste(frame.resize((640,360)),(x,y))
        draw.text((x+12,y+364),f'Shot {number:02d} | {second:.1f}s',font=font,fill='white')
    canvas.save(QC/f'bang-kiem-tra-{sheet+1}.jpg',quality=94)

decode = run(['ffmpeg','-v','error','-xerror','-i',str(VIDEO),'-f','null','-'])
audio = run(['ffmpeg','-hide_banner','-nostats','-i',str(VIDEO),'-vn','-af','astats=metadata=0:reset=0','-f','null','-'])
black = run(['ffmpeg','-hide_banner','-nostats','-i',str(VIDEO),'-an','-vf','blackdetect=d=0.3:pic_th=0.98:pix_th=0.05','-f','null','-'])
report = {'metadata':metadata,'fullDecodePassed':True,'decodeMessages':decode.stderr,
          'frameChecks':[{'shot':n,'second':t,'file':str(f.relative_to(OUT))} for n,t,f in frames],
          'audioStatistics':[line for line in audio.stderr.splitlines() if any(key in line for key in ['Peak level dB','RMS level dB','Number of NaNs','Number of Infs'])],
          'blackIntervals':[line for line in black.stderr.splitlines() if 'black_start:' in line],
          'visualReview':'Contact sheets generated; human/agent visual inspection is a separate step.'}
(QC/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'video':str(VIDEO),'duration':metadata['format']['duration'],'frames':stream['nb_frames'],'decode':True,'blackIntervals':report['blackIntervals'],'audioStatistics':report['audioStatistics']},ensure_ascii=False))
