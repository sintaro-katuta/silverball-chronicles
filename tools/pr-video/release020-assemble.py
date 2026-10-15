"""Assemble accepted silent cards and unchanged approved source segments.

Usage: python3 tools/pr-video/release020-assemble.py --evidence PATH
No synthesis, product changes, or network access. Requires ffmpeg/ffprobe.
"""
import argparse, hashlib, json, subprocess
from pathlib import Path

def sha(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
    return h.hexdigest()

def main():
    p=argparse.ArgumentParser();p.add_argument('--evidence',required=True);a=p.parse_args()
    out=Path(a.evidence).resolve(); inv=json.loads((out/'input-inventory.json').read_text())
    for row in inv['inputs']:
        if sha(row['path'])!=row['sha256']:raise ValueError('Input changed: '+row['path'])
    rows={r['id']:r for r in inv['inputs']}
    # Hold the last source frame up to ceil(container duration * 30), keeping
    # every original audio sample. S4 +2f, S6 +2f, recorded below.
    s4frames=1581;s6frames=2691
    s6start=8+s4frames/30+43
    duration=8+s4frames/30+43+s6frames/30+12
    files=[out/'intro.mp4',Path(rows['s4']['path']),out/'s5-context.mp4',Path(rows['s5']['path']),Path(rows['s6']['path']),out/'end.mp4']
    cmd=['ffmpeg','-hide_banner','-y']
    for f in files:cmd+=['-i',str(f)]
    graph=';'.join([
      '[0:v]fps=30,setsar=1,setpts=PTS-STARTPTS[v0]',
      '[1:v]tpad=stop_mode=clone:stop_duration=0.066667,trim=end_frame=1581,fps=30,setsar=1,setpts=PTS-STARTPTS[v1]',
      '[2:v]fps=30,setsar=1,setpts=PTS-STARTPTS[v2]',
      '[3:v]trim=start_frame=240:end_frame=1290,fps=30,setsar=1,setpts=PTS-STARTPTS[v3]',
      '[4:v]tpad=stop_mode=clone:stop_duration=0.066667,trim=end_frame=2691,fps=30,setsar=1,setpts=PTS-STARTPTS[v4]',
      '[5:v]fps=30,setsar=1,setpts=PTS-STARTPTS[v5]',
      '[v0][v1][v2][v3][v4][v5]concat=n=6:v=1:a=0[v]',
      '[1:a]asetpts=PTS-STARTPTS,adelay=384000S:all=1[a4]',
      f'[4:a]asetpts=PTS-STARTPTS,adelay={round(s6start*48000)}S:all=1[a6]',
      f'anullsrc=r=48000:cl=stereo,atrim=duration={duration}[silence]',
      f'[silence][a4][a6]amix=inputs=3:normalize=0:duration=longest,atrim=duration={duration}[a]'])
    cmd+=['-filter_complex',graph,'-map','[v]','-map','[a]','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','128k','-movflags','+faststart',str(out/'release020-review.mp4')]
    receipt={'command':cmd,'audioPolicy':'Original S4/S6 entire audio ranges retained at speed1, without text/order changes. AAC re-encoded; no bitwise waveform claim. S5 new silent8s card + original silent8..43s excerpt only. No TTS.','sourceHolds':[{'id':'s4','originalVideoFrames':1579,'outputFrames':1581,'lastFrameHoldAdded':2},{'id':'s6','originalVideoFrames':2689,'outputFrames':2691,'lastFrameHoldAdded':2}],'segments':[{'id':'intro','start':0,'duration':8},{'id':'s4','start':8,'duration':s4frames/30},{'id':'s5','start':8+s4frames/30,'duration':43},{'id':'s6','start':s6start,'duration':s6frames/30},{'id':'end','start':s6start+s6frames/30,'duration':12}],'expectedFrames':round(duration*30),'expectedVideoDuration':duration,'inputsUnchangedBefore':True}
    (out/'assembly-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    with (out/'encode.log').open('w') as log:subprocess.run(cmd,stdout=log,stderr=log,check=True)
    receipt['inputsUnchangedAfter']=all(sha(r['path'])==r['sha256'] for r in inv['inputs'])
    if not receipt['inputsUnchangedAfter']:raise ValueError('Source changed during encode')
    receipt['output']={'path':str(out/'release020-review.mp4'),'sha256':sha(out/'release020-review.mp4'),'bytes':(out/'release020-review.mp4').stat().st_size}
    (out/'assembly-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')

if __name__=='__main__':main()
