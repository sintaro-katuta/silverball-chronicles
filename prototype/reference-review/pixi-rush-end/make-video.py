import json,subprocess
from pathlib import Path
p=Path('reference-review/pixi-rush-end');v=json.loads((p/'verification.json').read_text())
subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(v['exit']-7),'-i',str(p/'full.webm'),'-t','11','-vf','crop=420:300:0:0,scale=840:600:flags=neighbor','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(p/'ending.mp4')],check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-ss','6.7','-i',str(p/'ending.mp4'),'-t','4','-vf','fps=3,scale=420:300:flags=neighbor,tile=4x3','-frames:v','1',str(p/'motion.jpg')],check=True)
