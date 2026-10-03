from pathlib import Path
import subprocess,json
p=Path(__file__).parent/'final2'
manifest=[]
for name in ['normal','miss','rush','payout','bonus','decision','drive']:
 frames=sorted((p/(name+'-frames')).glob('*.png'))
 if not frames:continue
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-framerate','15','-i',str(p/(name+'-frames')/'%05d.png'),'-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(p/(name+'-runtime.mp4'))],check=True)
 manifest.append({'name':name,'frames':len(frames),'fps':15,'duration':len(frames)/15})
(p/'capture-manifest.json').write_text(json.dumps(manifest,indent=2))
times=[6,10.3,11,15,18,24,28,31.5,32.3,35.9,37.1,38.5]
expr='+'.join('eq(n,%d)'%int(t*15) for t in times)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(p/'normal-runtime.mp4'),'-vf',"select='%s',scale=270:410,tile=4x3"%expr,'-frames:v','1',str(p/'normal-contact.jpg')],check=True)
print(json.dumps(manifest,indent=2))
