"""Validate the new export without treating non-silence as human listening."""
import array,hashlib,json,math,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'prototype/reference-review/s9-20261018/pr-video-v2'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def inventory():
    paths=[Path(__file__).resolve(),ROOT/'tools/pr-video/s9-reel-index.tsx',ROOT/'tools/pr-video/s9-reel-prepare.py',OUT/'media-receipt.json',ROOT/'docs/agile/s9-video/script.md',ROOT/'docs/agile/s9-video/script.json']+sorted(p for p in (OUT/'public').rglob('*') if p.is_file())
    return [{'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size,'sha256':sha(p)} for p in paths]
def write(n,v):(OUT/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
if '--snapshot' in sys.argv:
    write('render-inputs-before.json',inventory());sys.exit()
before=json.loads((OUT/'render-inputs-before.json').read_text());after=inventory();assert before==after
movie=OUT/'s9-review-v2.mp4'
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)]));write('ffprobe.json',probe)
v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['codec_name'],a['codec_name'],v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==('h264','aac',1920,1080,'30/1',4141)
assert movie.stat().st_size<10_000_000,'Keep below GitHub ordinary attachment limit'
with (OUT/'full-decode.log').open('wb') as log:
    result=subprocess.run(['ffmpeg','-v','error','-i',str(movie),'-f','null','-'],stdout=log,stderr=subprocess.STDOUT)
assert result.returncode==0
pcm=array.array('h');pcm.frombytes(subprocess.check_output(['ffmpeg','-v','error','-i',str(movie),'-vn','-ac','1','-ar','16000','-f','s16le','-']))
segments=[]
for name,start,seconds in [('reel-before',3,12),('reel-after',15,12),('approved-original',32,3181/30)]:
    samples=pcm[round(start*16000):round((start+seconds)*16000)]
    rms=math.sqrt(sum(s*s for s in samples)/len(samples))/32768
    assert rms>1e-5,name
    segments.append({'name':name,'startSeconds':start,'seconds':seconds,'encodedRmsDbFS':20*math.log10(rms)})
for name,seconds in [('intro',1),('before',7),('after',19),('checks',29),('original',34)]:
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(seconds),'-i',str(movie),'-frames:v','1',str(OUT/f'export-{name}.png')],check=True)
write('render-inputs-after.json',after)
write('VIDEO_VERIFICATION.json',{'success':True,'sha256':sha(movie),'bytes':movie.stat().st_size,'frames':4141,'videoSeconds':4141/30,'containerSeconds':float(probe['format']['duration']),'fullDecodeExitCode':0,'inputsUnchanged':True,'segments':segments,'silentCaptionOnlyIntervals':[[0,3],[27,32]],'narration':'Original approved 7 paragraphs unchanged; no new speech. Context label limits the old 8-effect explanation.','localNaturalPlayback':'pending','prNaturalPlayback':'pending','humanListening':'unverified'})
print(json.dumps({'success':True,'bytes':movie.stat().st_size,'seconds':4141/30,'sha256':sha(movie)}))
