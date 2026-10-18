from pathlib import Path
import subprocess,json,hashlib,shutil
folder=Path(__file__).resolve().parent;src=folder/'titles';dest=folder/'captioned';dest.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run(args):subprocess.run(['ffmpeg','-hide_banner','-loglevel','error',*args],check=True)
def probe(p):return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
segments=[];receipts=[]
for name,frames in [('intro',120),('outro',150)]:
 p=dest/(name+'.mp4');assert not p.exists()
 run(['-loop','1','-framerate','30','-i',str(src/(name+'.png')),'-frames:v',str(frames),'-an','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',str(p)])
 receipts.append({'file':str(p.relative_to(folder)),'sha256':sha(p),'frames':frames,'scope':'Static written explanation card; no simulated motion or narration'})
for name in ['ball-1','ball1-wheel-close','ball-34','ball-12','ball-7','ball-2']:
 source=folder/name/(name+'.mp4');p=dest/(name+'.mp4');assert not p.exists();info=probe(source);frames=int(info['streams'][0]['nb_frames'])
 run(['-i',str(source),'-loop','1','-framerate','30','-i',str(src/(name+'.png')),'-filter_complex','[0:v][1:v]overlay=0:0:shortest=1[v]','-map','[v]','-frames:v',str(frames),'-an','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',str(p)])
 receipts.append({'file':str(p.relative_to(folder)),'sha256':sha(p),'frames':frames,'input':str(source.relative_to(folder)),'inputSHA':sha(source),'overlay':str((src/(name+'.png')).relative_to(folder)),'overlaySHA':sha(src/(name+'.png')),'scope':'Only written top header added; movement and clock from verified source clip'})
order=['intro','ball-1','ball1-wheel-close','ball-34','ball-12','ball-7','ball-2','outro']
listing=folder/'concat.txt';listing.write_text(''.join("file '"+str((dest/(n+'.mp4')).resolve())+"'\n" for n in order))
output=folder/'route-observation.mp4';assert not output.exists()
run(['-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(output)])
info=probe(output);streams=info['streams'];assert len(streams)==1 and streams[0]['codec_type']=='video' and streams[0]['r_frame_rate']=='30/1'
total=sum(r['frames'] for r in receipts);assert int(streams[0]['nb_frames'])==total
(folder/'composition.json').write_text(json.dumps({'scope':'Silent diagnostic observation film, not approved voice-over PR explanation','order':order,'segments':receipts,'frames':total,'duration':info['format']['duration'],'sha256':sha(output),'bytes':output.stat().st_size,'probe':info},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'file':str(output),'frames':total,'duration':info['format']['duration'],'bytes':output.stat().st_size}))
