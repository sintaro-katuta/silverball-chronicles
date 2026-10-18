import {RESOLVE_CUTS} from '../pixi/long-reach-timeline.js';
import {reachAudioCues} from '../pixi/se/presentation-cues.js';
import {reachSchedule} from '../pixi/reach-ending.js';
import {musicPose,presentationSilenceWindows} from '../pixi/se/music-player.js';
import {cabinetLightPose,cabinetSwordPose} from '../pixi/cabinet-light-motion.js';

const files=import.meta.glob('/reference-review/s9-20261018/audio-v1/**/*.mp3',{query:'?url',import:'default',eager:true});
const manifests=import.meta.glob('/reference-review/s9-20261018/audio-v1/manifest.json',{import:'default',eager:true});
const manifest=Object.values(manifests)[0];
const el=id=>document.getElementById(id),players=[el('baseline'),el('candidate')];
let auditionGain={baseline:1,candidate:1};
const music={normal:'通常 · 月夜の旋律',battle:'戦闘 · 決意の一閃',bonus:'BONUS · 報酬の高揚',rush:'RUSH · 連続する挑戦'};
const effects={development:'リーチ発展',pushPrompt:'PUSH表示',pushPress:'PUSH押下',heroHit:'通常斬撃',decisiveHit:'決着の一撃',revival:'復活',bonusStart:'BONUS開始',rushStart:'RUSH突入'};
const names={...music,...effects,win:'当たり確定（維持）',rushWin:'RUSH当たり確定（維持）',loss:'敗北（維持）',silence:'無音',reach:'リーチ入口',arrival:'対峙',enemy:'敵の圧力',pressure:'劣勢',attention:'上部案内',upperSword:'上部剣',moon:'月',gather:'溜め',surge:'反撃への力',rally:'決意',vow:'構え',final:'一撃の前段'};
const cutLabels={reach:'リーチ',arrival:'月下の対峙',enemy:'敵の攻撃',pressure:'劣勢からの構え',silence:'静けさ',attention:'上部へ視線を誘導',upper:'上部の剣と月',gather:'月光を集める',surge:'力を高める',rally:'決意',vow:'一撃への構え',final:'決意の一閃',decision:'当落の表示'};
const stop=()=>players.forEach(p=>{p.pause();p.currentTime=0;});
const path=relative=>files['/reference-review/s9-20261018/audio-v1/'+relative];
function setSource(id,relative){
  const player=el(id),download=el(id+'-download'),url=path(relative);
  if(url){player.src=url;download.href=url;download.hidden=false;}else{player.removeAttribute('src');player.load();download.removeAttribute('href');download.hidden=true;}
  return !!url;
}
function chooseSound(){
  stop();const kind=el('kind').value,name=el('sound').value,isMusic=kind==='music';
  auditionGain=manifest?.items?.find(item=>item.id===kind+'-'+name)?.auditionGain??{baseline:1,candidate:1};
  for(const p of players)p.volume=Number(el('volume').value)*Math.max(0,Math.min(1,auditionGain[p.id]??1));
  const a=setSource('baseline',isMusic?'baseline/pad.mp3':'baseline/'+name+'.mp3');
  const b=setSource('candidate',isMusic?'music/'+name+'.mp3':'se/'+name+'-v0.mp3');
  el('baseline-description').textContent=isMusic?'旧版の背景パッド素材。旋律のあるBGMではなく、本編の音量・フィルターを通す前の素材です。':name==='bonusStart'?'旧版のCHARGE音。新しいBONUS開始音と役割が近い比較用で、以前から同じイベントに割り当てられていた音ではありません。':'変更前の同じ用途・音型1の音です。音源単体を比較します。';
  el('candidate-description').textContent=names[name]+(isMusic?'。新作BGMの一巡分です。本編では切替・反復・効果音に合わせた音量調整を行います。':'。新作の音型1です。本編の打点と音量は時間表・通しプレイで確認します。');
  el('status').textContent=a&&b?'基準と候補を一つずつ再生できます。':'この用途の音源は制作中です。出力後にページを読み直してください。';
}
function chooseKind(){
  const source=el('kind').value==='music'?music:effects;el('sound').replaceChildren();
  for(const [value,label]of Object.entries(source))el('sound').append(new Option(label,value));
  chooseSound();
}
for(const player of players){
  player.volume=Number(el('volume').value);
  player.addEventListener('play',()=>{for(const other of players)if(other!==player)other.pause();el('status').textContent=(player.id==='baseline'?'基準':'候補')+'を再生中です。';});
  player.addEventListener('ended',()=>{el('status').textContent='最後まで再生しました。';});
  player.addEventListener('error',()=>{el('status').textContent='音源を読み込めませんでした。再生成と配信先を確認してください。';});
}
el('kind').addEventListener('change',chooseKind);el('sound').addEventListener('change',chooseSound);el('stop').addEventListener('click',stop);
el('volume').addEventListener('input',()=>{for(const p of players)p.volume=Number(el('volume').value)*Math.max(0,Math.min(1,auditionGain[p.id]??1));});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',stop);chooseKind();

