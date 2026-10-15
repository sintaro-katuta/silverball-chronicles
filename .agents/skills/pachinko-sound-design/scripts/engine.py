"""Procedural DSP used by render.py. No sample files or source audio input.
Derived from the 2026-10-11 original cue prototypes; tunable event controls
are exposed by render.py. Fixed timbre constants are versioned via SHA256.
"""
import numpy as np
from scipy import signal
SR = 96000
RNG = np.random.default_rng(741903)

def clock(duration):
    return np.arange(round(duration*SR))/SR


def envelope(t, decay=None, attack=.002, release=.07):
    e = np.minimum(t/max(attack,1/SR), 1.)
    if decay:
        e *= np.exp(-t/decay)
    e *= np.clip((t[-1]-t)/release, 0., 1.)
    return e


def curve(t, points):
    # Hand-authored controls; these are not extracted from a reference WAV.
    return np.interp(t, [p[0] for p in points], [p[1] for p in points])


def filter_audio(x, low, high, order=2):
    return signal.sosfilt(signal.butter(order,[low,high],btype='bandpass',fs=SR,output='sos'),x,axis=0)


def put(bus, x, at, gain=1., pan=0.):
    i=round(at*SR); n=min(len(x),len(bus)-i)
    if n<=0: return
    if x.ndim==1:
        # Balance rather than hard panning; central transient stays coherent.
        x=np.column_stack([x*(1-max(0,pan)),x*(1+min(0,pan))])
    bus[i:i+n] += x[:n]*gain


def bright_body(duration, pitch, index=1.6, flutter=0., decay=None, fm_ratio=2.37, detune_cents=4.1, attack_s=.002, release_s=.16):
    """Detuned band-limited saw bank plus inharmonic FM, not a clean beep."""
    t=clock(duration);f=curve(t,pitch)
    f*=1+.0014*np.sin(2*np.pi*5.7*t)
    mod=2*np.pi*np.cumsum(f*fm_ratio)/SR
    idx=index*(.50+.50*np.exp(-t/.40))
    channels=[]
    for cents,phase_offset in [(-detune_cents,.13),(detune_cents,-.09)]:
        phase=2*np.pi*np.cumsum(f*2**(cents/1200))/SR
        saw=np.zeros_like(t)
        for h in range(1,20):
            # Smoothly discard partials before the 48kHz downsample Nyquist.
            weight=np.clip((18000-h*f)/2500,0,1)/(h**.83)
            saw+=weight*np.sin(h*phase+phase_offset)
        fm=np.sin(phase+idx*np.sin(mod))+.20*np.sin(phase*1.987+.45*np.sin(mod*.51))
        body=.35*saw+.66*fm
        body=np.tanh(body*1.9)/1.7
        if flutter:
            rate=24+13*(1-np.exp(-t/.22))
            gate=.64+.36*np.sin(2*np.pi*np.cumsum(rate)/SR)**2
            gate*=1-.16*np.sin(2*np.pi*11.7*t)
            body*=1+flutter*(gate-1)
        channels.append(body)
    y=filter_audio(np.column_stack(channels),130,13500)
    return y*envelope(t,decay,attack=attack_s,release=release_s)[:,None]


def impact(duration=.65, weight=1.):
    t=clock(duration)
    f=58+135*np.exp(-t/.035)
    phase=2*np.pi*np.cumsum(f)/SR
    sub=(np.sin(phase)+.27*np.sin(2*phase)+.10*np.sin(3*phase))*np.exp(-t/.15)
    crack=filter_audio(RNG.standard_normal(len(t)),1200,11000)*np.exp(-t/.017)
    metal=np.zeros_like(t)
    for hz,amp,d in [(617,.31,.13),(1291,.24,.10),(2269,.14,.09),(3743,.11,.06),(6131,.08,.035)]:
        metal+=amp*np.sin(2*np.pi*hz*t)*np.exp(-t/d)
    return (sub*.82+crack*.26+metal*.47)*envelope(t,attack=.0005,release=.06)*weight


