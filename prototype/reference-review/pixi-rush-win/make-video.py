import json,subprocess
from pathlib import Path
p=Path('reference-review/pixi-rush-win');v=json.loads((p/'verification.json').read_text())
segments=[(v['win']-4,15),(v['resume']-5,11)]
for n,(start,duration) in enumerate(segments):
 subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(start),'-i',str(p/'full.webm'),'-t',str(duration),'-vf','crop=420:300:0:0,scale=840:600:flags=neighbor','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p',str(p/f'part{n}.mp4')],check=True)
(p/'parts.txt').write_text("file 'part0.mp4'\nfile 'part1.mp4'\n")
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(p/'parts.txt'),'-c','copy','-movflags','+faststart',str(p/'continuation.mp4')],check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-ss','3.5','-i',str(p/'continuation.mp4'),'-t','4','-vf','fps=3,scale=420:300:flags=neighbor,tile=4x3','-frames:v','1',str(p/'win-motion.jpg')],check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-ss','18','-i',str(p/'continuation.mp4'),'-t','8','-vf','fps=1,scale=420:300:flags=neighbor,tile=4x2','-frames:v','1',str(p/'resume-motion.jpg')],check=True)
