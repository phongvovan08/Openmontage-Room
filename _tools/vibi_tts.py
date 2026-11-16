"""Shared multi-project Vibi TTS tool (api.vibi.pro) for OpenMontage & English-Channel.

Supports both:
1. Multi-project OpenMontage narration (--project / --text / --text-file / --voice / --voices):
   - Reads voice pool from _tools/vibi_voice_pool.json (synced with C:/Users/ACER/Desktop/VIBI_VOICE/English-Channel/_tools).
   - Persists chosen voice per project in <project>/tts_voice.json so re-renders keep the same narrator.
   - Caches synthesized audio+SRT pieces in _tools/.cache/vibi_pieces so unchanged lines cost 0 credits across projects.
   - Exports .mp3, .srt, and Remotion-ready word_timestamps JSON for <CaptionOverlay> / InnerThoughtsEpisode.
2. Lesson batch mode (--lesson / --lines / --all) compatible with VIBI_VOICE/English-Channel.

Usage examples:
  python _tools/vibi_tts.py --voices
  python _tools/vibi_tts.py --me
  python _tools/vibi_tts.py --history
  python _tools/vibi_tts.py --project projects/my_video --text-file script.txt --voice Haitrieu
  python _tools/vibi_tts.py --text "Xin chào" --voice Lacthien --out-mp3 out.mp3 --out-srt out.srt --out-json out.json
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
import secrets
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

try:
    from prepare_capcut import normalized, parse_srt, srt_text, stale_tts, stamp, tts_items
except ImportError:
    def stamp(ms: int) -> str:
        s, ms = divmod(max(0, ms), 1000)
        m, s = divmod(s, 60)
        h, m = divmod(m, 60)
        return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'

    def parse_srt(path: Path) -> list[tuple[int, int, str]]:
        cues = []
        raw = path.read_text(encoding='utf-8-sig', errors='replace')
        for m in re.finditer(
            r'(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*\n([\s\S]*?)(?=\n\s*\n|\Z)',
            raw,
        ):
            h1, m1, s1, ms1, h2, m2, s2, ms2, txt = m.groups()
            t1 = ((int(h1) * 60 + int(m1)) * 60 + int(s1)) * 1000 + int(ms1)
            t2 = ((int(h2) * 60 + int(m2)) * 60 + int(s2)) * 1000 + int(ms2)
            cues.append((t1, t2, txt.strip()))
        return cues

    def srt_text(srt: str) -> str:
        lines = [
            l.strip()
            for l in srt.splitlines()
            if l.strip() and not l.strip().isdigit() and '-->' not in l
        ]
        return ' '.join(lines)

    def normalized(s: str) -> str:
        return re.sub(r'\W+', '', s.lower())

    def stale_tts(*_a, **_kw):
        return []

    def tts_items(*_a, **_kw):
        return []


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
EXTERNAL_VIBI_TOOLS = Path(r'C:\Users\ACER\Desktop\VIBI_VOICE\English-Channel\_tools')
API = 'https://api.vibi.pro'
CONFIG = HERE / 'vibi_tts.json'
VOICE_POOL = HERE / 'vibi_voice_pool.json'
SHARED_CACHE = HERE / '.cache' / 'vibi_pieces'
KEY_FILE = HERE / '.vibi_api_key'
ROOT_KEY_FILE = ROOT / '.vibi_api_key'
EXTERNAL_KEY_FILE = EXTERNAL_VIBI_TOOLS / '.vibi_api_key'
ENV_FILE = ROOT / '.env'
# Cloudflare in front of the API rejects Python's default User-Agent (error 1010).
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) vibi-tts-lesson/1.0'
BATCH = 38          # Vibi API enforces max 40 POST /v1/text-to-speech per 60-second window
WORKERS = 20        # concurrent HTTP threads
SILENCE_DB = -45
PIECE_LUFS = -16.0
PIECE_PEAK = 0.447  # linear, about -7 dBFS


def loudness(path: Path) -> float:
    log = run(['ffmpeg', '-hide_banner', '-i', str(path), '-af', 'ebur128', '-f', 'null', '-'])
    found = re.findall(r'I:\s+(-?[\d.]+) LUFS', log)
    return float(found[-1]) if found else PIECE_LUFS


def api_key() -> str:
    key = os.environ.get('VIBI_API_KEY', '').strip()
    if not key and ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding='utf-8', errors='ignore').splitlines():
            line = line.strip()
            if line.startswith('VIBI_API_KEY='):
                key = line.partition('=')[2].strip().strip('\'"')
                break
    for candidate in (ROOT_KEY_FILE, KEY_FILE, EXTERNAL_KEY_FILE):
        if not key and candidate.exists():
            key = candidate.read_text(encoding='utf-8').strip()
    if not key:
        raise SystemExit(f'Chưa có API key: đặt biến VIBI_API_KEY trong .env hoặc ghi key vào {ROOT_KEY_FILE}')
    return key


def load_voice_pool() -> dict:
    for candidate in (VOICE_POOL, EXTERNAL_VIBI_TOOLS / 'vibi_voice_pool.json'):
        if candidate.exists():
            return json.loads(candidate.read_text(encoding='utf-8'))
    if CONFIG.exists():
        default_voice = json.loads(CONFIG.read_text(encoding='utf-8'))
        return {'selection': 'fixed_default', 'voices': [{**default_voice, 'enabled': True}]}
    return {'selection': 'none', 'voices': []}


def resolve_voice_by_name_or_id(query: str | None) -> dict:
    pool = load_voice_pool()
    voices = pool.get('voices', [])
    if query:
        q = query.strip().lower()
        for v in voices:
            if v.get('voice_name', '').lower() == q or v.get('voice_id', '').lower() == q:
                return {k: val for k, val in v.items() if k != 'enabled'}
        # Allow raw UUID even if not in pool
        if len(query.strip()) >= 16:
            base = json.loads(CONFIG.read_text(encoding='utf-8')) if CONFIG.exists() else {
                'provider': 'minimax',
                'model_id': 'speech-2.8-hd',
                'language_code': 'Vietnamese',
                'voice_settings': {'speed': 1.1, 'pitch': 0, 'vol': 1},
            }
            base['voice_id'] = query.strip()
            base['voice_name'] = query.strip()
            return base
        available = ', '.join(f"{v.get('voice_name')} ({v.get('voice_id')[:8]}...)" for v in voices)
        raise SystemExit(f'Không tìm thấy giọng "{query}". Các giọng có sẵn trong pool: {available}')
    enabled = [v for v in voices if v.get('enabled') and v.get('voice_id')]
    if enabled:
        return {k: val for k, val in enabled[0].items() if k != 'enabled'}
    if CONFIG.exists():
        return json.loads(CONFIG.read_text(encoding='utf-8'))
    raise SystemExit('Chưa cấu hình vibi_voice_pool.json hoặc vibi_tts.json')


def show_voices() -> None:
    pool = load_voice_pool()
    print(f"Chế độ chọn giọng mặc định: {pool.get('selection', 'default')}")
    for v in pool.get('voices', []):
        status = 'ENABLED (Mặc định)' if v.get('enabled') else 'disabled (có thể gọi bằng --voice)'
        vs = v.get('voice_settings', {})
        print(
            f"  - {v.get('voice_name', 'Unknown'):<10} | id={v.get('voice_id')} | "
            f"model={v.get('model_id')} | speed={vs.get('speed', 1.0)} | {status}"
        )


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
        request = urllib.request.Request(
            API + path,
            method=method,
            data=json.dumps(body).encode() if body else None,
            headers={
                'xi-api-key': api_key(),
                'Content-Type': 'application/json',
                'User-Agent': USER_AGENT,
            },
        )
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
    return result.get('srt_url') or next(
        (v for v in result.values() if isinstance(v, str) and v.endswith('.srt')),
        None,
    )


def show_history() -> None:
    for task in call('GET', '/v1/history?page_size=10&page=0')['tasks']:
        meta = task.get('metadata') or {}
        print(
            json.dumps(
                {k: task.get(k) for k in ('created_at', 'status', 'provider', 'voice_id', 'model_id')}
                | {
                    'language_code': meta.get('language_code'),
                    'voice_settings': meta.get('voice_settings'),
                    'result': task.get('result'),
                    'text': (task.get('text') or '')[:60],
                },
                ensure_ascii=False,
            )
        )


def api_fields(settings: dict) -> dict:
    """Settings sent to the API; pitch_shift and notes are applied or read locally, never sent or keyed."""
    return {k: v for k, v in settings.items() if k != 'pitch_shift' and not k.startswith('_')}


def piece_key(voice: dict, settings: dict, text: str) -> str:
    return hashlib.sha1(
        json.dumps([voice['voice_id'], settings, text], ensure_ascii=False, sort_keys=True).encode()
    ).hexdigest()[:16]


def synthesize(jobs: list[tuple[str, str]], voice: dict, cache: Path | None = SHARED_CACHE) -> list[tuple[bytes, bytes]]:
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
        task = call(
            'POST',
            f'/v1/text-to-speech/{voice["voice_id"]}',
            {**settings, 'text': text, 'export_transcript': True},
        )
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
                    for tid, info in zip(
                        missing_ids, pool.map(lambda t: call('GET', f'/v1/history/{t}'), missing_ids)
                    ):
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


def srt_to_word_timestamps(srt_content: str) -> list[dict]:
    """Convert SRT cues into word-level timestamps & Remotion <CaptionOverlay> captions."""
    words_out: list[dict] = []
    pattern = re.compile(
        r'(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*\n([\s\S]*?)(?=\n\s*\n|\Z)'
    )
    for m in pattern.finditer(srt_content):
        h1, m1, s1, ms1, h2, m2, s2, ms2, txt = m.groups()
        start_s = int(h1) * 3600 + int(m1) * 60 + int(s1) + int(ms1) / 1000.0
        end_s = int(h2) * 3600 + int(m2) * 60 + int(s2) + int(ms2) / 1000.0
        cue_words = [w for w in ' '.join(txt.splitlines()).split() if w]
        if not cue_words:
            continue
        dur = max(0.05, end_s - start_s)
        step = dur / len(cue_words)
        for i, w in enumerate(cue_words):
            w_start = round(start_s + i * step, 3)
            w_end = round(start_s + (i + 1) * step, 3)
            words_out.append({
                'word': w,
                'start': w_start,
                'end': w_end,
                'startMs': int(round(w_start * 1000)),
                'endMs': int(round(w_end * 1000)),
                'pageBreakAfter': w.endswith(('.', '?', '!', ':')),
            })
    return words_out


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
    """Trim, pad and concatenate the pieces into audio_out; return the merged SRT, one cue per sentence."""
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


def select_voice_config(base: Path, config: Path | None = None, voice_override: str | None = None) -> Path:
    """Choose once for a project/lesson; preserve explicit choices and legacy audio."""
    base.mkdir(parents=True, exist_ok=True)
    saved = base / 'tts_voice.json'
    if voice_override:
        chosen = resolve_voice_by_name_or_id(voice_override)
        chosen['_selection'] = 'explicit_override'
        saved.write_text(json.dumps(chosen, ensure_ascii=False, indent=2), encoding='utf-8')
        return saved
    if config is not None:
        return config
    if saved.exists():
        return saved
    audio_folder = base / 'audio_tts'
    if audio_folder.exists() and any(p.suffix.lower() in ('.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg')
                                     for p in audio_folder.iterdir() if p.is_file()):
        return CONFIG
    pool = load_voice_pool()
    candidates = [v for v in pool.get('voices', []) if v.get('enabled') and v.get('voice_id')]
    if not candidates:
        return CONFIG
    voice = {k: v for k, v in secrets.choice(candidates).items() if k != 'enabled'}
    voice['_selection'] = pool.get('selection', 'random_once_per_video')
    try:
        with saved.open('x', encoding='utf-8') as stream:
            json.dump(voice, stream, ensure_ascii=False, indent=2)
    except FileExistsError:
        pass
    return saved


def synthesize_project_narration(
    text: str,
    project_dir: Path | None = None,
    voice_name_or_id: str | None = None,
    out_mp3: Path | None = None,
    out_srt: Path | None = None,
    out_json: Path | None = None,
    lang: str = 'vi',
) -> dict:
    """High-level helper reusable across all OpenMontage projects (supports lang='vi' or lang='en')."""
    if project_dir is not None:
        cfg_path = select_voice_config(project_dir, voice_override=voice_name_or_id)
        voice = json.loads(cfg_path.read_text(encoding='utf-8'))
        audio_dir = project_dir / 'audio'
        audio_dir.mkdir(parents=True, exist_ok=True)
        suffix = '_en' if lang == 'en' else ''
        out_mp3 = out_mp3 or (audio_dir / f'narration{suffix}.mp3')
        out_srt = out_srt or (audio_dir / f'narration{suffix}.srt')
        out_json = out_json or (audio_dir / f'tts_result{suffix}.json')
    else:
        voice = resolve_voice_by_name_or_id(voice_name_or_id)

    clean_text = ' '.join(text.split())
    print(
        f'Đang tạo TTS [{lang.upper()}] với giọng: {voice.get("voice_name", voice["voice_id"])} ({voice["voice_id"]})...',
        flush=True,
    )
    audio_bytes, srt_bytes = synthesize([(lang, clean_text)], voice, cache=SHARED_CACHE)[0]
    srt_str = srt_bytes.decode('utf-8-sig', errors='replace')
    word_timestamps = srt_to_word_timestamps(srt_str)

    if out_mp3:
        out_mp3.parent.mkdir(parents=True, exist_ok=True)
        out_mp3.write_bytes(audio_bytes)
    if out_srt:
        out_srt.parent.mkdir(parents=True, exist_ok=True)
        out_srt.write_text(srt_str, encoding='utf-8')

    payload = {
        'provider': 'vibi',
        'vibi_provider': voice.get('provider', 'minimax'),
        'model': voice.get('model_id', 'speech-2.8-hd'),
        'language': lang,
        'voice_name': voice.get('voice_name', ''),
        'voice_id': voice['voice_id'],
        'voice_settings': voice.get('english', {}).get('voice_settings', voice.get('voice_settings', {}))
        if lang == 'en'
        else voice.get('voice_settings', {}),
        'text_length': len(clean_text),
        'output': str(out_mp3) if out_mp3 else '',
        'srt_path': str(out_srt) if out_srt else '',
        'word_timestamps': word_timestamps,
    }
    if out_json:
        out_json.parent.mkdir(parents=True, exist_ok=True)
        out_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    return payload


def generate(base: Path, lines: list[int] | None, config: Path | None = None, voice_override: str | None = None) -> None:
    lesson = json.loads((base / 'lesson.json').read_text(encoding='utf-8'))
    config = select_voice_config(base, config, voice_override=voice_override)
    if not config.exists():
        raise SystemExit(f'Chưa có {CONFIG.name}: chạy --history, rồi ghi voice_id, provider, model_id, '
                         'language_code, voice_settings của giọng đang dùng vào file đó.')
    voice = json.loads(config.read_text(encoding='utf-8'))
    print(f'Giọng video: {voice.get("voice_name", voice["voice_id"])} ({config.name})', flush=True)
    items = tts_items(lesson)
    chosen = [items[n - 1] for n in lines] if lines else stale_tts(lesson, base)
    if not chosen:
        print('Mọi dòng TTS đã có audio khớp chữ, không cần tạo.')
        return
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
    parser.add_argument('--lesson', type=Path, help='Lesson folder (English-Channel mode)')
    parser.add_argument('--project', type=Path, help='OpenMontage project folder (auto-saves audio/ and tts_voice.json)')
    parser.add_argument('--config', type=Path, help='Voice JSON config override')
    parser.add_argument('--voice', help='Voice name in vibi_voice_pool.json (e.g. Haitrieu, Lacthien, Zoe 2, vanhoc) or voice_id')
    parser.add_argument('--voices', action='store_true', help='List all voices in vibi_voice_pool.json')
    parser.add_argument('--lines', help='comma-separated line numbers of TTS_1_DONG_1_GIAI_THICH.txt')
    parser.add_argument('--all', action='store_true',
                        help='remake every line (cached pieces are reused, so only the joining is redone)')
    parser.add_argument('--history', action='store_true')
    parser.add_argument('--me', action='store_true')
    parser.add_argument('--text', help='Direct text string to synthesize via Vibi API')
    parser.add_argument('--text-file', type=Path, help='Path to UTF-8 text file to synthesize')
    parser.add_argument('--lang', choices=('vi', 'en'), default='vi', help='Language mode: vi (Vietnamese) or en (English for Global/US channels)')
    parser.add_argument('--out-mp3', type=Path, help='Output MP3 path for --text / --text-file mode')
    parser.add_argument('--out-srt', type=Path, help='Output SRT path for --text / --text-file mode')
    parser.add_argument('--out-json', type=Path, help='Output Remotion word_timestamps JSON path')
    args = parser.parse_args()

    if args.me:
        print(json.dumps(call('GET', '/v1/auth/me'), ensure_ascii=False, indent=2))
    elif args.voices:
        show_voices()
    elif args.history:
        show_history()
    elif args.text or args.text_file:
        raw_text = args.text if args.text else args.text_file.read_text(encoding='utf-8')
        res = synthesize_project_narration(
            text=raw_text,
            project_dir=args.project.resolve() if args.project else None,
            voice_name_or_id=args.voice,
            out_mp3=args.out_mp3,
            out_srt=args.out_srt,
            out_json=args.out_json,
            lang=args.lang,
        )
        print(
            f"Xong TTS ({res.get('voice_name') or res['voice_id']}): "
            f"mp3={res['output']} srt={res['srt_path']} words={len(res['word_timestamps'])}"
        )
    elif args.lesson:
        lines = [int(x) for x in args.lines.split(',')] if args.lines else None
        if args.all:
            lesson = json.loads((args.lesson / 'lesson.json').read_text(encoding='utf-8'))
            lines = list(range(1, len(tts_items(lesson)) + 1))
        generate(
            args.lesson.resolve(),
            lines,
            args.config.resolve() if args.config else None,
            voice_override=args.voice,
        )
    else:
        parser.print_help()


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    main()
