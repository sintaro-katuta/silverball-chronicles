#!/usr/bin/env python3
"""Compare aligned audio using librosa STFT and pYIN; never fill missing F0."""
import argparse, hashlib, json
from pathlib import Path
import numpy as np
import librosa
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--audio', action='append', required=True, help='label=path (aligned, same duration)')
    p.add_argument('--fmin', type=float, required=True)
    p.add_argument('--fmax', type=float, required=True)
    p.add_argument('--range-reason', required=True)
    p.add_argument('--sr', type=int, default=22050)
    p.add_argument('--frame-length', type=int, default=4096)
    p.add_argument('--hop-length', type=int, default=256)
    p.add_argument('--confidence', type=float, default=.8)
    p.add_argument('--silence-db', type=float, default=-60, help='absolute dBFS RMS floor')
    p.add_argument('--display-max', type=float, default=10000)
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    if not (0 < a.fmin < a.fmax < a.sr/2 and 0 <= a.confidence <= 1):
        p.error('invalid frequency range or confidence')
    if a.frame_length < 2*a.sr/a.fmin:
        p.error('frame too short: use at least two cycles of fmin')
    if a.out.exists() and any(a.out.iterdir()):
        p.error('output directory must be empty')
    rows = []
    for spec in a.audio:
        label, filename = spec.split('=', 1)
        path = Path(filename)
        y, sr = librosa.load(path, sr=a.sr, mono=True)
        if not np.isfinite(y).all():
            p.error('nonfinite audio')
        rows.append({'label':label, 'path':str(path.resolve()), 'sha256':hashlib.sha256(path.read_bytes()).hexdigest(), 'y':y})
    if len({len(r['y']) for r in rows}) != 1:
        p.error('align/crop inputs explicitly first; no automatic time warping')
    a.out.mkdir(parents=True, exist_ok=True)
    for r in rows:
        y = r['y']
        r['s'] = np.abs(librosa.stft(y, n_fft=a.frame_length, hop_length=a.hop_length, window='hann', center=True))
        f0, flag, prob = librosa.pyin(y, sr=a.sr, fmin=a.fmin, fmax=a.fmax, frame_length=a.frame_length, hop_length=a.hop_length, fill_na=np.nan, center=True)
        rms = librosa.feature.rms(y=y, frame_length=a.frame_length, hop_length=a.hop_length)[0]
        t = librosa.times_like(f0, sr=a.sr, hop_length=a.hop_length)
        # Padded boundaries and very low amplitude are not reliable observations.
        valid = flag & np.isfinite(f0) & (prob >= a.confidence) & (rms >= 10**(a.silence_db/20)) & (t >= a.frame_length/(2*a.sr)) & (t <= len(y)/a.sr-a.frame_length/(2*a.sr))
        r.update(t=t, f0=np.where(valid, f0, np.nan), prob=prob, flag=flag, valid=valid)
        print(r['label'], 'valid F0 coverage', round(float(np.mean(valid))*100, 1), '%', flush=True)
    fig, axes = plt.subplots(len(rows), 1, figsize=(14, 3*len(rows)), sharex=True, sharey=True, squeeze=False)
    ref = max(float(r['s'].max()) for r in rows)
    freq = librosa.fft_frequencies(sr=a.sr, n_fft=a.frame_length)
    for ax, r in zip(axes[:,0], rows):
        db = librosa.amplitude_to_db(r['s'], ref=ref, top_db=None)
        mesh = ax.pcolormesh(r['t'], freq, db, shading='auto', cmap='magma', vmin=-80, vmax=0)
        ax.set(yscale='log', ylim=(40, min(a.display_max,a.sr/2)), ylabel='Hz', title=r['label'])
        ax.axhline(a.fmin, color='cyan', lw=.6, ls=':'); ax.axhline(a.fmax, color='cyan', lw=.6, ls=':')
    axes[-1,0].set_xlabel('Time (s)'); fig.colorbar(mesh, ax=axes[:,0].tolist(), label='dB (shared reference)')
    fig.savefig(a.out/'spectrograms.png', dpi=150, bbox_inches='tight'); plt.close(fig)
    fig, axes = plt.subplots(2, 1, figsize=(14,7), sharex=True)
    for r in rows:
        axes[0].plot(r['t'],r['f0'],marker='.',markersize=2,label=f"{r['label']} ({np.mean(r['valid'])*100:.1f}% valid)", lw=1.2)
        axes[1].plot(r['t'],r['prob'],label=r['label'],lw=.8)
    axes[0].set(yscale='log', ylim=(a.fmin,a.fmax),ylabel='Estimated F0 (Hz)', title='pYIN: gaps are unestimated, no interpolation')
    axes[0].legend(); axes[0].grid(alpha=.3)
    axes[1].axhline(a.confidence, color='gray',ls=':'); axes[1].set(xlabel='Time (s)',ylabel='Voicing probability',ylim=(0,1)); axes[1].legend()
    fig.tight_layout(); fig.savefig(a.out/'f0.png',dpi=150); plt.close(fig)
    result = {'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'librosa_version':librosa.__version__, 'numpy_version':np.__version__, 'settings':vars(a)|{'out':str(a.out)}, 'alignment':'input sample zero; no time warping', 'mono':'librosa channel average', 'amplitude':'no normalization; shared STFT dB reference', 'files':[]}
    for r in rows:
        result['files'].append({k:r[k] for k in ['label','path','sha256']} | {'valid_coverage':float(np.mean(r['valid'])), 'frames':[{'time_s':float(t),'f0_hz':float(f) if np.isfinite(f) else None,'voiced':bool(v),'voiced_probability':float(q),'accepted':bool(ok)} for t,f,v,q,ok in zip(r['t'],r['f0'],r['flag'],r['prob'],r['valid'])]})
    result['paired_diagnostics'] = []
    for r in rows[1:]:
        joint = rows[0]['valid'] & r['valid']
        delta = 12*np.log2(r['f0'][joint]/rows[0]['f0'][joint])
        result['paired_diagnostics'].append({'candidate':r['label'],'joint_coverage':float(np.mean(joint)), 'median_semitone_delta':float(np.median(delta)) if np.mean(joint)>=.1 else None, 'summary_supported':bool(np.mean(joint)>=.1), 'warning':'Only jointly accepted frames; octave/subharmonic errors and polyphony may remain. Not a global key or quality score.'})
    (a.out/'pitch-analysis.json').write_text(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False)+'\n')

if __name__ == '__main__':
    main()
