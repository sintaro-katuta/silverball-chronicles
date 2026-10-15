"""Render quantitative JSON cue designs. No input audio; no publication actions."""
import argparse
import hashlib
import html
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

import numpy as np
import scipy
from scipy.io import wavfile
from scipy import signal
import engine

OUT_SR = 48000
ALLOWED = {
    'impact': {'weight'}, 'body': {'pitch_hz','fm_index','flutter','decay_s','fm_ratio','detune_cents','attack_s','release_s'},
    'rumble': {'hz'}, 'ring': {'hz','strength'},
    'noise': {'band_hz','attack_s','release_s','decay_s'},
    'tone': {'pitch_hz','waveform','harmonics','attack_s','release_s','decay_s','am_rate_hz','am_depth'},
}
DEFAULTS = {
    'impact': {'weight':1.},
    'body': {'fm_index':1.6,'flutter':0.,'decay_s':None,'fm_ratio':2.37,'detune_cents':4.1,'attack_s':.002,'release_s':.16},
    'rumble': {'hz':66.}, 'ring': {'strength':.35},
    'noise': {'attack_s':.002,'release_s':.03,'decay_s':None},
    'tone': {'waveform':'saw','harmonics':24,'attack_s':.002,'release_s':.03,'decay_s':None,'am_rate_hz':None,'am_depth':0.},
}


def number(value, name, low=None, high=None):
    if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value):
        raise ValueError(f'{name}: expected finite number')
    if (low is not None and value<low) or (high is not None and value>high):
        raise ValueError(f'{name}: outside [{low}, {high}]')
    return value


def keys(obj, allowed, required, where):
    if not isinstance(obj,dict): raise ValueError(f'{where}: expected object')
    missing=set(required)-obj.keys(); unknown=obj.keys()-set(allowed)
    if missing or unknown: raise ValueError(f'{where}: missing={sorted(missing)}, unknown={sorted(unknown)}')


def validate_points(points,name,length,low,high):
    if not isinstance(points,list) or len(points)<2:raise ValueError(name+' needs >=2 points')
    previous=-1
    for point in points:
        if not isinstance(point,list) or len(point)!=2:raise ValueError(name+' needs [seconds,value]')
        time=number(point[0],name+' time',0,length);number(point[1],name+' value',low,high)
        if time<=previous:raise ValueError(name+' times must strictly increase')
        previous=time
    if points[0][0]!=0 or abs(previous-length)>1/OUT_SR:raise ValueError(name+' must cover entire layer')


