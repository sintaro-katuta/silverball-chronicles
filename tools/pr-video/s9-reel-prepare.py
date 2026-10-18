"""Prepare real-time reel/admission excerpts; retain the approved older film."""
import hashlib,json,shutil,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
E=ROOT/'prototype/reference-review/s9-20261018'
OUT=E/'pr-video-v2'
PUBLIC=OUT/'public'
PUBLIC.mkdir(parents=True,exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
rows=[]
for side in ['before','after']:
    folder=E/'runtime'/f'scene-reel-{side}-v1'
    data=json.loads((folder/'record.json').read_text())
    # The recorder supplies a deterministic first-admission selection, not a best result.
    start=data['windowProposal']['start']
    source=folder/'reel.webm';dest=PUBLIC/f'reel-{side}.mp4'
    subprocess.run(['ffmpeg','-v','error','-nostdin','-y','-ss',str(start),'-i',str(source),'-t','12','-vf','scale=1000:760:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=1000:760:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30','-c:v','libx264','-crf','25','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',str(dest)],check=True)
    rows.append({'side':side,'source':str(source.relative_to(ROOT)),'sourceSHA256':sha(source),'startWallSeconds':start,'seconds':12,'speed':1,'selection':'First physical heso admission minus 0.3s; 100ms sampling, not frame-exact. No selection by admission count.','sha256':sha(dest)})
old=E/'pr-video/s9-review.mp4'
assert sha(old)=='6923755d8cc4dbb1a1ca4319998dc5fc7f7635cc245f976b1308fe208a9f78ca'
shutil.copyfile(old,PUBLIC/'s9-review-original.mp4')
receipt={'clips':rows,'oldVideoSHA256':sha(old),'narration':'Approved original speech is unchanged. New opening uses captions and actual game sound only. Original film is labelled as the first 8 effects.','humanListening':'Unverified'}
(OUT/'media-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print('Prepared two real-time clips and preserved approved film')
