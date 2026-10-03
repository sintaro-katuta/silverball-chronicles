import json, subprocess
from pathlib import Path
p=Path('reference-review/pixi-rush-background')
v=json.loads((p/'verification.json').read_text())
segments=[(0,4),(max(0,v['entry']-2),14),(max(0,v['exit']-4),8)]
for n,(start,duration) in enumerate(segments):
 subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(start),'-i',str(p/'full.webm'),'-t',str(duration),'-vf','crop=420:300:0:0,scale=840:600:flags=neighbor','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-r','30',str(p/f'part-{n}.mp4')],check=True)
(p/'parts.txt').write_text(''.join(f"file 'part-{n}.mp4'\n" for n in range(3)))
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(p/'parts.txt'),'-c','copy','-movflags','+faststart',str(p/'transitions.mp4')],check=True)
