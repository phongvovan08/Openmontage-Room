"""Technical QC and representative-frame extraction for the actual episode MP4.

Writes measured results, not a claim of perceptual listening or full visual review.
"""
from pathlib import Path
import json,subprocess,re,hashlib,difflib,sys
import numpy as np
from scipy.signal import correlate,correlation_lags
ROOT=Path(__file__).resolve().parents[1]
EP=ROOT/'Chu-De/Tam-Ly-Noi-Tam/episodes/01-mot-cau-noi-thoang-qua'
OUT=EP/'render'
ART=ROOT/'projects/tam-ly-noi-tam-tap01-v2/artifacts'
AUDIO=ROOT/'Chu-De/Tam-Ly-Noi-Tam/assets/tap-01/audio/haitrieu'
VIDEO=OUT/'01-mot-cau-noi-thoang-qua-haitrieu-1080p.mp4'
sys.stdout.reconfigure(encoding='utf-8')
def run(args):
    return subprocess.run(args,capture_output=True,text=True,encoding='utf-8',errors='replace',check=True)
def write(path,data):path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
def main():
    props=json.loads((ROOT/'remotion-composer/public/demo-props/inner-01-haitrieu.json').read_text(encoding='utf-8'))
    probe=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(VIDEO)]).stdout)
    video=next(s for s in probe['streams'] if s['codec_type']=='video')
    audio=next(s for s in probe['streams'] if s['codec_type']=='audio')
    assert (video['width'],video['height'])==(1920,1080)
    assert video['r_frame_rate']=='30/1'
    assert abs(float(probe['format']['duration'])-props['durationSeconds'])<0.1
    assert int(video['nb_frames'])==round(props['durationSeconds']*30)
    write(ART/'output-ffprobe.json',probe)
    print('Container, resolution, 30fps, frame count and duration verified.',flush=True)
    scan=run(['ffmpeg','-hide_banner','-threads','2','-i',str(VIDEO),'-vf','blackdetect=d=0.45:pix_th=0.03:pic_th=0.98','-af','silencedetect=noise=-50dB:d=2','-f','null','-'])
    (ART/'decode-scan.log').write_text(scan.stderr,encoding='utf-8')
    black=[line for line in scan.stderr.splitlines() if 'black_start:' in line]
    silence=[line for line in scan.stderr.splitlines() if 'silence_start:' in line or 'silence_end:' in line]
    print('Full decode and gap scan finished.',flush=True)
    levels=run(['ffmpeg','-hide_banner','-threads','2','-i',str(VIDEO),'-vn','-af','loudnorm=I=-18:TP=-1:LRA=11:print_format=json','-f','null','-']).stderr
    loudness=json.loads(re.search(r'\{\s*"input_i".*?\}',levels,re.S).group(0))
    def samples(path,seconds):
        data=subprocess.run(['ffmpeg','-v','error','-threads','2','-ss',str(seconds),'-i',str(path),'-t','12','-vn','-ac','1','-ar','8000','-f','f32le','pipe:1'],capture_output=True,check=True).stdout
        return np.frombuffer(data,dtype='<f4').astype(np.float64)
    sync=[]
    for seconds in [30,450,900]:
        mixed=samples(VIDEO,seconds);ref=samples(AUDIO/'narration-haitrieu.wav',seconds)
        corr=correlate(mixed,ref,method='fft');lags=correlation_lags(len(mixed),len(ref))
        selected=np.abs(lags)<=800;best=np.flatnonzero(selected)[np.argmax(corr[selected])];lag=int(lags[best])
        score=float(corr[best]/np.sqrt(np.sum(mixed*mixed)*np.sum(ref*ref)))
        sync.append({'at_seconds':seconds,'correlation_with_narration':round(score,5),'estimated_offset_ms':lag/8})
        assert score>0.9 and abs(lag/8)<80,('Narration mix/sync mismatch',sync[-1])
    script=(EP/'LOI_DAN.txt').read_text(encoding='utf-8').strip()
    journal=json.loads((AUDIO/'vibi-tasks.json').read_text(encoding='utf-8'))
    assert hashlib.sha256(script.encode()).hexdigest()==journal['script_sha256']
    srt=(AUDIO/'narration-haitrieu.srt').read_text(encoding='utf-8')
    cue_text=re.findall(r'\d\d:\d\d:\d\d,\d+ --> \d\d:\d\d:\d\d,\d+\n(.*?)(?=\n\n|\Z)',srt,re.S)
    tokens=lambda t:re.findall(r'\w+',t.lower())
    ratio=difflib.SequenceMatcher(None,tokens(script),tokens(' '.join(cue_text)),autojunk=False).ratio()
    assert ratio==1
    stamps=[2.5,134,300,360,445,474,550,690,780,900,1008]
    frames=[]
    for seconds in stamps:
        dest=OUT/'frames'/f'final-{str(seconds).replace(".","p")}s.jpg'
        run(['ffmpeg','-v','error','-threads','2','-ss',str(seconds),'-i',str(VIDEO),'-frames:v','1','-update','1','-q:v','2','-y',str(dest)])
        frames.append({'seconds':seconds,'path':str(dest.relative_to(ROOT))})
    qc={'duration_seconds':float(probe['format']['duration']),'video_codec':video['codec_name'],'audio_codec':audio['codec_name'],
        'resolution':'1920x1080','fps':30,'frames':int(video['nb_frames']),'file_size_bytes':VIDEO.stat().st_size,
        'full_decode_succeeded':True,'black_intervals':black,'silence_intervals':silence,'loudness':loudness,
        'narration_waveform_checks':sync,
        'provider_transcript_matches_script_tokens':ratio,'source_script_hash_matches_tts_submission':True,
        'word_timing':'Interpolated within provider SRT cues; not forced alignment.',
        'perceptual_listening_performed':False,'frames_for_visual_review':frames,'visual_review_pending':True}
    write(ART/'technical-qc.json',qc)
    print(json.dumps(qc,ensure_ascii=False,indent=2),flush=True)
if __name__=='__main__':main()
