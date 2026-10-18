#!/usr/bin/env python3
"""Local S9 render receipt; numeric checks do not certify human listening."""
import array, hashlib, json, math, subprocess, sys, time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'prototype/reference-review/s9-20261018/pr-video'
PUBLIC=OUT/'public'
def sha(p):
 return hashlib.sha256(p.read_bytes()).hexdigest()
def inventory():
 paths=[ROOT/'tools/pr-video/s9-index.tsx',ROOT/'tools/pr-video/s9-data.json',Path(__file__).resolve(),ROOT/'docs/agile/s9-video/script.json',ROOT/'docs/agile/s9-video/script.md']+sorted(p for p in PUBLIC.rglob('*') if p.is_file())
 return [{'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size,'sha256':sha(p)} for p in paths]
def write(name,v): (OUT/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
if '--snapshot' in sys.argv:
 write('render-inputs-before.json',inventory());print('Input inventory saved');sys.exit()
before=json.loads((OUT/'render-inputs-before.json').read_text());after=inventory()
assert before==after,'Media input changed during render'
t=json.loads((PUBLIC/'audio/timeline.json').read_text());d=json.loads((ROOT/'tools/pr-video/s9-data.json').read_text());approved=json.loads((ROOT/'docs/agile/s9-video/script.json').read_text())
offset=0;segments=[]
for i,c in enumerate(t['clips']):
 assert c['text']==approved['lines'][i]['text'] and c['id']==approved['lines'][i]['id']
 end=t['clips'][i+1]['start_frame'] if i+1<len(t['clips']) else t['total_duration_frames']
 segments.append({'id':c['id'],'type':'narration','startFrame':c['start_frame']+offset,'frames':c['duration_frames'],'blockEndFrame':end+offset,'audioFile':c['audio_file']})
 for s in d['samples']:
  if s['afterParagraph']==i+1:
   segments.append({'id':s['id'],'type':'comparison','startFrame':end+offset,'frames':s['frames'],'file':s['file'],'clockLabel':s['clockLabel']});offset+=s['frames']
movie=OUT/'s9-review.mp4'
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)]));write('ffprobe.json',probe)
v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert v['codec_name']=='h264' and a['codec_name']=='aac'
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1920,1080,'30/1',t['total_duration_frames']+offset)
started=time.time()
with (OUT/'full-decode.log').open('wb') as log:
 r=subprocess.run(['ffmpeg','-v','error','-i',str(movie),'-f','null','-'],stdout=log,stderr=subprocess.STDOUT)
assert r.returncode==0
# Decode actual encoded audio once, then report RMS per narrative/comparison block.
p=subprocess.check_output(['ffmpeg','-v','error','-i',str(movie),'-vn','-ac','1','-ar','16000','-f','s16le','-'])
samples=array.array('h');samples.frombytes(p)
for s in segments:
 lo=round(s['startFrame']/30*16000);hi=round((s['startFrame']+s['frames'])/30*16000)
 part=samples[lo:hi];rms=math.sqrt(sum(x*x for x in part)/len(part))/32768
 s['encodedAudioRmsDbFS']=20*math.log10(max(rms,1e-12));assert rms>1e-5, s['id']+' is silent'
extracts=[('narration',1450),('battle-before',1125),('battle-after',1305),('se',1950),('rush',2500),('limits',3000)]
for name,frame in extracts:
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(movie),'-vf',f'select=eq(n\\,{frame})','-frames:v','1',str(OUT/f'export-{name}.png')],check=True)
write('render-inputs-after.json',after)
write('VIDEO_VERIFICATION.json',{'success':True,'movie':str(movie),'sha256':sha(movie),'bytes':movie.stat().st_size,'frames':int(v['nb_frames']),'fps':30,'videoDuration':int(v['nb_frames'])/30,'containerDuration':float(probe['format']['duration']),'codec':v['codec_name'],'audioCodec':a['codec_name'],'fullDecodeExitCode':r.returncode,'verificationSeconds':time.time()-started,'inputsUnchanged':True,'segments':segments,'naturalPlayback':'PM pending','humanListening':'Not verified; numeric non-silence is not listening acceptance','narration':'Approved text/order unchanged; comparison blocks have no narration'})
print(json.dumps({'success':True,'sha256':sha(movie),'bytes':movie.stat().st_size,'duration':int(v['nb_frames'])/30}))
