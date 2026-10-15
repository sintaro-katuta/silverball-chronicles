from pathlib import Path
import os,subprocess,json
r=Path(__file__).resolve().parents[2]
o=Path(os.environ.get('S5_LIVE_VIDEO_OUTPUT',str(r/'prototype/reference-review/s5-video-2026-10-10/live-addendum'))).resolve()
ffmpeg=os.environ.get('FFMPEG','ffmpeg');ffprobe=os.environ.get('FFPROBE','ffprobe')
def frames(p):
 j=json.loads(subprocess.check_output([ffprobe,'-v','error','-show_entries','stream=codec_type,nb_frames','-of','json',str(p)]))
 return int(next(s['nb_frames'] for s in j['streams'] if s['codec_type']=='video'))
# Require completed, parseable inputs before touching any output.
assert frames(o/'prefix.mp4')==930
assert frames(o/'public/approved-reference.mp4')==1921
graph="[2:v]crop=1920:76:0:0[band];[1:v][band]overlay=0:0,format=yuv420p,setsar=1,setpts=PTS-STARTPTS[ref];[0:v]format=yuv420p,setsar=1,setpts=PTS-STARTPTS[pre];[pre][ref]concat=n=2:v=1:a=0[outv]"
with (o/'finish.log').open('w') as log:
 subprocess.run([ffmpeg,'-y','-i',str(o/'prefix.mp4'),'-i',str(o/'public/approved-reference.mp4'),'-i',str(o/'preview-reference.png'),'-filter_complex',graph,'-map','[outv]','-an','-c:v','libx264','-preset','fast','-crf','22','-r','30',str(o/'merged-video.mp4')],stdout=log,stderr=subprocess.STDOUT,check=True)
 assert frames(o/'merged-video.mp4')==2851
 subprocess.run([ffmpeg,'-y','-i',str(o/'merged-video.mp4'),'-itsoffset','31','-i',str(o/'public/approved-reference.mp4'),'-map','0:v:0','-map','1:a:0','-c','copy','-movflags','+faststart',str(o/'review.mp4')],stdout=log,stderr=subprocess.STDOUT,check=True)
print('LIVE_VIDEO_ASSEMBLED / original AAC packets copied with 31-second offset',flush=True)
