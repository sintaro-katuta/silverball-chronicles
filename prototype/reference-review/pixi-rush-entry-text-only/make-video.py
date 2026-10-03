import json,subprocess
from pathlib import Path
p=Path('reference-review/pixi-rush-entry-text-only')
v=json.loads((p/'verification.json').read_text())
subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(max(0,v['entry']-3)),'-i',str(p/'full.webm'),'-t','14','-vf','crop=420:300:0:0,scale=840:600:flags=neighbor','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(p/'entry.mp4')],check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-ss','3','-i',str(p/'entry.mp4'),'-t','2','-vf','fps=4,scale=420:300:flags=neighbor,tile=4x2','-frames:v','1',str(p/'motion.jpg')],check=True)