def validate(design):
    keys(design,{'version','target_lufs','true_peak_ceiling_dbfs','preview_gap_s','cues'}, {'version','cues'},'design')
    if type(design['version']) is not int or design['version']!=1: raise ValueError('version must be 1')
    design.setdefault('target_lufs',-18.);design.setdefault('true_peak_ceiling_dbfs',-2.);design.setdefault('preview_gap_s',.7)
    number(design['target_lufs'],'target_lufs',-50,-5)
    number(design['true_peak_ceiling_dbfs'],'true_peak_ceiling_dbfs',-20,-.1)
    number(design['preview_gap_s'],'preview_gap_s',0,10)
    if not isinstance(design['cues'],list) or not design['cues']: raise ValueError('cues must be a non-empty list')
    ids=set()
    for cue in design['cues']:
        keys(cue,{'id','title','role','duration_s','seed','events'}, {'id','title','role','duration_s','seed','events'},'cue')
        ident=cue['id']
        if not isinstance(ident,str) or not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,63}',ident) or ident in ids:
            raise ValueError('cue id must be unique, lowercase, safe filename, <=64 chars')
        ids.add(ident)
        if not isinstance(cue['title'],str) or not isinstance(cue['role'],str): raise ValueError('title and role must be strings')
        duration=number(cue['duration_s'],f'{ident}.duration_s',.03,30)
        if type(cue['seed']) is not int or not 0<=cue['seed']<2**64: raise ValueError('seed must be unsigned 64-bit integer')
        if not isinstance(cue['events'],list) or not cue['events']: raise ValueError('events must be non-empty list')
        for event in cue['events']:
            if not isinstance(event,dict) or event.get('kind') not in ALLOWED: raise ValueError('unknown event kind')
            kind=event['kind'];base={'kind','at_s','duration_s','gain','pan','amplitude_curve'}
            keys(event,base|ALLOWED[kind],{'kind','at_s','duration_s'},f'{ident}.{kind}')
            event.setdefault('gain',1.);event.setdefault('pan',0.)
            for key,value in DEFAULTS[kind].items(): event.setdefault(key,value)
            at=number(event['at_s'],'at_s',0,duration)
            length=number(event['duration_s'],'duration_s',.005,duration)
            if at+length>duration+1/OUT_SR: raise ValueError(f'{ident}: event exceeds cue duration; extend cue or shorten layer')
            number(event['gain'],'gain',0,4);number(event['pan'],'pan',-1,1)
            if 'amplitude_curve' in event:
                validate_points(event['amplitude_curve'],'amplitude_curve',length,0,4)
            if kind in ('noise','tone'):
                number(event['attack_s'],'attack_s',1/engine.SR,length)
                number(event['release_s'],'release_s',1/engine.SR,30)
                if event['decay_s'] is not None:number(event['decay_s'],'decay_s',.001,60)
            if kind=='noise':
                band=event.get('band_hz')
                if not isinstance(band,list) or len(band)!=2:raise ValueError('band_hz requires [low,high]')
                number(band[0],'band low',20,19000);number(band[1],'band high',21,20000)
                if band[0]>=band[1]:raise ValueError('band_hz must increase')
            if kind=='tone':
                validate_points(event.get('pitch_hz'),'pitch_hz',length,20,8000)
                if event['waveform'] not in ('sine','saw','square'):raise ValueError('unknown waveform')
                if type(event['harmonics']) is not int or not 1<=event['harmonics']<=64:raise ValueError('harmonics must be integer 1..64')
                number(event['am_depth'],'am_depth',0,1)
                if event['am_rate_hz'] is not None:validate_points(event['am_rate_hz'],'am_rate_hz',length,.1,500)
            if kind=='body':
                if 'pitch_hz' not in event or not isinstance(event['pitch_hz'],list) or len(event['pitch_hz'])<2:
                    raise ValueError('body needs >=2 pitch_hz [seconds, Hz] points')
                last=-1
                for point in event['pitch_hz']:
                    if not isinstance(point,list) or len(point)!=2: raise ValueError('pitch_hz point must be [seconds, Hz]')
                    t=number(point[0],'pitch time',0,length);number(point[1],'pitch Hz',20,8000)
                    if t<=last: raise ValueError('pitch point times must strictly increase')
                    last=t
                if event['pitch_hz'][0][0]!=0 or abs(last-length)>1/OUT_SR:
                    raise ValueError('pitch points must cover 0 through duration_s')
                number(event['fm_index'],'fm_index',0,8);number(event['flutter'],'flutter',0,1)
                number(event['fm_ratio'],'fm_ratio',.1,8);number(event['detune_cents'],'detune_cents',0,50)
                number(event['attack_s'],'attack_s',1/engine.SR,length);number(event['release_s'],'release_s',1/engine.SR,30)
                if event['decay_s'] is not None: number(event['decay_s'],'decay_s',.001,60)
            if kind in ('rumble','ring'):
                if 'hz' not in event: raise ValueError(f'{kind} requires hz')
                number(event['hz'],'hz',20,2000 if kind=='ring' else 500)
            if kind=='impact':number(event['weight'],'weight',0,4)
            if kind=='ring':number(event['strength'],'strength',0,4)
    return design