def rumble(duration, hz=66):
    t=clock(duration)
    phase=2*np.pi*np.cumsum(hz*(1+.012*np.sin(2*np.pi*17*t)))/SR
    low=signal.sosfilt(signal.butter(2,240,fs=SR,output='sos'),RNG.standard_normal(len(t)))
    low/=max(np.std(low),1e-8)
    grain=.66+.34*np.sin(2*np.pi*(27*t+8*t*t))**2
    y=(.70*np.sin(phase)+.30*np.sin(phase*2)+.14*low)*grain
    return y*envelope(t,decay=.8,attack=.003,release=.14)


def ring(duration, hz, strength=.35):
    t=clock(duration);y=np.zeros((len(t),2))
    for i,(ratio,amp) in enumerate([(1,.52),(2.019,.23),(2.763,.16),(4.117,.10),(6.281,.065)]):
        d=(.82+duration*.28)/(1+i*.39)
        for c in range(2):
            tone=np.sin(2*np.pi*hz*ratio*(1+(.0008 if c else -.0008))*t+.07*c)
            y[:,c]+=amp*tone*np.exp(-t/d)
    return y*envelope(t,attack=.0015,release=.15)[:,None]*strength


def space(dry):
    # Early reflections followed by sparse crossfeed; no sampled impulse.
    n=len(dry);wet=np.zeros_like(dry)
    for delay,gain,cross in [(0.029,.09,False),(.047,.08,True),(.073,.07,False),(.109,.052,True),(.163,.042,False),(.229,.027,True),(.337,.020,False)]:
        shift=round(delay*SR)
        if shift>=n: continue
        delayed=signal.sosfilt(signal.butter(1,5800,fs=SR,output='sos'),dry,axis=0)
        if cross: delayed=delayed[:,::-1]
        wet[shift:]+=gain*delayed[:n-shift]
    result=dry+wet
    # Fade wet tail and remove inaudible DC; bass remains coherent in mono.
    result=signal.sosfilt(signal.butter(2,28,btype='highpass',fs=SR,output='sos'),result,axis=0)
    fade_in=min(n,round(.001*SR));fade_out=min(n,round(.15*SR))
    result[:fade_in]*=np.linspace(0,1,fade_in)[:,None]
    result[-fade_out:]*=np.linspace(1,0,fade_out)[:,None]**2
    result[0]=result[-1]=0
    output=signal.resample_poly(result,1,2,axis=0)
    # Resampling's FIR may introduce tiny edge ringing; taper after conversion.
    fade_in=min(48,len(output));fade_out=min(480,len(output))
    output[:fade_in]*=np.linspace(0,1,fade_in)[:,None]
    output[-fade_out:]*=np.linspace(1,0,fade_out)[:,None]
    output[0]=output[-1]=0
    return output


def noise(duration, band_hz, attack_s=.002, release_s=.03, decay_s=None):
    t=clock(duration)
    white=RNG.standard_normal(len(t))
    shaped=filter_audio(white,band_hz[0],band_hz[1])
    shaped/=max(float(np.std(shaped)),1e-12)
    return shaped*envelope(t,decay_s,attack_s,release_s)


def tone(duration, pitch_hz, waveform='saw', harmonics=24, attack_s=.002, release_s=.03, decay_s=None, am_rate_hz=None, am_depth=0.):
    t=clock(duration);f=curve(t,pitch_hz)
    phase=2*np.pi*np.cumsum(f)/SR
    y=np.zeros_like(t)
    for h in range(1,harmonics+1):
        if waveform=='sine' and h>1:continue
        if waveform=='square' and h%2==0:continue
        weight=1/h if waveform!='sine' else 1.
        y+=weight*np.sin(h*phase)*np.clip((18000-h*f)/2500,0,1)
    if am_rate_hz is not None:
        rate=curve(t,am_rate_hz);gate=.5+.5*np.sin(2*np.pi*np.cumsum(rate)/SR)
        y*=1-am_depth+am_depth*gate
    return y*envelope(t,decay_s,attack_s,release_s)
