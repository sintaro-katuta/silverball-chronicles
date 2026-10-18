"""V3 export validation: canonical speech and encoded sound, not ear acceptance."""
import array,hashlib,json,math,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'prototype/reference-review/s9-20261018/pr-video-v3';PUBLIC=OUT/'public'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(n,v):(OUT/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def inventory():
    paths=[Path(__file__).resolve(),ROOT/'tools/pr-video/s9-energy-index.tsx',ROOT/'tools/pr-video/s9-energy-prepare.py',OUT/'media-receipt.json']+[ROOT/'docs/agile/s9-video'/n for n in ['script.md','script.json','.script.md.yukkuri-review.json']]+sorted(p for p in PUBLIC.rglob('*') if p.is_file())
    return [{'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size,'sha256':sha(p)} for p in paths]
if '--snapshot' in sys.argv:write('render-inputs-before.json',inventory());sys.exit()
before=json.loads((OUT/'render-inputs-before.json').read_text());after=inventory();assert before==after
data=json.loads((PUBLIC/'media.json').read_text());timeline=data['timeline'];speech=timeline['clips'][2:];original=json.loads((ROOT/'docs/agile/s9-video/script.json').read_text())
frame=180;segments=[]
def sample(name):
    global frame
    s=next(s for s in data['samples'] if s['id']==name);segments.append({'id':name,'type':'comparison','startFrame':frame,'frames':s['frames']});frame+=s['frames']
for n in ['intro-before','intro-after','normal-before','normal-after']:sample(n)
for i,c in enumerate(speech):
    assert c['text']==next(l for l in original['lines'] if l['id']==c['id'])['text']
    fullIndex=i+2;end=timeline['clips'][fullIndex+1]['start_frame'] if fullIndex+1<len(timeline['clips']) else timeline['total_duration_frames']
    segments.append({'id':c['id'],'type':'approved speech','startFrame':frame,'frames':c['duration_frames']});frame+=end-c['start_frame']
    for n in (['battle-before','battle-after'] if i==0 else ['se-before','se-after'] if i==1 else ['bonus-before','bonus-after','rush-before','rush-after'] if i==2 else []):sample(n)
movie=OUT/'s9-review-v3.mp4';probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)]));write('ffprobe.json',probe)
v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['codec_name'],a['codec_name'],v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==('h264','aac',1920,1080,'30/1',frame)
assert movie.stat().st_size<10_000_000
with (OUT/'full-decode.log').open('wb') as log:result=subprocess.run(['ffmpeg','-v','error','-i',str(movie),'-f','null','-'],stdout=log,stderr=subprocess.STDOUT)
assert result.returncode==0
pcm=array.array('h');pcm.frombytes(subprocess.check_output(['ffmpeg','-v','error','-i',str(movie),'-vn','-ac','1','-ar','16000','-f','s16le','-']))
for s in segments:
    part=pcm[round(s['startFrame']/30*16000):round((s['startFrame']+s['frames'])/30*16000)]
    rms=math.sqrt(sum(x*x for x in part)/len(part))/32768;assert rms>1e-5,s['id'];s['encodedRmsDbFS']=20*math.log10(rms)
for name,f in [('intro',40),('normal',1100),('narration',1400),('bonus',3100),('limits',frame-140)]:subprocess.run(['ffmpeg','-v','error','-y','-i',str(movie),'-vf',f'select=eq(n\\,{f})','-frames:v','1',str(OUT/f'export-{name}.png')],check=True)
write('render-inputs-after.json',after);write('VIDEO_VERIFICATION.json',{'success':True,'sha256':sha(movie),'bytes':movie.stat().st_size,'frames':frame,'videoSeconds':frame/30,'containerSeconds':float(probe['format']['duration']),'fullDecodeExitCode':0,'inputsUnchanged':True,'segments':segments,'captionOnlySilenceSeconds':[0,6],'narration':'Only previously approved paragraphs3–7, source WAVs/text/order intact. No new speech/TTS.','naturalPlayback':'pending','humanListening':'unverified'})
print(json.dumps({'success':True,'frames':frame,'bytes':movie.stat().st_size,'seconds':frame/30,'sha256':sha(movie)}))
