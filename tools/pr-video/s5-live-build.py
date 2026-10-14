from pathlib import Path
import os,subprocess
r=Path(__file__).resolve().parents[2]
o=Path(os.environ.get('S5_LIVE_VIDEO_OUTPUT',str(r/'prototype/reference-review/s5-video-2026-10-10/live-addendum'))).resolve()
cli=Path(os.environ.get('S5_REMOTION_CLI',str(r/'tools/pr-video/node_modules/.bin/remotion')))
args=['--public-dir='+str(o/'public'),'--browser-executable='+os.environ.get('REMOTION_BROWSER_EXECUTABLE','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')]
link=r/'tools/pr-video/node_modules'
owned_link=False
if not link.exists() and cli.parent.name=='.bin':
 deps=cli.parent.parent.resolve()
 if not deps.is_dir(): raise RuntimeError('Set S5_REMOTION_CLI to an existing Remotion .bin/remotion')
 link.symlink_to(deps,target_is_directory=True);owned_link=True
try:
 for name,frame in [('before',40),('live-pc',360),('live-mobile',810),('reference',1530)]:
  with (o/f'preview-{name}.log').open('w') as log:
   subprocess.run([str(cli),'still','tools/pr-video/s5-live-index.tsx','S5LiveReview',str(o/f'preview-{name}.png'),f'--frame={frame}',*args],cwd=r,stdout=log,stderr=subprocess.STDOUT,check=True)
  print('PREVIEW_READY',name,flush=True)
 with (o/'render-prefix.log').open('w') as log:
  subprocess.run([str(cli),'render','tools/pr-video/s5-live-index.tsx','S5LiveReview',str(o/'prefix.mp4'),'--frames=0-929','--codec=h264','--crf=22','--audio-codec=aac',*args],cwd=r,stdout=log,stderr=subprocess.STDOUT,check=True)
 print('RENDER_DONE',flush=True)
finally:
 if owned_link: link.unlink()
