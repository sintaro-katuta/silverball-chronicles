"""Phase-independent reference comparison; this is a fitting proxy, not a listening score."""
import argparse
import hashlib
import json
from pathlib import Path
import numpy as np
from scipy import signal
from scipy.io import wavfile


def read(path):
    sr,x=wavfile.read(path)
    if x.dtype.kind=='i':x=x.astype(np.float64)/2**(x.dtype.itemsize*8-1)
    elif x.dtype.kind=='u':x=(x.astype(np.float64)-128)/128
    else:x=x.astype(np.float64)
    if x.ndim==2:x=x.mean(axis=1)
    if not np.isfinite(x).all():raise ValueError('Nonfinite audio')
    return sr,x


def compare(reference,candidate,sr):
    if len(reference)!=len(candidate):raise ValueError('Lengths must match; declare the crop, do not time-warp the comparison')
    rr=np.sqrt(np.mean(reference**2));cr=np.sqrt(np.mean(candidate**2))
    if min(rr,cr)<1e-12:raise ValueError('Cannot compare silent input')
    gain=rr/cr;candidate=candidate*gain
    n=min(2048,len(reference));hop=max(1,n//4)
    f,t,r=signal.stft(reference,sr,nperseg=n,noverlap=n-hop,boundary='zeros',padded=True)
    _,_,c=signal.stft(candidate,sr,nperseg=n,noverlap=n-hop,boundary='zeros',padded=True)
    edges=np.geomspace(40,min(16000,sr/2),65)
    def bands(z):
        power=abs(z)**2
        return np.array([power[(f>=lo)&(f<hi)].sum(axis=0) for lo,hi in zip(edges[:-1],edges[1:])])
    rp,cp=bands(r),bands(c)
    floor=max(float(rp.max())*1e-6,1e-20)
    active=rp.sum(axis=0)>rp.sum(axis=0).max()*1e-6
    spectral=float(np.mean(abs(10*np.log10((rp[:,active]+floor)/(cp[:,active]+floor)))))
    count=round(sr*.02)
    def rms(x):
        padded=np.pad(x,(0,(-len(x))%count));return np.sqrt(np.mean(padded.reshape(-1,count)**2,axis=1))
    re,ce=rms(reference),rms(candidate);ef=max(float(re.max())*.001,1e-12)
    envelope=float(np.mean(abs(20*np.log10((re+ef)/(ce+ef)))))
    cosine=np.sum(rp*cp,axis=0)/(np.sqrt(np.sum(rp**2,axis=0)*np.sum(cp**2,axis=0))+1e-30)
    return dict(spectral_db_mae=spectral,envelope_db_mae=envelope,spectral_cosine=float(np.mean(cosine[active])),
                objective=.7*spectral+.3*envelope,candidate_comparison_gain=gain,
                scope='Mono; one fixed RMS gain; 64 log frequency bands 40-16000Hz, 2048-point STFT, 20ms RMS; no time warp or listening acceptance')


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--reference',type=Path,required=True);p.add_argument('--candidate',type=Path,required=True);p.add_argument('--out',type=Path,required=True)
    a=p.parse_args();sr,r=read(a.reference);sc,c=read(a.candidate)
    if sr!=sc:raise ValueError('Sample rates must match')
    result=compare(r,c,sr);result.update(reference_sha256=hashlib.sha256(a.reference.read_bytes()).hexdigest(),candidate_sha256=hashlib.sha256(a.candidate.read_bytes()).hexdigest())
    a.out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,indent=2))


if __name__=='__main__':main()