def synthesize(cue):
    # Reset per cue: rendering one cue or changing cue order gives identical PCM.
    engine.RNG=np.random.default_rng(cue['seed'])
    bus=np.zeros((round(cue['duration_s']*engine.SR),2))
    for event in cue['events']:
        kind=event['kind'];d=event['duration_s']
        if kind=='body':layer=engine.bright_body(d,event['pitch_hz'],index=event['fm_index'],flutter=event['flutter'],decay=event['decay_s'],fm_ratio=event['fm_ratio'],detune_cents=event['detune_cents'],attack_s=event['attack_s'],release_s=event['release_s'])
        elif kind=='impact':layer=engine.impact(d,event['weight'])
        elif kind=='rumble':layer=engine.rumble(d,event['hz'])
        elif kind=='ring':layer=engine.ring(d,event['hz'],event['strength'])
        elif kind=='noise':layer=engine.noise(d,event['band_hz'],event['attack_s'],event['release_s'],event['decay_s'])
        else:layer=engine.tone(d,event['pitch_hz'],event['waveform'],event['harmonics'],event['attack_s'],event['release_s'],event['decay_s'],event['am_rate_hz'],event['am_depth'])
        if 'amplitude_curve' in event:
            amplitude=engine.curve(engine.clock(d),event['amplitude_curve'])
            layer*=amplitude[:,None] if layer.ndim==2 else amplitude
        if layer.ndim==2:
            layer=layer*np.array([1-max(0,event['pan']),1+min(0,event['pan'])])[None,:]
            engine.put(bus,layer,event['at_s'],event['gain'])
        else:engine.put(bus,layer,event['at_s'],event['gain'],event['pan'])
    return engine.space(bus)


def ffmpeg(*args):
    return subprocess.run(['ffmpeg','-hide_banner','-nostats',*map(str,args)],check=True,capture_output=True,text=True)


def loudness(path):
    result=ffmpeg('-i',path,'-af','apad=whole_dur=1,loudnorm=I=-18:TP=-2:LRA=11:print_format=json','-f','null','-')
    found=re.search(r'\{\s*"input_i".*?\}',result.stderr,re.S)
    if not found:raise ValueError('FFmpeg loudness JSON unavailable')
    data=json.loads(found.group());i=float(data['input_i']);peak=float(data['input_tp'])
    if not math.isfinite(i) or not math.isfinite(peak):raise ValueError('No measurable audio: cue is silent or too short for LUFS measurement')
    return {'integrated_lufs':i,'true_peak_dbfs':peak,'lra_lu':float(data['input_lra'])}


