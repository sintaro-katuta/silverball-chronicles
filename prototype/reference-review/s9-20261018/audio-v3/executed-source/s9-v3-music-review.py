import json, hashlib
from pathlib import Path
import numpy as np
import soundfile as sf
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy.signal import stft
root=Path('prototype/reference-review/s9-20261018/audio-v3');m=json.loads((root/'manifest.json').read_text());item=next(x for x in m['items'] if x['id']=='music-normal'); rows=[];signals=[]
for label,p,gain in [('before',root/'baseline/music-normal.wav',item['auditionGain']['baseline']),('after',root/'music/normal.wav',item['auditionGain']['candidate'])]:
 x,rate=sf.read(p);x=x[:rate*8].mean(axis=1)*gain; f,t,z=stft(x,fs=rate,nperseg=1024,noverlap=896);signals.append((label,f,t,z));win=round(rate*.04);rms=np.array([np.sqrt(np.mean(x[i:i+win]**2)) for i in range(0,len(x)-win,win)]);rows.append({'label':label,'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'gain':gain,'rate':rate,'scope':'first8s, mono channel average; common loudness-match gain, no warp','rms40ms':rms.tolist()})
ref=max(np.max(np.abs(z)) for _,_,_,z in signals);fig,axes=plt.subplots(3,1,figsize=(13,9),layout='constrained')
for a,(label,f,t,z) in zip(axes[:2],signals):
 a.pcolormesh(t,f,20*np.log10(np.maximum(abs(z)/ref,1e-5)),vmin=-75,vmax=0,shading='auto',cmap='magma');a.set_ylim(80,8000);a.set_yscale('log');a.set_title(f'{label}: normal, first8s, loudness-matched');a.set_ylabel('Hz')
for row in rows: axes[2].plot(np.arange(len(row['rms40ms']))*.04,row['rms40ms'],label=row['label'])
axes[2].set_xlabel('Recorded score seconds (not game event clock)');axes[2].set_ylabel('40ms RMS');axes[2].legend();fig.savefig(root/'normal-review.png',dpi=150)
(root/'normal-review.json').write_text(json.dumps({'signals':rows,'interpretation':'Spectral/rhythm descriptors, not human listening acceptance. BGM bass/drums are authored synthesis; no SE drums. No inference of melody F0 from STFT.'},indent=2))
