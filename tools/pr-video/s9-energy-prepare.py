"""Prepare V3 actual-game comparisons and reuse unchanged approved speech."""
import hashlib,json,shutil,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];E=ROOT/'prototype/reference-review/s9-20261018'
OUT=E/'pr-video-v3';PUBLIC=OUT/'public';PUBLIC.mkdir(parents=True,exist_ok=True)
if (OUT/'media-receipt.json').exists():raise RuntimeError('Fresh output required')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def ff(*args):subprocess.run(['ffmpeg','-v','error','-nostdin','-y',*map(str,args)],check=True)
rows=[];samples=[]
for side,folder in [('before','intro-baseline020'),('after','intro-fixed')]:
    directory=E/'runtime/energy-v3'/folder;source=directory/'1440-natural.webm';record=json.loads((directory/'1440-natural.json').read_text());dest=PUBLIC/f'intro-{side}.mp4'
    assert not record['errors']
    ff('-i',source,'-t','7.5','-vf','scale=1000:760:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=1000:760:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30','-c:v','libx264','-crf','25','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k',dest)
    rows.append({'id':f'intro-{side}','source':str(source.relative_to(ROOT)),'sourceSHA256':sha(source),'seconds':7.5,'speed':1,'loopSourceStartsInFullRecording':len(record['starts']),'sha256':sha(dest),'note':'Actual natural intro; first7.5s. Before02054e8 vs V3 with playback fix; both music composition and control differ. Separate V3-before-fix audio isolates control diagnosis.'})
    samples.append({'id':f'intro-{side}','file':dest.name,'frames':225,'title':f'{"変更前" if side=="before" else "変更後"}：全体→盤面→液晶の導入','detail':'曲頭への戻しを修正し、通常まで連続再生' if side=='after' else '導入中に曲頭へ戻り続ける症状'})
labels={'normal':'通常・入賞とリール','battle':'戦闘の静けさから一撃','bonus':'BONUS','rush':'RUSH'}
for case in ['normal','battle','bonus','rush']:
 for side in ['before','after']:
    folder=E/'runtime/energy-v3'/f'scene-{side}-v1';source=folder/f'{case}.webm';r=json.loads((folder/f'{case}.json').read_text());w=r['windowProposal'];seconds=w['duration'];dest=PUBLIC/f'{case}-{side}.mp4'
    assert r['sourceUnchanged'] and not r['errors']
    ff('-ss',w['start'],'-i',source,'-t',seconds,'-vf','scale=1000:760:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=1000:760:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30','-c:v','libx264','-crf','25','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',dest)
    rows.append({'id':f'{case}-{side}','source':str(source.relative_to(ROOT)),'sourceSHA256':sha(source),'startWallSeconds':w['start'],'seconds':seconds,'speed':1,'settings':r['settings'],'fixture':r['fixture'],'window':w,'sha256':sha(dest),'note':'Real canvas and AudioContext; same settings, observed clock alignment, not exact trajectories or a natural outcome trial.'})
    samples.append({'id':f'{case}-{side}','file':dest.name,'frames':round(seconds*30),'title':f'{"変更前" if side=="before" else "変更後"}：{labels[case]}','detail':('通常発射での物理入賞から12秒／全盤表示' if case=='normal' else '同じ表示時計48.5秒付近から各6秒' if case=='battle' else '同じ体験UI・録画9秒から各4秒')})
manifest=json.loads((E/'audio-v3/manifest.json').read_text());item=next(i for i in manifest['items'] if i['id']=='se-decisiveHit')
for side,relative in [('before',item['baselinePath']),('after','se/decisiveHit-v0.wav')]:
    source=E/'audio-v3'/relative;source=source.with_suffix('.wav');dest=PUBLIC/f'se-{side}.mp4';gain=item['auditionGain']['baseline' if side=='before' else 'candidate']
    ff('-i',source,'-filter_complex',f'[0:a]volume={gain},apad=whole_dur=2,asplit=2[a][wave];[wave]showwaves=s=1000x760:mode=line:colors=0xeed099:rate=30,format=yuv420p[v]','-map','[v]','-map','[a]','-t','2','-c:v','libx264','-crf','25','-c:a','aac','-b:a','160k',dest)
    rows.append({'id':f'se-{side}','source':str(source.relative_to(ROOT)),'sourceSHA256':sha(source),'seconds':2,'speed':1,'auditionGain':gain,'sha256':sha(dest),'note':'Synthetic source with waveform; loudness matched by attenuation only, padded to2s; not a game capture.'})
    samples.append({'id':f'se-{side}','file':dest.name,'frames':60,'title':f'{"変更前" if side=="before" else "変更後"}：一撃SEの単体比較','detail':'入口・本体・収束を同音量で比較'})
stills={}
for case in ['normal','battle','rush']:
    dest=PUBLIC/f'{case}-still.png';ff('-ss',1,'-i',PUBLIC/f'{case}-after.mp4','-frames:v',1,dest);stills[case]=dest.name
settings=E/'runtime/energy-v3/intro-fixed-existing-s9-browser/1440-settings.png'
if not settings.exists():raise RuntimeError('Current settings browser screenshot missing')
shutil.copyfile(settings,PUBLIC/'settings.png');stills['settings']='settings.png'
timeline=json.loads((E/'pr-video/public/audio/timeline.json').read_text());(PUBLIC/'audio').mkdir(exist_ok=True)
approved=json.loads((ROOT/'docs/agile/s9-video/script.json').read_text());speech=[]
approval=json.loads((ROOT/'docs/agile/s9-video/.script.md.yukkuri-review.json').read_text());assert approval['status']=='APPROVED'
assert sha(ROOT/'docs/agile/s9-video/script.json')==approval['script_sha256']
assert sha(ROOT/'docs/agile/s9-video/script.md')==approval['script_markdown_sha256']
for c in timeline['clips'][2:]:
    a=next(l for l in approved['lines'] if l['id']==c['id']);assert a['text']==c['text']
    source=E/'pr-video/public/audio'/c['audio_file'];dest=PUBLIC/'audio'/c['audio_file'];shutil.copyfile(source,dest);speech.append({'id':c['id'],'source':str(source.relative_to(ROOT)),'sha256':sha(source),'destinationSHA256':sha(dest),'durationFrames':c['duration_frames'],'originalStartFrame':c['start_frame']})
(PUBLIC/'media.json').write_text(json.dumps({'ready':True,'timeline':timeline,'samples':samples,'stills':stills},ensure_ascii=False,indent=2)+'\n')
(OUT/'media-receipt.json').write_text(json.dumps({'clips':rows,'speech':speech,'settingsSource':{'path':str(settings.relative_to(ROOT)),'sha256':sha(settings)},'narration':'Existing approved paragraphs3–7, unchanged WAV/text/order and canonical block lengths. No new speech or TTS; first2 paragraphs do not describe the new baseline and are omitted.','approvalRecordSHA256':sha(ROOT/'docs/agile/s9-video/.script.md.yukkuri-review.json'),'fixtures':'Authored outcome/experience footage; normal admissions use actual firing/solver. No natural lottery or identical trajectory claim.','humanListening':'unverified'},ensure_ascii=False,indent=2)+'\n')
print('Prepared12 comparisons, current stills and5 unchanged approved paragraphs')
