from pathlib import Path
import json,hashlib,subprocess,os
r=Path(__file__).resolve().parents[2];o=Path(os.environ.get('S5_VIDEO_OUTPUT_DIR',str(r/'prototype/reference-review/s5-video-2026-10-10'))).resolve();script=Path(os.environ.get('S5_APPROVED_SCRIPT_DIR',str(r/'docs/agile/s5-video'))).resolve();t=json.loads((o/'timeline.json').read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
a=json.loads((script/'.script.md.yukkuri-review.json').read_text());assert a['status']=='APPROVED' and a['script_sha256']==sha(script/'script.json') and a['script_markdown_sha256']==sha(script/'script.md')
s=json.loads((script/'script.json').read_text());assert [(x['id'],x['text']) for x in s['lines']]==[(x['id'],x['text']) for x in t['clips']]
assert all(x['speaker']==3 for x in t['clips'])
audios=[]
for x in t['clips']:
 p=o/x['audio_file'];assert p.read_bytes()==(o/'public'/x['audio_file']).read_bytes();audios.append({'id':x['id'],'sha256':sha(p),'frame':x['start_frame'],'durationFrames':x['duration_frames'],'speaker':x['speaker']})
movie=o/'review.mp4';p=json.loads(subprocess.check_output(['ffprobe','-v','quiet','-show_format','-show_streams','-of','json',str(movie)]));(o/'ffprobe.json').write_text(json.dumps(p,indent=2))
assert movie.stat().st_size<10000000 and p['streams'][0]['codec_name']=='h264';assert any(x['codec_name']=='aac' for x in p['streams'])
for x in t['clips']:
 time=(x['start_frame']+30)/30;subprocess.run(['ffmpeg','-v','error','-ss',str(time),'-i',str(movie),'-frames:v','1','-y',str(o/f"export-{x['id']}.png")],check=True)
subprocess.run(['ffmpeg','-v','error','-ss',str((t['total_duration_frames']+30)/30),'-i',str(movie),'-frames:v','1','-y',str(o/'export-ending.png')],check=True)
rec=json.loads((o/'ui-v2-dom/record.json').read_text());assert sha(o/'public/operations.webm')==rec['videoSHA'] and rec['sourceBefore']==rec['sourceAfter']
proof={'videoSHA':sha(movie),'bytes':movie.stat().st_size,'duration':float(p['format']['duration']),'frames':t['total_duration_frames']+60,'fps':30,'audioClips':audios,'approval':a,'sourceTimelineSHA':sha(o/'timeline.json'),'compositionSHA':sha(r/'tools/pr-video/s5-index.tsx'),'operationVideoSHA':rec['videoSHA'],'operationSourceUnchanged':True,'formatVersion':2,'v1MediaUsed':False,'newSearchIncluded':False,'sourceComparisonSHA':sha(o/'comparison-source.json'),'renderExitCode':0,'previewReview':'7 final PNG viewed: all glyphs and annotation readable, no caption overlap','finalMP4Review':'extracted images pending','nativePlayback':'pending PM','hearingReview':'not performed by Designer; separate from game-sound issue7','upload':'not performed'}
(o/'verification.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:proof[k] for k in ['videoSHA','bytes','duration','frames','fps']},indent=2))
