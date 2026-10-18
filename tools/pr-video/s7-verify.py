"""Verify S7 media inputs and, explicitly, an existing render; never render or synthesize."""
import argparse
import hashlib
import json
import math
import re
import shutil
import subprocess
import wave
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
IDS = ['purpose', 'aim', 'flight', 'flow', 'result', 'diagnostics', 'limits']


def sha(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def load(path):
    return json.loads(Path(path).read_text())


def save(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def command(args, log=None):
    p = subprocess.run(args, capture_output=True, text=True)
    if log:
        Path(log).write_text(p.stdout + p.stderr)
    require(p.returncode == 0, f'Command failed ({p.returncode}): {args!r}\n{p.stderr[-3000:]}')
    return p


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=ROOT / 'prototype/reference-review/s7-20261015/pr-video')
    parser.add_argument('--original-evidence', type=Path, default=Path('/Users/sintaro.katuta/dev/silverball-chronicles/prototype/reference-review/s7-20261015/evidence-clips'))
    parser.add_argument('--verify-render', action='store_true', help='Run full decode/audio/extractions only after render completion.')
    args = parser.parse_args()
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    script_dir = ROOT / 'docs/agile/s7-video'
    script = load(script_dir / 'script.json')
    review = load(script_dir / '.script.md.yukkuri-review.json')
    data = load(ROOT / 'tools/pr-video/s7-data.json')
    timeline_path = out / 'public/audio/timeline.json'
    timeline = load(timeline_path)
    require(review['status'] == 'APPROVED', 'Spoken script is not approved')
    require(review['script_sha256'] == sha(script_dir / 'script.json'), 'Approved JSON changed')
    require(review['script_markdown_sha256'] == sha(script_dir / 'script.md'), 'Approved Markdown changed')
    require(review['line_ids'] == IDS == [c['id'] for c in timeline['clips']], 'Seven approved IDs/order differ')
    require(script['lines'] == data['approvedLines'], 'Composition approved lines differ')
    require([c['text'] for c in timeline['clips']] == [c['text'] for c in script['lines']], 'Narration text/order differs')
    require(data['timeline'] == timeline and timeline['fps'] == 30, 'Composition timeline differs')
    markdown_paragraphs = [p.strip() for p in (script_dir / 'script.md').read_text().split('\n\n') if p.strip() and not p.strip().startswith('#')]
    require(markdown_paragraphs == [c['text'] for c in script['lines']], 'Markdown paragraphs differ')
    inputs = [script_dir / n for n in ['script.json', 'script.md', '.script.md.yukkuri-review.json']]
    inputs += [ROOT / 'tools/pr-video' / n for n in ['s7-index.tsx', 's7-data.json', 's7-verify.py']]
    inputs += [timeline_path]
    wavs, cursor = [], 0.0
    for c in timeline['clips']:
        path = out / 'public/audio' / c['audio_file']
        require(path.parent == out / 'public/audio', 'Unsafe WAV path')
        with wave.open(str(path), 'rb') as w:
            seconds = w.getnframes() / w.getframerate()
            wav = {'id': c['id'], 'file': c['audio_file'], 'sha256': sha(path), 'frames': w.getnframes(), 'sampleRate': w.getframerate(), 'channels': w.getnchannels(), 'sampleWidth': w.getsampwidth(), 'seconds': seconds}
        require(c['speaker'] == 3 and abs(c['duration_seconds'] - seconds) < 0.000002, f'WAV duration/style differs: {c["id"]}')
        require(c['duration_frames'] == math.ceil(seconds * 30), f'WAV frame duration differs: {c["id"]}')
        require(abs(c['start_seconds'] - cursor) < 0.000002 and c['start_frame'] == round(cursor * 30), f'WAV start differs: {c["id"]}')
        require(abs(c['end_seconds'] - cursor - seconds) < 0.000002, f'WAV end differs: {c["id"]}')
        cursor += seconds + c['gap_after_seconds']
        wavs.append(wav)
        inputs.append(path)
    require(abs(timeline['total_duration_seconds'] - cursor) < 0.000002 and timeline['total_duration_frames'] == math.ceil(cursor * 30), 'Total timeline differs')
    media = []
    require(len(data['media']) == 5, 'Expected five original clips')
    for m in data['media']:
        folder = 'short-attempt02' if m['id'].startswith('short-') else 'long'
        original = args.original_evidence / folder / m['file']
        copy = out / 'public' / m['file']
        last = out / 'public' / m['lastImage']
        require(sha(original) == sha(copy) == m['sha256'], f'Original/public clip changed: {m["id"]}')
        require(sha(last) == m['lastImageSHA'], f'Endpoint still changed: {m["id"]}')
        inputs += [original, copy, last]
        metadata = args.original_evidence / folder / 'capture.json'
        require(metadata.is_file(), 'Original capture metadata missing')
        inputs.append(metadata)
        media.append({**m, 'original': str(original), 'publicCopy': str(copy), 'originalUnchanged': True})
    for p in [ROOT / 'package.json', ROOT / 'package-lock.json', args.original_evidence / 'EVIDENCE_VERIFICATION.json']:
        if p.is_file():
            inputs.append(p)
    correction = {'text': 'ヘソ率は2条件で低下・一般41→33／本編設定0.18・公開前', 'x': 24, 'y': 90, 'w': 1232, 'h': 32, 'baselineY': 111, 'background': '#071421'}
    require(data['correction'] == correction, 'Editorial correction changed')
    composition = (ROOT / 'tools/pr-video/s7-index.tsx').read_text()
    for fragment in ['x={28}', 'y={111}', 'fontSize={21}', 'VOICEVOX', 'ずんだもん']:
        require(fragment in composition, f'Composition contract missing: {fragment}')
    # This records source coordinates; exported pixels require separate visual review.
    manifest = [{'path': str(p), 'bytes': p.stat().st_size, 'sha256': sha(p)} for p in sorted(set(inputs))]
    existing = out / 'verification-inputs.json'
    if args.verify_render:
        require(existing.is_file(), 'Run lightweight input verification before rendering')
        require(load(existing)['files'] == manifest, 'Inputs changed since pre-render verification; review and prepare again')
    else:
        save(existing, {'createdAt': datetime.now(timezone.utc).isoformat(), 'scope': 'Approved speech, composition and five unchanged original clips; separate from frozen mechanical source.', 'files': manifest})
    production = load(out / 'PRODUCTION.json')
    for entry in production['inputs']:
        path = ROOT / entry['path']
        require(path.stat().st_size == entry['bytes'] and sha(path) == entry['sha256'], f'Render input differs: {entry["path"]}')
    proof = {'renderInputs': production['inputs'], 'approval': review, 'timelineFrames': timeline['total_duration_frames'], 'timelineSeconds': cursor, 'wavs': wavs, 'media': media, 'correctionSourceCoordinates': correction, 'inputManifest': existing.name, 'voiceCredit': 'VOICEVOX:ずんだもん', 'nativePlayback': 'pending PM', 'PRPlayer': 'pending PM', 'humanHearing': 'not evaluated by this verifier'}
    if not args.verify_render:
        save(out / 'INPUT_VERIFICATION.json', proof)
        print(json.dumps({'inputsVerified': True, 'clips': 7, 'frames': timeline['total_duration_frames'], 'renderVerification': 'not run'}, ensure_ascii=False))
        return
    ffmpeg, ffprobe = shutil.which('ffmpeg'), shutil.which('ffprobe')
    require(ffmpeg and ffprobe, 'ffmpeg/ffprobe required')
    movie = out / 's7-review.mp4'
    probe = json.loads(command([ffprobe, '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(movie)]).stdout)
    save(out / 'ffprobe.json', probe)
    videos = [s for s in probe['streams'] if s['codec_type'] == 'video']
    audios = [s for s in probe['streams'] if s['codec_type'] == 'audio']
    require(len(videos) == len(audios) == 1, 'Expected one video and one audio stream')
    v, a = videos[0], audios[0]
    require((v['codec_name'], v['width'], v['height'], v['r_frame_rate'], a['codec_name']) == ('h264', 1920, 1080, '30/1', 'aac'), 'Export format differs')
    require(int(v['nb_frames']) == timeline['total_duration_frames'], 'Export frames differ from timeline')
    require(abs(float(v['duration']) - timeline['total_duration_frames'] / 30) < 0.0001, 'Video duration differs')
    result = command([ffmpeg, '-v', 'error', '-xerror', '-i', str(movie), '-f', 'null', '-'], out / 'full-decode.log')
    require(not result.stderr.strip(), 'Decode emitted errors')
    energy = []
    for c in timeline['clips']:
        start = c['start_frame'] / 30
        r = command([ffmpeg, '-hide_banner', '-nostats', '-ss', str(start), '-i', str(movie), '-t', str(c['duration_frames'] / 30), '-vn', '-af', 'volumedetect', '-f', 'null', '-'], out / f'audio-energy-{c["id"]}.log')
        match = re.search(r'max_volume:\s*(-?\d+(?:\.\d+)?|\-inf) dB', r.stderr)
        require(match and math.isfinite(float(match[1])), f'Muted narration interval: {c["id"]}')
        energy.append({'id': c['id'], 'startSeconds': start, 'durationSeconds': c['duration_frames'] / 30, 'maxDBFS': float(match[1]), 'scope': 'Nonzero decoded audio energy, not human speech/transcript assessment'})
    extracts = []
    extract_plan = [(c['id'], c['start_frame'] + min(30, c['duration_frames'] // 2)) for c in timeline['clips']]
    flow_start = next(c['start_frame'] for c in timeline['clips'] if c['id'] == 'flow')
    extract_plan += [('flow-transition-before', flow_start + 119), ('flow-transition-after', flow_start + 120), ('flow-baseline-admission', flow_start + 150), ('flow-candidate-admission', flow_start + 225), ('flow-final-hold', flow_start + 260), ('final', timeline['total_duration_frames'] - 1)]
    for name, frame in extract_plan:
        p = out / f'export-{name}.png'
        command([ffmpeg, '-y', '-v', 'error', '-i', str(movie), '-vf', f'select=eq(n\\,{frame})', '-fps_mode', 'vfr', '-frames:v', '1', str(p)])
        extracts.append({'scene': name, 'frame': frame, 'seconds': frame / 30, 'file': p.name, 'sha256': sha(p)})
    require(all(sha(item['path']) == item['sha256'] for item in manifest), 'Input changed during verification')
    proof.update({'movie': {'file': movie.name, 'sha256': sha(movie), 'bytes': movie.stat().st_size, 'under10MB': movie.stat().st_size < 10_000_000, 'frames': int(v['nb_frames']), 'seconds': float(v['duration']), 'format': '1920x1080 30fps H264/AAC'}, 'fullDecode': {'exitCode': 0, 'errorLogBytes': (out / 'full-decode.log').stat().st_size}, 'audioEnergy': energy, 'actualMP4Extractions': extracts, 'actualExtractedVisualReview': 'pending Designer/PM', 'inputsUnchangedDuringVerification': True})
    save(out / 'VIDEO_VERIFICATION.json', proof)
    archive = out / 'executed-verification-source'
    archive.mkdir(exist_ok=True)
    for name in ['s7-index.tsx', 's7-data.json', 's7-verify.py']:
        shutil.copy2(ROOT / 'tools/pr-video' / name, archive / name)
    print(json.dumps(proof['movie'], ensure_ascii=False))


if __name__ == '__main__':
    main()
