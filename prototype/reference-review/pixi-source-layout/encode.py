import json,subprocess,pathlib
root=pathlib.Path(__file__).resolve().parent
parts=[]
for meta,start,duration,kind in [('video.json',2,12,'normal'),('right-video.json',3,11,'attacker'),('rush-video.json',3,11,'electric-chucker')]:
    src=json.loads((root/meta).read_text())['file'];dest=root/(kind+'.mp4')
    filters='setsar=1' if kind=='normal' else 'crop=510:584:94:136,scale=390:446:flags=neighbor,pad=390:844:0:100:color=0x080f1b,setsar=1'
    subprocess.run(['/opt/homebrew/bin/ffmpeg','-y','-loglevel','error','-ss',str(start),'-i',src,'-t',str(duration),'-vf',filters,'-r','30','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p',str(dest)],check=True)
    parts.append(dict(source=src,start=start,duration=duration,kind=kind,file=dest.name,speed=1))
(root/'concat.txt').write_text(''.join("file '"+p['file']+"'\n" for p in parts))
subprocess.run(['/opt/homebrew/bin/ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(root/'concat.txt'),'-c','copy','-movflags','+faststart',str(root/'source-layout.mp4')],check=True)
(root/'edit.json').write_text(json.dumps({'segments':parts,'audio':False,'description':'Normal production play followed by independent attacker and electric-chucker open tests. No speed changes.'},indent=2))
