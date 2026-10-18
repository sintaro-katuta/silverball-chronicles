"""Original BONUS cue with the pulse/saw synthesis learned in trial C."""
from pathlib import Path
import sys,json,hashlib,platform,argparse
import numpy as np
import scipy
from scipy.io import wavfile
SKILL=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser(description='Render the restored common pulse/saw two-voice example')
parser.add_argument('--design',type=Path,default=SKILL/'assets/pulse-harmony-approved.json')
parser.add_argument('--out',type=Path,required=True)
args=parser.parse_args()
P=args.out.resolve()
if P.exists() and any(P.iterdir()):raise SystemExit('Use a new empty output directory')
P.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(SKILL/'scripts'))
import engine
from render import loudness,ffmpeg,features
if (P/'moon-release.wav').exists():raise SystemExit('Archive this first draft; do not overwrite')
design=json.loads(args.design.read_text())
bus=np.zeros((round(design['duration_s']*engine.SR),2));control=[]
for event in design['events']:
 assert event['at_s']>=0 and event['duration_s']>0 and event['at_s']+event['duration_s']<=design['duration_s'] and 20<event['pitch_hz']<8000
 t=engine.clock(event['duration_s']);cents=np.zeros(len(t))
 if 'vibrato_hz' in event:
  fade=.5-.5*np.cos(np.pi*np.clip(t/event['vibrato_fade_in_s'],0,1));cents=event['vibrato_cents']*fade*np.sin(2*np.pi*event['vibrato_hz']*t)
 layer=np.zeros(len(t))
 for voice,hz,level in [('lead',event['pitch_hz'],design['voices']['lead_gain']),('harmony',event['harmony_hz'],design['voices']['harmony_gain'])]:
  f=hz*2**(cents/1200)*(1+design['patch']['intrinsic_vibrato_fraction']*np.sin(2*np.pi*design['patch']['intrinsic_vibrato_hz']*t))
  phase=2*np.pi*np.cumsum(f)/engine.SR;wave=np.zeros(len(t))
  for h in range(1,design['patch']['harmonics']+1):
   weight=np.clip((18000-h*f)/2500,0,1);duty=design['patch']['pulse_duty']
   pulse=2*np.sin(np.pi*h*duty)/(np.pi*h)*np.cos(h*phase-np.pi*h*duty);saw=np.sin(h*phase)/h
   wave+=weight*(design['patch']['pulse_mix']*pulse+design['patch']['saw_mix']*saw)
  wave=engine.filter_audio(wave,*design['patch']['band_hz'])*engine.envelope(t,None,attack=event['attack_s'],release=event['release_s'])
  layer+=wave*level
  control.extend({'voice':voice,'time_s':float(event['at_s']+t[i]),'specified_hz':float(f[i])} for i in range(0,len(t),round(.01*engine.SR)))
 engine.put(bus,np.column_stack([layer,layer]),event['at_s'],event['gain'])
y=engine.space(bus);assert y.shape==(288000,2) and np.isfinite(y).all() and np.all(y[[0,-1]]==0)
work=P/'work.wav';wavfile.write(work,48000,y.astype(np.float32));raw=loudness(work);gdb=min(design['target_lufs']-raw['integrated_lufs'],design['true_peak_ceiling_dbfs']-raw['true_peak_dbfs']);y*=10**(gdb/20);assert np.max(abs(y))<1
wavfile.write(work,48000,y.astype(np.float32));ffmpeg('-y','-loglevel','error','-i',work,'-c:a','pcm_s24le',P/'moon-release.wav');work.unlink()
ffmpeg('-y','-loglevel','error','-i',P/'moon-release.wav','-c:a','libmp3lame','-b:a','256k',P/'moon-release.mp3')
designtext=json.dumps(design,ensure_ascii=False,indent=2)+'\n';(P/'design.json').write_text(designtext);(P/'pitch-control.json').write_text(json.dumps(control,indent=2)+'\n')
report={'cue':'moon-release','duration_s':6.0,'sample_rate':48000,'channels':2,'original_recordings_loaded':0,'common_preset_count':1,'synth_voice_count':2,'global_gain_db':gdb,'loudness':loudness(P/'moon-release.wav'),'features':features(y),'design_sha256':hashlib.sha256(designtext.encode()).hexdigest(),'source_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'engine_sha256':hashlib.sha256((SKILL/'scripts/engine.py').read_bytes()).hexdigest(),'wav_sha256':hashlib.sha256((P/'moon-release.wav').read_bytes()).hexdigest(),'environment':{'python':platform.python_version(),'numpy':np.__version__,'scipy':scipy.__version__},'acceptance':{'numeric':'passed','browser':'pending','subjective':'pending user listening','game':'not integrated'}}
assert report['loudness']['true_peak_dbfs']<=-2
(P/'measurements.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False,indent=2))
