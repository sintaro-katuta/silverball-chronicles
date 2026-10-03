from pathlib import Path
import subprocess,json,sys
p=Path(__file__).parent/(sys.argv[1] if len(sys.argv)>1 else 'round2')
manifest=[]
for name in ['normal','miss','rush','payout','bonus','decision','drive']:
 frames=sorted((p/(name+'-frames')).glob('*.png'))
 if not frames:continue
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-framerate','15','-i',str(p/(name+'-frames')/'%05d.png'),'-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(p/(name+'-runtime.mp4'))],check=True)
 manifest.append({'name':name,'frames':len(frames),'fps':15,'duration':len(frames)/15})
(p/'capture-manifest.json').write_text(json.dumps(manifest,indent=2))
if not (p/'normal-runtime.mp4').exists():
 print(json.dumps(manifest,indent=2));sys.exit(0)
times=[2,10,30,49,60,72,84,89,102.5,103.5,114.3,120,131.5,134.3,139.5,141.5]
expr='+'.join('eq(n,%d)'%int(t*15) for t in times)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(p/'normal-runtime.mp4'),'-vf',"select='%s',scale=270:410,tile=4x4"%expr,'-frames:v','1',str(p/'normal-contact.jpg')],check=True)
print(json.dumps(manifest,indent=2))
