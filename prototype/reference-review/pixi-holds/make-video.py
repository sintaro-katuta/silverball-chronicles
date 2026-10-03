import json, subprocess
from pathlib import Path
p=Path('reference-review/pixi-holds')
v=json.loads((p/'verification.json').read_text())
segments=[(2,16),(v['entry']+5,16),(max(0,v['exit']-3),5)]
for n,(start,duration) in enumerate(segments):
 subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(start),'-i',str(p/'full.webm'),'-t',str(duration),'-vf','crop=420:300:0:0,scale=840:600:flags=neighbor','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-r','30',str(p/f'part-{n}.mp4')],check=True)
(p/'parts.txt').write_text(''.join(f"file 'part-{n}.mp4'\n" for n in range(3)))
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(p/'parts.txt'),'-c','copy','-movflags','+faststart',str(p/'holds.mp4')],check=True)
