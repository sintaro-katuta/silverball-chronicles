"""Verify an existing S6 export. No render, synthesis or product mutation."""
import hashlib,json,os,subprocess
from pathlib import Path
out=Path(os.environ['S6_VIDEO']).resolve();root=Path(__file__).resolve().parents[2]
movie=out/'s6-reference-review.mp4'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
def ff(args):
 r=subprocess.run(['/opt/homebrew/bin/ffmpeg',*args],capture_output=True,text=True)
 if r.returncode:raise RuntimeError(r.stderr)
 return r
probe=json.loads(subprocess.check_output(['/opt/homebrew/bin/ffprobe','-v','error','-show_format','-show_streams','-of','json',str(movie)],text=True))
(out/'ffprobe.json').write_text(json.dumps(probe,indent=2));v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert v['codec_name']=='h264' and a['codec_name']=='aac' and v['width']==1920 and v['height']==1080 and v['r_frame_rate']=='30/1'
assert int(v['nb_frames'])==2689
r=ff(['-v','error','-i',str(movie),'-f','null','-']);(out/'full-decode.log').write_text(r.stderr);assert not r.stderr
for name,t in [('whole',2),('local',15),('short-table',36),('admission',65.833333),('old-long',80)]:ff(['-y','-v','error','-ss',str(t),'-i',str(movie),'-frames:v','1',str(out/f'export-{name}.png')])
voice=json.loads((out/'voice-input-proof.json').read_text());data=json.loads((root/'tools/pr-video/s6-data.json').read_text());script=json.loads((root/'docs/agile/s6-video/script.json').read_text());review=json.loads((root/'docs/agile/s6-video/.script.md.yukkuri-review.json').read_text());assert review['status']=='APPROVED' and review['script_sha256']==sha(root/'docs/agile/s6-video/script.json') and review['script_markdown_sha256']==sha(root/'docs/agile/s6-video/script.md');assert [x['text'] for x in script['lines']]==[x['text'] for x in data['timeline']['clips']]
for c in voice['clips']:assert sha(out/'public/audio'/c['audio_file'])==c['wavSHA']
media=sorted((root/'tools/pr-video').glob('s6-*.*'))+[(root/'prototype/tools/s6-reference-media'/n) for n in ['trial-input.mjs','capture.mjs','replay.js','replay.html']];inventory=[]
for p in media:
 if p.suffix not in ['.tsx','.mjs','.json','.py','.html','.js']:continue
 inventory.append({'path':str(p.relative_to(root)),'sha256':sha(p)});q=out/'executed-media-source'/p.relative_to(root);q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(p.read_bytes())
(out/'media-source-inventory.json').write_text(json.dumps({'scope':'Media sources separate from176 mechanical inputs; executed capture unchanged; final composition/verification saved separately.','files':inventory},ensure_ascii=False,indent=2))
cap=json.loads((out/'capture.json').read_text());production={'movie':{'path':str(movie),'sha256':sha(movie),'bytes':movie.stat().st_size,'codec':'H264/AAC','fps':'30/1','frames':int(v['nb_frames']),'videoSeconds':v['duration'],'containerSeconds':probe['format']['duration'],'under10MB':movie.stat().st_size<10_000_000},'machineSourceSHA':cap['sourceSHA'],'machineInputs':176,'captureSourceUnchanged':cap['sourceUnchanged'],'mediaAssets':cap['assets'],'mediaInventory':'media-source-inventory.json','frameTimeReceipt':'frame-time-receipt.json','voice':{'approvalStatus':'APPROVED','textsExact':True,'all8WAVUnchanged':True,'timelineFrames':data['timeline']['total_duration_frames'],'credit':'VOICEVOX:ずんだもん','humanHearing':'not evaluated by Designer'},'fullDecode':{'exitCode':0,'errorLogBytes':0},'visualQA':{'previewPM':'accepted whole/local/short/oldlong','actualMP4Extractions':['export-whole.png','export-local.png','export-short-table.png','export-admission.png','export-old-long.png'],'actualExtractedReview':'pending'},'nativePlayback':{'status':'awaiting-PM-continuous-playback'},'scope':'New3 rejected/no newlong. PriorID2 retained internally. Product defaults unchanged. Actual excerpts1x, same trial time/scale; repeated/held/static endpoints labelled.'}
(out/'PRODUCTION.json').write_text(json.dumps(production,ensure_ascii=False,indent=2));(out/'VIDEO_VERIFICATION.json').write_text(json.dumps({'movie':production['movie'],'fullDecode':production['fullDecode'],'nativePlayback':production['nativePlayback']},ensure_ascii=False,indent=2));print(json.dumps(production['movie'],ensure_ascii=False))
