from pathlib import Path
import os,json,hashlib,subprocess
r=Path(__file__).resolve().parents[2]
ref=Path(os.environ.get('S5_VIDEO_OUTPUT_DIR',str(r/'prototype/reference-review/s5-video-2026-10-10'))).resolve()
o=Path(os.environ.get('S5_LIVE_VIDEO_OUTPUT',str(ref/'live-addendum'))).resolve()
approved=Path(os.environ.get('S5_APPROVED_SCRIPT_DIR',str(r/'docs/agile/s5-video'))).resolve()
def portable(p):
 p=p.resolve()
 try:return str(p.relative_to(r))
 except ValueError:
  parts=p.parts
  for i in range(len(parts)-1):
   if parts[i:i+2]==('prototype','reference-review'):return str(Path(*parts[i:]))
  return str(p)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
prior=json.loads((r/'docs/agile/s5-video/SOURCE_PROVENANCE.json').read_text())
review=json.loads((approved/'.script.md.yukkuri-review.json').read_text())
assert review['status']=='APPROVED' and review['approved_by']=='user'
assert sha(approved/'script.json')==review['script_sha256']==prior['approvedScriptSHA']
assert sha(approved/'script.md')==review['script_markdown_sha256']==prior['approvedMarkdownSHA']
assert sha(o/'public/approved-reference.mp4')==sha(ref/'review.mp4')==prior['movie']['sha256']
voices=[]
for c in prior['audioClips']:
 p=ref/'audio'/f"{c['id']}.wav"
 assert sha(p)==c['sha256']
 voices.append({**c,'newMovieStartFrame':c['frame']+930,'identityVerified':True})
raw=json.loads((o/'live-record.json').read_text());assert raw['sourceBefore']==raw['sourceAfter']
for rec in raw['records']:
 assert not rec['errors']
 assert sha(Path(rec['videoPath']))==rec['videoSHA']
def aac_packets(p):
 return hashlib.sha256(subprocess.check_output([os.environ.get('FFMPEG','ffmpeg'),'-v','error','-i',str(p),'-map','0:a:0','-c','copy','-f','adts','-'])).hexdigest()
referenceAAC=aac_packets(o/'public/approved-reference.mp4')
finalAAC=aac_packets(o/'review.mp4')
assert referenceAAC==finalAAC
probe=json.loads(subprocess.check_output([os.environ.get('FFPROBE','ffprobe'),'-v','error','-show_streams','-show_format','-of','json',str(o/'review.mp4')]))
video=next(s for s in probe['streams'] if s['codec_type']=='video');audio=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert video['codec_name']=='h264' and audio['codec_name']=='aac'
assert int(video['nb_frames'])==2851 and video['r_frame_rate']=='30/1'
assert 95<float(probe['format']['duration'])<95.2
assert (o/'review.mp4').stat().st_size<10_000_000
metadata={'movie':{'path':portable(o/'review.mp4'),'sha256':sha(o/'review.mp4'),'bytes':(o/'review.mp4').stat().st_size,'durationSeconds':float(probe['format']['duration']),'frames':2851,'fps':30,'codec':['h264','aac']},'scriptApproval':review,'referenceMovie':prior['movie'],'referenceByteIdentityVerified':True,'aacPacketIdentity':{'reference':referenceAAC,'final':finalAAC,'verified':True},'voice7':voices,'newSpeechGenerated':False,'productSourcePMReported':os.environ.get('S5_PRODUCT_SOURCE_SHA'),'productHeadPMReported':os.environ.get('S5_PRODUCT_SOURCE_HEAD'),'captureSubset':{'paths':raw['sourceBefore'],'unchanged':True,'scope':'Five UI/controller/model/HTML files only, not a full simulation-input guard'},'segments':[{'fromFrame':0,'toFrame':90,'scope':'Historical actual slider UI, static baseline12s; not continuous gameplay'},{'fromFrame':90,'toFrame':750,'scope':'New1440 real live operations; WebM0.8s+22s, wall-time unscaled'},{'fromFrame':750,'toFrame':930,'scope':'New390 independent live operation; WebM2s+6s, not synchronized physics comparison'},{'fromFrame':930,'toFrame':2851,'scope':'Previously approved64s explanation; prior raw table retains its generation'}],'edit':'Raw25fps to30fps frame duplication, no optical-flow interpolation; Remotion prefix0..929 (31s), prior reference1921f with76px opaque annotation; FFmpeg2851f concat and original AAC packets offset31s without reencoding; previous live-addendum generation early-rename failure retained separately; this generation completes930f prefix before assembly','referenceComparison':prior['finalComparison'],'sourceFiles':[{'path':str(p.relative_to(r)),'sha256':sha(p)} for p in (r/'tools/pr-video').glob('s5-live-*') if p.is_file()],'hearing':'Unverified by Designer; game audio issue7 is separate','realDeviceFPS':'Unverified','nativePlayback':'Pending PM','upload':'PM owner; not performed by Designer'}
(o/'verification.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
(o/'ffprobe.json').write_text(json.dumps(probe,indent=2))
print('LIVE_VIDEO_VERIFIED',metadata['movie'])
