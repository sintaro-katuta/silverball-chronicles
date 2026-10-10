from pathlib import Path
import subprocess,json,os
r=Path(__file__).resolve().parents[2];o=Path(os.environ.get('S5_VIDEO_OUTPUT_DIR',str(r/'prototype/reference-review/s5-video-2026-10-10'))).resolve();cli=Path(os.environ.get('S5_REMOTION_CLI',str(r/'tools/pr-video/node_modules/.bin/remotion')));t=json.loads((o/'timeline.json').read_text());common=['--public-dir='+str(o/'public'),'--browser-executable='+os.environ.get('REMOTION_BROWSER_EXECUTABLE','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')]
for c in t['clips']:
 with (o/f"preview-{c['id']}.log").open('w') as log:subprocess.run([str(cli),'still','tools/pr-video/s5-index.tsx','S5Review',str(o/f"preview-{c['id']}.png"),'--frame='+str(c['start_frame']+30),*common],cwd=r,stdout=log,stderr=subprocess.STDOUT,check=True)
 print('PREVIEW_READY',c['id'],flush=True)