function fixture(time=0){
  const ending=el('ending').value,p={longReach:true,reachVariant:'pressure',reachEnding:ending==='revival'?'revival':'standard',presentationMode:'normal',displayRoute:'battle',drawId:1,time,moonCue:true,win:ending!=='loss'};
  return {time,phase:'playing',presentation:p};
}
let rows=[];
const musicDescription=pose=>pose.silent?'意図した無音':music[pose.name]??'停止';
function lightDescription(game){
  const light=cabinetLightPose(game),sword=cabinetSwordPose(game);
  const phase={normal:'通常光',reach:'リーチ光',upper:'上部演出',win:'確定光',entry:'突入光',payout:'払出光',rush:'RUSH光'}[light.phase]??light.phase;
  return phase+(light.rainbow?'・虹色':'・確定前の色')+' / 剣 '+sword.phase;
}
function rebuildTimeline(){
  const g=fixture(),p=g.presentation,schedule=reachSchedule(p),end=schedule.seconds;
  el('time').max=String(end);el('time').value=String(Math.min(Number(el('time').value),end));
  const cues=reachAudioCues(p,{pushAvailable:true});
  const boundaries=[...new Set([0,end,...RESOLVE_CUTS.flatMap(c=>[c.at,c.end]),...cues.map(c=>c.at),...presentationSilenceWindows(p).flatMap(w=>[w.start,w.end])])].filter(t=>t<=end).sort((a,b)=>a-b);
  const body=el('timeline');body.replaceChildren();rows=[];
  for(let i=0;i<boundaries.length-1;i++){
    const at=boundaries[i],to=boundaries[i+1],cut=RESOLVE_CUTS.find(c=>at>=c.at&&at<c.end),row=document.createElement('tr');
    const point=fixture(at+.001),values=[at.toFixed(2)+'–'+to.toFixed(2)+'秒',cut?(cut.label||cutLabels[cut.id]||cut.id):'復活・決着',musicDescription(musicPose(point)),cues.filter(c=>c.at>=at&&c.at<to).map(c=>(names[c.name]??c.name)+' @ '+c.at.toFixed(2)).join(' / ')||'—',lightDescription(point)];
    for(const value of values){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}
    const cell=document.createElement('td'),button=document.createElement('button');button.type='button';button.textContent='時刻を選ぶ';button.addEventListener('click',()=>{el('time').value=String(at);updateTime(true);});cell.append(button);row.append(cell);body.append(row);rows.push({at,to,row});
  }
  updateTime(false);
}
function updateTime(syncPreview){
  const t=Number(el('time').value),pose=musicPose(fixture(t));el('time-value').value=t.toFixed(2)+'秒';
  for(const {at,to,row}of rows)row.classList.toggle('active',t>=at&&t<to);
  el('pose-status').textContent=t.toFixed(2)+'秒 · '+musicDescription(pose)+' · '+lightDescription(fixture(t))+'。表の時刻は本編の表示時計です。';
  if(syncPreview&&!el('preview').hidden){const api=el('preview').contentWindow?.__reachComparison;if(api){api.setPlaying(false);api.setVariant('pressure');api.setEnding(el('ending').value==='revival'?'revival':'standard');api.seek(t);if(t>=reachSchedule(fixture(t).presentation).decisionAt-.1)el('pose-status').textContent+=' 比較映像は決着直前までです。この区間は本編で確認します。';}}
}
el('time').addEventListener('input',()=>updateTime(true));el('ending').addEventListener('change',rebuildTimeline);
el('load-preview').addEventListener('click',()=>{const frame=el('preview');if(!frame.getAttribute('src'))frame.src='/dev/reach-comparison.html';frame.hidden=!frame.hidden;el('load-preview').textContent=frame.hidden?'映像比較も表示':'映像比較を隠す';});
el('preview').addEventListener('load',()=>updateTime(true));
rebuildTimeline();
