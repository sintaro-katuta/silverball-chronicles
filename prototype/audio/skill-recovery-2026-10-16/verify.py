"""Portable smoke checks for the restored effect skill; writes only to --out."""
from pathlib import Path
import argparse
import copy
import hashlib
import json
import os
import re
import subprocess
import sys

import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[3]
SKILL = ROOT / '.agents/skills/pachinko-sound-design'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--out', type=Path, required=True)
args = parser.parse_args()
out = args.out.resolve()
if out.exists() and any(out.iterdir()):
    parser.error('Use a new empty output directory')
out.mkdir(parents=True, exist_ok=True)
env = os.environ | {'OPENBLAS_NUM_THREADS': '1', 'MPLCONFIGDIR': str(out/'mpl'), 'NUMBA_CACHE_DIR': str(out/'numba')}
sys.path.insert(0, str(SKILL/'scripts'))
from render import validate, synthesize
from compare import compare

base = json.loads((SKILL/'assets/approved-presets.json').read_text())
validate(base)
rejected = []
for case in ['negative_pitch', 'event_overrun', 'duplicate_id', 'unknown_key', 'nan_gain', 'unsafe_id']:
    d = copy.deepcopy(base)
    if case == 'negative_pitch': d['cues'][0]['events'][1]['pitch_hz'][0][1] = -1
    if case == 'event_overrun': d['cues'][0]['events'][0]['duration_s'] = 99
    if case == 'duplicate_id': d['cues'][1]['id'] = d['cues'][0]['id']
    if case == 'unknown_key': d['cues'][0]['events'][0]['gaim'] = 1
    if case == 'nan_gain': d['cues'][0]['events'][0]['gain'] = float('nan')
    if case == 'unsafe_id': d['cues'][0]['id'] = '../escape'
    try:
        validate(d)
    except ValueError:
        rejected.append(case)
    else:
        raise AssertionError(case)
a = synthesize(base['cues'][0])
synthesize(base['cues'][1])
assert np.array_equal(a, synthesize(base['cues'][0]))
x = a.mean(1)
assert compare(x, x, 48000)['objective'] < 1e-9
assert compare(x, x*.25, 48000)['objective'] < 1e-9
assert compare(x, np.roll(x, 2400), 48000)['objective'] > .1

def run(*arguments):
    subprocess.run([sys.executable, *map(str, arguments)], cwd=ROOT, env=env, check=True)

run(SKILL/'scripts/render.py', '--design', SKILL/'assets/approved-presets.json', '--only', 'steel-verdict', '--out', out/'generic')
run(SKILL/'scripts/render_pulse.py', '--out', out/'pulse')
files = []
for file in [out/'generic/steel-verdict.wav', out/'pulse/moon-release.wav']:
    sr, y = wavfile.read(file)
    assert sr == 48000 and y.ndim == 2 and y.shape[1] == 2
    assert np.isfinite(y).all() and np.all(y[[0, -1]] == 0)
    assert np.max(np.abs(y.astype(np.float64))) < 2**31-1
    files.append({'file': str(file.relative_to(out)), 'frames': len(y), 'sample_rate': sr})
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(file.with_suffix('.mp3')), '-f', 'null', '-'], check=True)

sr = 22050
t = np.arange(round(1.8*sr))/sr
y = .2*np.sin(2*np.pi*440*t)
y[(t >= .65) & (t < 1.15)] = 0
wavfile.write(out/'tone-gap.wav', sr, y.astype(np.float32))
run(SKILL/'scripts/pitch_compare.py', '--audio', 'reference='+str(out/'tone-gap.wav'), '--audio', 'candidate='+str(out/'tone-gap.wav'), '--fmin', 200, '--fmax', 1000, '--frame-length', 2048, '--range-reason', 'Known 440Hz diagnostic with silence gap; missing F0 must stay null', '--out', out/'pitch')
p = json.loads((out/'pitch/pitch-analysis.json').read_text())
frames = p['files'][0]['frames']
gap = [f for f in frames if .8 < f['time_s'] < 1]
assert gap and all(f['f0_hz'] is None for f in gap)
estimated = float(np.median([f['f0_hz'] for f in frames if f['accepted']]))
assert abs(estimated-440) < 5
assert p['paired_diagnostics'][0]['median_semitone_delta'] == 0
for file in SKILL.rglob('*.md'):
    for link in re.findall(r'\]\(([^)]+)\)', file.read_text()):
        if ':' not in link and not link.startswith('#'):
            assert (file.parent/link.split('#')[0]).exists(), (file, link)
html = (out/'generic/index.html').read_text()
(out/'preview.js').write_text(re.search('<script>(.*?)</script>', html, re.S)[1])
subprocess.run(['node', '--check', str(out/'preview.js')], check=True)
digest = hashlib.sha256((out/'pulse/moon-release.wav').read_bytes()).hexdigest()
report = {
    'invalid_designs_rejected': rejected,
    'per_cue_rng_reproducible': True,
    'proxy_identity_gain_shift_sanity': True,
    'rendered_files': files,
    'wav_and_mp3_decode': 'passed',
    'known_hz': 440, 'estimated_hz': estimated, 'gap_f0_stays_null': True,
    'preview_js_and_reference_links': 'passed',
    'pulse_wav_sha256': digest,
    'historical_pulse_sha256_match': digest == '4d873b3468ce37244badef9b3dd22c6a0765ec4b163e553a5b03b3e7b352207c',
    'note': 'Historical file hash is environment-sensitive; not a new auditory acceptance.',
    'browser': 'not run', 'subjective': 'pending; past preference only', 'game_integration': 'not requested',
}
(out/'validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(report, ensure_ascii=False, indent=2))
