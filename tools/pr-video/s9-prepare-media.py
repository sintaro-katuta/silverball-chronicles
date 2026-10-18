"""Prepare equal-speed media excerpts; preserve real capture timing and provenance."""
import hashlib,json,subprocess
from pathlib import Path

root=Path(__file__).resolve().parents[2]
evidence=root/'prototype/reference-review/s9-20261018'
public=evidence/'pr-video/public'
public.mkdir(parents=True,exist_ok=True)
receipt=[]

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def ff(*args): subprocess.run(['ffmpeg','-v','error','-nostdin','-y',*map(str,args)],check=True)
def capture(side,case):
    folder=evidence/('scene-before-v1' if side=='before' else 'scene-after-v2')
    return folder/case, json.loads((folder/(case+'.json')).read_text())
def wall_at(samples,target):
    values=[s for s in samples if s['presentationTime'] is not None]
    for a,b in zip(values,values[1:]):
        if a['presentationTime']<=target<=b['presentationTime']:
            return a['wall']+(target-a['presentationTime'])*(b['wall']-a['wall'])/(b['presentationTime']-a['presentationTime'])
    raise ValueError('Requested display clock absent')
def clip(side,case,name,start,seconds,clock):
    source,data=capture(side,case);source=source.with_suffix('.webm');dest=public/name
    ff('-ss',f'{start:.6f}','-i',source,'-t',seconds,'-vf','scale=960:720:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=960:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30','-c:v','libx264','-crf','24','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',dest)
    receipt.append({'file':name,'source':str(source.relative_to(root)),'sourceSHA256':sha(source),'startWallSeconds':start,'seconds':seconds,'clock':clock,'speed':1,'fixture':data['fixture'],'sha256':sha(dest)})
    return dest

for side in ['before','after']:
    clip(side,'normal',f'sample-normal-{side}.mp4',3,3,'通常待機・録画3秒から3秒')
    _,data=capture(side,'pressure-win');start=wall_at(data['samples'],48.5)
    clip(side,'pressure-win',f'sample-battle-{side}.mp4',start,6,'表示時計48.5秒付近から等速6秒・当たり指定')

clip('after','bonus','sample-bonus-after.mp4',9,3,'大当り体験・録画9秒から3秒')
clip('after','rush','sample-rush-after.mp4',12.7,3,'RUSH体験・録画12.7秒から3秒・BONUSへの切替を含む')
manifest=json.loads((evidence/'audio-v1/manifest.json').read_text())
gains=next(i['auditionGain'] for i in manifest['items'] if i['id']=='se-decisiveHit')
for side,relative in [('before','baseline/decisiveHit.wav'),('after','se/decisiveHit-v0.wav')]:
    source=evidence/'audio-v1'/relative;dest=public/f'sample-se-{side}.mp4';gain=gains['baseline' if side=='before' else 'candidate']
    # Only the 1.55-second effect is heard; the rest is explicitly a silent comparison gap.
    ff('-i',source,'-filter_complex',f'[0:a]volume={gain},apad=whole_dur=3,asplit=2[a][wave];[wave]showwaves=s=960x720:mode=line:colors=0xeed099:rate=30,format=yuv420p[v]','-map','[v]','-map','[a]','-t',3,'-c:v','libx264','-crf','24','-c:a','aac','-b:a','192k','-movflags','+faststart',dest)
    receipt.append({'file':dest.name,'source':str(source.relative_to(root)),'sourceSHA256':sha(source),'seconds':3,'activeEffectSeconds':1.55,'silentGapSeconds':1.45,'auditionGain':gain,'clock':'単体SE 1.55秒＋比較用の無音1.45秒','speed':1,'sha256':sha(dest)})

for name in ['normal','battle','bonus','rush']:
    source=public/f'sample-{name}-after.mp4';dest=public/f'sample-{name}-after.png'
    ff('-i',source,'-frames:v',1,dest)
data=json.loads((root/'tools/pr-video/s9-data.json').read_text())
for item in data['samples']:
    entry=next(r for r in receipt if r['file']==item['file'])
    item['clockLabel']=entry['clock']
    if item['id']=='rush-after':item['detail']='RUSHからBONUSへの実音の切替（当たり後）'
    if item['id'].startswith('se-'):item['detail']='単体一撃音1.55秒＋比較用無音1.45秒'
data['mediaReady']=True
(root/'tools/pr-video/s9-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(evidence/'pr-video/media-receipt.json').write_text(json.dumps({'sources':'Actual canvas and Web Audio captures; authored outcomes, not natural odds trials','alignment':'Battle start interpolated at display time48.5 from100ms real samples; not a frame-exact synchronization guarantee','clips':receipt},ensure_ascii=False,indent=2)+'\n')
print('Prepared',len(receipt),'equal-speed clips and4 actual-frame stills')
