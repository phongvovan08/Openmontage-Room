"""Generate a lesson's TTS lines with the VIBI API (api.vibi.pro) straight into audio_tts/, instead of zips.

Usage, from the VIBI_VOICE folder:
  python English-Channel/_tools/vibi_tts.py --me                 credit balance (checks the key)
  python English-Channel/_tools/vibi_tts.py --history            recent tasks: voice_id, provider, model, settings
  python English-Channel/_tools/vibi_tts.py --lesson English-Channel/11-Friends_Season_1
  python English-Channel/_tools/vibi_tts.py --lesson ... --lines 1,2   only these lines of TTS_1_DONG_1_GIAI_THICH.txt
API key: environment variable VIBI_API_KEY, or the file English-Channel/_tools/.vibi_api_key (git-ignored).
Voice: English-Channel/_tools/vibi_tts.json {voice_id, provider, model_id, language_code, voice_settings,
english: {language_code, voice_settings}}.
Without --lines, only lines whose audio is missing or no longer matches the text are made (the same rule as
TTS_CAN_TAO_LAI.txt). Each SRT must match its line, as with --import-tts, otherwise nothing is saved for it.

A line with "tts_segments" (English marked {…} in build_lesson.py) is read piece by piece: Vietnamese pieces in
the voice's Vietnamese mode, English pieces in its English mode, so English words are not mispronounced. The
pieces are trimmed of edge silence, joined with a pause that follows the punctuation, and their SRTs are merged
back into whole sentences.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import http.client
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

from prepare_capcut import normalized, parse_srt, srt_text, stale_tts, stamp, tts_items

HERE = Path(__file__).resolve().parent
API = 'https://api.vibi.pro'
CONFIG = HERE / 'vibi_tts.json'
KEY_FILE = HERE / '.vibi_api_key'
# Cloudflare in front of the API rejects Python's default User-Agent (error 1010).
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) vibi-tts-lesson/1.0'
BATCH = 38          # Vibi API enforces max 40 POST /v1/text-to-speech per 60-second window
WORKERS = 20        # concurrent HTTP threads
SILENCE_DB = -45
# English mode reads with stronger stress: same average loudness but peaks ~2.5 dB above the Vietnamese pieces,
# so it sounds louder. Every piece is brought to one loudness, then peaks are held at the Vietnamese level.
PIECE_LUFS = -16.0
PIECE_PEAK = 0.447  # linear, about -7 dBFS


def loudness(path: Path) -> float:
    log = run(['ffmpeg', '-hide_banner', '-i', str(path), '-af', 'ebur128', '-f', 'null', '-'])
    found = re.findall(r'I:\s+(-?[\d.]+) LUFS', log)
    return float(found[-1]) if found else PIECE_LUFS


def api_key() -> str:
    key = os.environ.get('VIBI_API_KEY') or (KEY_FILE.read_text(encoding='utf-8').strip() if KEY_FILE.exists() else '')
    if not key:
        raise SystemExit(f'Chưa có API key: đặt biến VIBI_API_KEY hoặc ghi key vào {KEY_FILE}')
    return key


def retrying(fetch, what: str, attempts: int = 6):
    """Network hiccups and 429/5xx responses are retried with a growing wait."""
    for attempt in range(1, attempts + 1):
        try:
            return fetch()
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < attempts:
                time.sleep(15)
                continue
            if e.code in (500, 502, 503, 504) and attempt < attempts:
                time.sleep(3 * attempt)
                continue
            raise
        except (urllib.error.URLError, TimeoutError, ConnectionError, http.client.HTTPException) as e:
            if attempt == attempts:
                raise SystemExit(f'{what}: lỗi mạng sau {attempts} lần thử: {e}')
            time.sleep(3 * attempt)


def call(method: str, path: str, body: dict | None = None) -> dict:
    def fetch() -> dict:
        request = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body else None,
                                         headers={'xi-api-key': api_key(), 'Content-Type': 'application/json',
                                                  'User-Agent': USER_AGENT})
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.loads(response.read().decode('utf-8'))
    try:
        return retrying(fetch, f'{method} {path}')
    except urllib.error.HTTPError as e:
        raise SystemExit(f'{method} {path} -> HTTP {e.code}: {e.read().decode("utf-8", "replace")[:500]}')


def download(url: str) -> bytes:
    def fetch() -> bytes:
        request = urllib.request.Request(url, headers={'xi-api-key': api_key(), 'User-Agent': USER_AGENT})
        with urllib.request.urlopen(request, timeout=120) as r:
            return r.read()
    return retrying(fetch, f'GET {url}')


def srt_url(result: dict) -> str | None:
    """The transcript link; the docs do not name its field, so take any URL ending in .srt."""
    return result.get('srt_url') or next((v for v in result.values() if isinstance(v, str) and v.endswith('.srt')),
                                         None)


def show_history() -> None:
    for task in call('GET', '/v1/history?page_size=10&page=0')['tasks']:
        meta = task.get('metadata') or {}
        print(json.dumps({k: task.get(k) for k in ('created_at', 'status', 'provider', 'voice_id', 'model_id')}
                         | {'language_code': meta.get('language_code'), 'voice_settings': meta.get('voice_settings'),
                            'result': task.get('result'), 'text': (task.get('text') or '')[:60]},
                         ensure_ascii=False))


def api_fields(settings: dict) -> dict:
    """Settings sent to the API; pitch_shift and notes are applied or read locally, never sent or keyed."""
    return {k: v for k, v in settings.items() if k != 'pitch_shift' and not k.startswith('_')}


def piece_key(voice: dict, settings: dict, text: str) -> str:
    return hashlib.sha1(json.dumps([voice['voice_id'], settings, text], ensure_ascii=False,
                                   sort_keys=True).encode()).hexdigest()[:16]


def synthesize(jobs: list[tuple[str, str]], voice: dict, cache: Path | None = None) -> list[tuple[bytes, bytes]]:
    """(language, text) -> (audio, srt) for each job, submitting and downloading in parallel with bulk history polling.

    With a cache folder, each piece is kept as <key>.mp3/.srt, so joining again (new pauses, new loudness) or
    regenerating a line whose pieces did not change costs no credits."""
    body = {k: voice[k] for k in ('model_id', 'provider', 'language_code', 'voice_settings') if k in voice}
    english = {**body, **api_fields(voice.get('english', {}))}
    results: list[tuple[bytes, bytes] | None] = [None] * len(jobs)
    keys = [piece_key(voice, english if language == 'en' else body, text) for language, text in jobs]
    if cache:
        cache.mkdir(parents=True, exist_ok=True)
        for n, key in enumerate(keys):
            if (cache / f'{key}.mp3').exists() and (cache / f'{key}.srt').exists():
                results[n] = ((cache / f'{key}.mp3').read_bytes(), (cache / f'{key}.srt').read_bytes())
    todo = [n for n in range(len(jobs)) if results[n] is None]
    if len(todo) < len(jobs):
        print(f'  {len(jobs) - len(todo)}/{len(jobs)} đoạn lấy lại từ bộ nhớ đệm, không tốn credit', flush=True)
    if not todo:
        return results  # type: ignore[return-value]

    def submit_one(n: int) -> tuple[str, int]:
        language, text = jobs[n]
        settings = english if language == 'en' else body
        task = call('POST', f'/v1/text-to-speech/{voice["voice_id"]}',
                    {**settings, 'text': text, 'export_transcript': True})
        return task['id'], n

    def fetch_result(n: int, result: dict) -> None:
        link = srt_url(result)
        if not link:
            raise SystemExit(f'Kết quả không có link SRT; các trường nhận được: {sorted(result)}')
        pair = (download(result['audio_url']), download(link))
        results[n] = pair
        if cache:
            (cache / f'{keys[n]}.mp3').write_bytes(pair[0])
            (cache / f'{keys[n]}.srt').write_bytes(pair[1])

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for first in range(0, len(todo), BATCH):
            chunk = todo[first:first + BATCH]
            pending = dict(pool.map(submit_one, chunk))
            deadline = time.time() + 600
            dl_futures = []
            while pending:
                if time.time() > deadline:
                    raise SystemExit(f'Quá 10 phút chưa xong: {[jobs[n][1][:40] for n in pending.values()]}')
                time.sleep(2.0)
                bulk = call('GET', '/v1/history?page_size=100&page=0').get('tasks', [])
                by_id = {t['id']: t for t in bulk if 'id' in t}
                missing_ids = [tid for tid in pending if tid not in by_id]
                if missing_ids:
                    for tid, info in zip(missing_ids, pool.map(lambda t: call('GET', f'/v1/history/{t}'), missing_ids)):
                        by_id[tid] = info
                for task_id, n in list(pending.items()):
                    task = by_id.get(task_id)
                    if not task:
                        continue
                    if task['status'] == 'failed':
                        raise SystemExit(f'Lỗi TTS "{jobs[n][1][:40]}": {task.get("error")}')
                    if task['status'] == 'completed':
                        del pending[task_id]
                        dl_futures.append(pool.submit(fetch_result, n, task.get('result') or {}))
            for fut in as_completed(dl_futures):
                fut.result()
            print(f'  {min(first + BATCH, len(todo))}/{len(todo)} đoạn', flush=True)
    return results  # type: ignore[return-value]


def run(args: list[str]) -> str:
    return subprocess.run(args, capture_output=True, text=True, encoding='utf-8', errors='replace', check=True).stderr


def lead_silence(path: Path) -> float:
    log = run(['ffmpeg', '-hide_banner', '-i', str(path), '-af', f'silencedetect=noise={SILENCE_DB}dB:d=0.02',
               '-f', 'null', '-'])
    first = re.search(r'silence_start: (-?[\d.]+)[\s\S]*?silence_end: ([\d.]+)', log)
    return float(first.group(2)) if first and float(first.group(1)) <= 0.01 else 0.0


def pause_after(text: str) -> float:
    end = text.rstrip()[-1:]
    return 0.35 if end in '.!?' else 0.2 if end in ',;:' else 0.08


def join_pieces(segments: list[list[str]], pieces: list[tuple[bytes, bytes]], audio_out: Path,
                english_shift: float = 0.0) -> str:
    """Trim, pad and concatenate the pieces into audio_out; return the merged SRT, one cue per sentence.

    english_shift (semitones) fine-tunes the English pieces' pitch, since the API's pitch moves in whole steps;
    rubberband keeps their speed, so SRT times stay valid."""
    fragments, offset = [], 0.0
    with tempfile.TemporaryDirectory() as tmp:
        folder = Path(tmp)
        listing = []
        for n, ((language, text), (audio, srt)) in enumerate(zip(segments, pieces)):
            raw, piece = folder / f'{n}.mp3', folder / f'{n}.wav'
            raw.write_bytes(audio)
            lead = lead_silence(raw)
            gain = max(-12.0, min(12.0, PIECE_LUFS - loudness(raw)))
            trim = f'silenceremove=start_periods=1:start_threshold={SILENCE_DB}dB'
            shift = f'rubberband=pitch={2 ** (english_shift / 12):.5f},' if language == 'en' and english_shift else ''
            run(['ffmpeg', '-hide_banner', '-y', '-i', str(raw), '-af',
                 f'{shift}{trim},areverse,{trim},areverse,volume={gain:.2f}dB,'
                 f'alimiter=limit={PIECE_PEAK}:level=0:attack=2:release=40,apad=pad_dur={pause_after(text)}',
                 '-ar', '44100', '-ac', '1', str(piece)])
            length = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                           '-of', 'csv=p=0', str(piece)], capture_output=True, text=True).stdout)
            srt_file = folder / f'{n}.srt'
            srt_file.write_bytes(srt)
            for start, end, cue in parse_srt(srt_file):
                local_start = max(0.0, start / 1000 - lead)
                local_end = min(length, end / 1000 - lead)
                if local_end <= local_start:
                    raise ValueError(f'TTS piece {n + 1}: cue has no positive duration after silence trim '
                                     f'({local_start:.3f}..{local_end:.3f}s): {cue}')
                fragments.append((offset + local_start, offset + local_end, ' '.join(cue.split())))
            offset += length
            listing.append(f"file '{piece.name}'")
        (folder / 'list.txt').write_text('\n'.join(listing) + '\n', encoding='utf-8')
        run(['ffmpeg', '-hide_banner', '-y', '-f', 'concat', '-safe', '0', '-i', str(folder / 'list.txt'),
             '-c:a', 'libmp3lame', '-b:a', '128k', str(audio_out)])
    cues, buffer = [], []
    for fragment in fragments:
        buffer.append(fragment)
        if fragment[2].rstrip()[-1:] in '.!?':
            cues.append((buffer[0][0], buffer[-1][1], ' '.join(f[2] for f in buffer)))
            buffer = []
    if buffer:
        cues.append((buffer[0][0], buffer[-1][1], ' '.join(f[2] for f in buffer)))
    return '\n\n'.join(f'{n}\n{stamp(round(a * 1000))} --> {stamp(round(b * 1000))}\n{text}'
                       for n, (a, b, text) in enumerate(cues, 1)) + '\n'


def generate(base: Path, lines: list[int] | None) -> None:
    lesson = json.loads((base / 'lesson.json').read_text(encoding='utf-8'))
    if not CONFIG.exists():
        raise SystemExit(f'Chưa có {CONFIG.name}: chạy --history, rồi ghi voice_id, provider, model_id, '
                         'language_code, voice_settings của giọng đang dùng vào file đó.')
    voice = json.loads(CONFIG.read_text(encoding='utf-8'))
    items = tts_items(lesson)
    chosen = [items[n - 1] for n in lines] if lines else stale_tts(lesson, base)
    if not chosen:
        print('Mọi dòng TTS đã có audio khớp chữ, không cần tạo.')
        return
    # Every line becomes one or more (language, text) jobs; a line without segments is a single Vietnamese job.
    plans = [item.get('tts_segments') or [['vi', ' '.join(item['tts_vi'].split())]] for item in chosen]
    jobs = [tuple(s) for plan in plans for s in plan]
    print(f'Tạo {len(chosen)}/{len(items)} dòng TTS ({len(jobs)} đoạn)…', flush=True)
    results = synthesize(jobs, voice, base / 'audio_tts' / '_pieces')
    folder = base / 'audio_tts'
    folder.mkdir(exist_ok=True)
    failed, at = [], 0
    for item, plan in zip(chosen, plans):
        pieces = results[at:at + len(plan)]
        at += len(plan)
        stem = item['tts_audio_stem']
        with tempfile.TemporaryDirectory() as tmp:
            audio = Path(tmp) / f'{stem}.mp3'
            if len(plan) == 1 and not item.get('tts_segments'):
                audio.write_bytes(pieces[0][0])
                srt = pieces[0][1].decode('utf-8-sig')
            else:
                srt = join_pieces(plan, pieces, audio, voice.get('english', {}).get('pitch_shift', 0.0))
            if normalized(srt_text(srt)) != normalized(item['tts_vi']):
                failed.append(f'{stem}: SRT không khớp chữ của dòng')
                continue
            for old in folder.glob(stem + '.*'):
                old.unlink()
            (folder / f'{stem}.mp3').write_bytes(audio.read_bytes())
            (folder / f'{stem}.srt').write_text(srt, encoding='utf-8')
        print(f'  xong {stem}' + (f' ({len(plan)} đoạn)' if item.get('tts_segments') else ''), flush=True)
    if failed:
        raise SystemExit('Lỗi:\n  ' + '\n  '.join(failed))
    print(f'Xong {len(chosen)} dòng. Chạy tiếp: prepare_capcut.py --lesson {base} --all')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--lesson', type=Path)
    parser.add_argument('--lines', help='comma-separated line numbers of TTS_1_DONG_1_GIAI_THICH.txt')
    parser.add_argument('--all', action='store_true',
                        help='remake every line (cached pieces are reused, so only the joining is redone)')
    parser.add_argument('--history', action='store_true')
    parser.add_argument('--me', action='store_true')
    args = parser.parse_args()
    if args.me:
        print(json.dumps(call('GET', '/v1/auth/me'), ensure_ascii=False, indent=2))
    elif args.history:
        show_history()
    elif args.lesson:
        lines = [int(x) for x in args.lines.split(',')] if args.lines else None
        if args.all:
            lesson = json.loads((args.lesson / 'lesson.json').read_text(encoding='utf-8'))
            lines = list(range(1, len(tts_items(lesson)) + 1))
        generate(args.lesson.resolve(), lines)
    else:
        parser.print_help()


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    main()
