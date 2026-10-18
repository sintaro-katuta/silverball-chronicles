"""Keep the Remotion master; make a smaller PR attachment without re-encoding audio."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'prototype/reference-review/s9-20261018/pr-video-v3'
movie=OUT/'s9-review-v3.mp4';master=OUT/'s9-review-v3-render.mp4';receipt=OUT/'packing-receipt.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert movie.is_file() and not master.exists() and not receipt.exists(),'Fresh packing output required'
original={'sha256':sha(movie),'bytes':movie.stat().st_size}
movie.rename(master)
command=['ffmpeg','-v','error','-nostdin','-i',str(master),'-map','0:v:0','-map','0:a:0','-c:v','libx264','-preset','medium','-crf','31','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(movie)]
subprocess.run(command,check=True)
assert movie.stat().st_size<10_000_000,'Preserve both outputs and revise packing settings'
# AAC packets must remain identical; the final verifier checks all video frames.
def aac(p):return subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:a:0','-c:a','copy','-f','adts','-'])
assert aac(master)==aac(movie)
receipt.write_text(json.dumps({'master':{'path':master.name,**original},'attachment':{'path':movie.name,'sha256':sha(movie),'bytes':movie.stat().st_size},'toolSHA256':sha(Path(__file__)),'command':command,'aacPacketsUnchanged':True,'note':'Same full-length render; video-only CRF31 transcode for the PR attachment limit. Master retained.'},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'bytes':movie.stat().st_size,'sha256':sha(movie),'aacPacketsUnchanged':True}))