def features(y):
    rms=float(np.sqrt(np.mean(y*y)));peak=float(np.max(abs(y)))
    mono=y.mean(1);mono_rms=float(np.sqrt(np.mean(mono*mono)))
    n=min(2048,len(y));hop=max(1,n//4)
    f,_,z=signal.stft(y.T,OUT_SR,nperseg=n,noverlap=n-hop,axis=-1,boundary=None,padded=False)
    energy=np.sum(abs(z)**2,axis=(0,2));total=float(energy[(f>=20)&(f<20000)].sum())
    bands={f'{lo}-{hi}Hz':float(energy[(f>=lo)&(f<hi)].sum()/max(total,1e-30)) for lo,hi in [(20,250),(250,2000),(2000,8000),(8000,20000)]}
    frames=np.sqrt(np.mean(y[:len(y)//960*960].reshape(-1,960,2)**2,axis=(1,2)))
    threshold=max(float(frames.max())*.001,1e-12);active=np.flatnonzero(frames>threshold)
    active_end=float((active[-1]+1)*.02) if len(active) else 0
    windows=19200;hop=4800
    sums=np.r_[0,np.cumsum(np.mean(y*y,axis=1))]
    positions=np.arange(0,max(1,len(y)-windows+1),hop);ends=np.minimum(positions+windows,len(y))
    max400=float(np.sqrt(np.max((sums[ends]-sums[positions])/(ends-positions))))
    # Stereo-to-mono comparisons report energy loss; they are not acceptance gates.
    return dict(peak=peak,rms=rms,mono_rms=mono_rms,mono_loss_db=float(20*np.log10(max(mono_rms,1e-30)/max(rms,1e-30))),
                crest_db=float(20*np.log10(max(peak,1e-30)/max(rms,1e-30))),
                max_400ms_rms_dbfs=float(20*np.log10(max(max400,1e-30))),
                spectral_centroid_hz=float(np.sum(f*energy)/max(float(energy.sum()),1e-30)),
                band_energy_fraction=bands,active_end_60db_s=active_end,
                stereo_correlation=float(np.corrcoef(y.T)[0,1]) if np.std(y[:,0])>0 and np.std(y[:,1])>0 else None,clipped_samples=int((abs(y)>=1).sum()),
                first_sample_peak=float(abs(y[0]).max()),last_sample_peak=float(abs(y[-1]).max()))


def preview(out,cues):
    sections=[]
    for cue in cues:
        ident=html.escape(cue['id'],quote=True);title=html.escape(cue['title']);role=html.escape(cue['role'])
        sections.append(f'<section><h2>{title}</h2><p>{role} · {cue["duration_s"]}秒</p><button data-play="{ident}">再生</button><audio id="{ident}" controls preload="metadata" src="{ident}.wav"></audio><p><a download href="{ident}.wav">WAV</a> · <a download href="{ident}.mp3">MP3</a></p><details><summary>周波数の時間変化</summary><img src="{ident}-spectrum.png" alt="周波数図"></details></section>')
    output='''<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>演出SEの試聴</title><style>body{background:#101621;color:#edf2f8;font:16px/1.7 system-ui;margin:0}main{max-width:820px;margin:auto;padding:24px 20px}section{border-top:1px solid #405064;padding:20px 0}audio,img{width:100%}a{color:#a3cdff}button{font:inherit;padding:8px 16px;margin:8px 8px 8px 0}h1{font-size:26px}h2{font-size:20px}</style><main><h1>オリジナル演出SEの試聴</h1><p>数値設定から合成した初稿。聴感・実機スピーカーでの受入は別途確認してください。</p><button data-play="sequence">全案を再生</button><button id="stop">すべて停止</button><audio id="sequence" controls preload="metadata" src="sequence.wav"></audio><p id="status" role="status">音を選んで再生してください。</p>'''+''.join(sections)+'''<p><a href="design-resolved.json">使用設定</a> · <a href="measurements.json">測定JSON</a></p></main><script>const players=[...document.querySelectorAll('audio')],status=document.querySelector('#status');for(const a of players){a.volume=.55;a.onplay=()=>{for(const b of players)if(b!==a)b.pause();status.textContent=a.id+' を再生中'};a.onended=()=>status.textContent='再生完了'}for(const b of document.querySelectorAll('[data-play]'))b.onclick=async()=>{try{const a=document.getElementById(b.dataset.play);for(const other of players)if(other!==a)other.pause();a.currentTime=0;await a.play()}catch(e){status.textContent=e.message}};document.querySelector('#stop').onclick=()=>{for(const a of players){a.pause();a.currentTime=0}status.textContent='停止しました'};document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const a of players)a.pause()});</script></html>'''
    (out/'index.html').write_text(output)


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--design',type=Path,required=True);p.add_argument('--out',type=Path,required=True)
    p.add_argument('--only',help='Render one cue by id');p.add_argument('--validate-only',action='store_true')
    args=p.parse_args()
    design=validate(json.loads(args.design.read_text()))
    if args.only:
        selected=[c for c in design['cues'] if c['id']==args.only]
        if not selected:raise ValueError(f'Unknown cue id: {args.only}')
        design['cues']=selected
    if args.validate_only:print('Design valid');return
    if not shutil.which('ffmpeg'):raise ValueError('FFmpeg is required')
    if args.out.exists() and any(args.out.iterdir()):raise ValueError('Output directory must be empty; choose a new directory')
    args.out.mkdir(parents=True,exist_ok=True)
    encoded=json.dumps(design,ensure_ascii=False,sort_keys=True,indent=2)+'\n'
    (args.out/'design-resolved.json').write_text(encoded)
    report=dict(design_sha256=hashlib.sha256(encoded.encode()).hexdigest(),engine_sha256=hashlib.sha256(Path(engine.__file__).read_bytes()).hexdigest(),
                renderer_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),python=sys.version.split()[0],numpy=np.__version__,scipy=scipy.__version__,
                ffmpeg=subprocess.run(['ffmpeg','-version'],check=True,capture_output=True,text=True).stdout.splitlines()[0],
                sample_rate=OUT_SR,channels=2,pcm_bits=24,oversampling=2,source_samples_used=False,loudness_analysis_minimum_window_s=1.,
                acceptance={'numerical':'pending','browser':'not_run','acoustic':'not_run','in_game':'not_run'},cues={})
    sequence=[]
    for cue in design['cues']:
        ident=cue['id'];print('Rendering',ident,flush=True);y=synthesize(cue)
        if not np.isfinite(y).all():raise ValueError('Synthesis produced non-finite samples')
        with tempfile.TemporaryDirectory(dir=args.out,prefix='.work-') as tmp:
            raw=Path(tmp)/'raw.wav';wavfile.write(raw,OUT_SR,y.astype(np.float32));before=loudness(raw)
            gain_db=min(design['target_lufs']-before['integrated_lufs'],design['true_peak_ceiling_dbfs']-before['true_peak_dbfs'])
            y*=10**(gain_db/20);wavfile.write(raw,OUT_SR,y.astype(np.float32))
            out=args.out/(ident+'.wav');ffmpeg('-y','-loglevel','error','-i',raw,'-c:a','pcm_s24le',out)
        final=loudness(out);_,pcm=wavfile.read(out);pcm=pcm.astype(np.float64)/2147483648
        if pcm.shape!=(round(cue['duration_s']*OUT_SR),2):raise ValueError('Unexpected output dimensions')
        metrics=features(pcm)
        if metrics['clipped_samples'] or final['true_peak_dbfs']>design['true_peak_ceiling_dbfs']+.15:raise ValueError('Output peak exceeds design target')
        if metrics['first_sample_peak']>1e-6 or metrics['last_sample_peak']>1e-6:raise ValueError('Output endpoints are not tapered')
        report['cues'][ident]=dict(duration_s=cue['duration_s'],seed=cue['seed'],gain_db=gain_db,loudness_target_reached=abs(final['integrated_lufs']-design['target_lufs'])<.15,
                                 peak_limited=gain_db<design['target_lufs']-before['integrated_lufs']-.01,sha256=hashlib.sha256(out.read_bytes()).hexdigest(),**final,**metrics)
        ffmpeg('-y','-loglevel','error','-i',out,'-c:a','libmp3lame','-b:a','256k',args.out/(ident+'.mp3'))
        ffmpeg('-y','-loglevel','error','-i',out,'-lavfi','showspectrumpic=s=1200x480:legend=1:scale=log:fscale=log:color=intensity',args.out/(ident+'-spectrum.png'))
        sequence.extend([pcm.astype(np.float32),np.zeros((round(design['preview_gap_s']*OUT_SR),2),dtype=np.float32)])
    wavfile.write(args.out/'sequence.wav',OUT_SR,np.concatenate(sequence[:-1]))
    report['acceptance']['numerical']='passed'
    (args.out/'measurements.json').write_text(json.dumps(report,ensure_ascii=False,indent=2,allow_nan=False)+'\n')
    preview(args.out,design['cues'])
    print('Generated',len(design['cues']),'cues at',args.out,flush=True)


if __name__=='__main__':
    try:main()
    except (ValueError,KeyError,json.JSONDecodeError,subprocess.CalledProcessError) as e:
        print(f'ERROR: {e}',file=sys.stderr);sys.exit(1)
