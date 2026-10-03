from pathlib import Path
import json,subprocess
p=Path(__file__).parent
source=max(p.glob('page@*.webm'),key=lambda f:f.stat().st_mtime)
data=json.loads((p/'verified.json').read_text());m={a['event']:a['wall'] for a in data['marks']}
duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(source)]))
ranges=[[0,9],[m['win']-6,m['payout']+4],[m['entry']-2,m['rush']+7],[m['end']-4,duration]]
merged=[]
for a,b in ranges:
 a=max(0,a);b=min(duration,b)
 if merged and a<=merged[-1][1]:merged[-1][1]=max(b,merged[-1][1])
 else:merged.append([a,b])
filters=';'.join(f'[0:v]trim=start={a}:end={b},setpts=PTS-STARTPTS[v{i}]' for i,(a,b) in enumerate(merged))+';'+''.join(f'[v{i}]' for i in range(len(merged)))+f'concat=n={len(merged)}:v=1:a=0[out]'
subprocess.run(['ffmpeg','-y','-i',str(source),'-filter_complex',filters,'-map','[out]','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(p/'session.mp4')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
(p/'edit.json').write_text(json.dumps({'source':source.name,'sourceSeconds':duration,'ranges':merged,'editedSeconds':sum(b-a for a,b in merged),'speed':1},indent=2))
print((p/'edit.json').read_text())
subprocess.run(['ffmpeg','-y','-i',str(p/'session.mp4'),'-vf',f'fps={12/sum(b-a for a,b in merged)},scale=270:255,tile=4x3','-frames:v','1',str(p/'sequence.jpg')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
