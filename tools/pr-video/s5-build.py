from pathlib import Path
import subprocess,json
r=Path(__file__).resolve().parents[2];o=r/'prototype/reference-review/s5-video-2026-10-10';cli=r/'tools/pr-video/node_modules/.bin/remotion';t=json.loads((o/'timeline.json').read_text());common=['--public-dir='+str(o/'public'),'--browser-executable=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
for c in t['clips']:
 with (o/f"preview-{c['id']}.log").open('w') as log:subprocess.run([str(cli),'still','tools/pr-video/s5-index.tsx','S5Review',str(o/f"preview-{c['id']}.png"),'--frame='+str(c['start_frame']+30),*common],cwd=r,stdout=log,stderr=subprocess.STDOUT,check=True)
 print('PREVIEW_READY',c['id'],flush=True)
