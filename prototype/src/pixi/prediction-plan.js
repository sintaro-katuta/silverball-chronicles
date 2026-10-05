// Original 月影 prediction choreography. These conditional presentation choices
// are not real-machine occurrence rates and never participate in the hit lottery.
import {presentationRoll} from './presentation-distribution.js';

const freeze=value=>{
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  Object.values(value).forEach(freeze);Object.freeze(value);
 }
 return value;
};
export const RUSH_PREDICTION_FAMILIES=freeze([
 {family:'hold',text:'保留の兆し',role:'hold'},
 {family:'trail',text:'影が、追ってくる',role:'route'},
 {family:'approach',text:'気配が近づく',role:'tenpai'},
 {family:'alert',text:'街に走る異変',role:'expectation'},
 {family:'search',text:'影を追え',role:'route'},
 {family:'resolve',text:'ここは、通さない',role:'tenpai'},
 {family:'moon',text:'月が呼んでいる',role:'expectation'},
 {family:'awakening',text:'刃に宿る決意',role:'route'},
 {family:'crest',text:'紋章が、目を覚ます',role:'expectation'},
 {family:'identity',text:'この刃を継ぐ理由',role:'expectation'},
 {family:'pursuit',text:'その影を逃すな',role:'route'},
 {family:'seal',text:'二重月輪',role:'confirmed',confirmed:true},
]);
export const NORMAL_PREDICTION_FAMILIES=freeze([
 {family:'serial',text:'まだ、終わらない',role:'continuation'},
 {family:'story',text:'守ると決めたあの日',role:'story'},
 {family:'step',text:'その気配は、近い',role:'step'},
 {family:'background',text:'月影に染まる街',role:'background'},
 {family:'route',text:'この先に、待つもの',role:'route'},
]);
const BEFORE={
 normal:[['serial','まだ、終わらない'],['story','守ると決めたあの日'],['step','その気配は、近い'],['background','月影に染まる街'],['route','この先に、待つもの']],
 rush:RUSH_PREDICTION_FAMILIES.filter(c=>c.role!=='hold'&&!c.confirmed).map(c=>[c.family,c.text]),
};
const BATTLE={exchange:['battleSP','月下の攻防'],initiative:['episode','守り抜く約束'],pressure:['climax','決意の一閃']};
const DEVELOPMENT={character:'その声を、信じて',long:'影の向こうへ',directbattle:'月下の決戦'};
const STAGED={serial:['まだ、終わらない','もう一度','まだ、終わらない'],story:['あの日の約束','守ると決めたあの日','今、この刃に'],step:['気配','接近','その気配は、近い']};
const CHANCE_PHRASES={normal:['退けない理由がある','この刃は、折れない','最後まで、信じる'],rush:['追いついてみせる','迷いを、断ち切れ','この一撃に賭ける']};
export const PREDICTION_LABELS=freeze([...new Set([
 ...RUSH_PREDICTION_FAMILIES.map(c=>c.text),...NORMAL_PREDICTION_FAMILIES.map(c=>c.text),
 ...Object.values(STAGED).flat(),...Object.values(DEVELOPMENT),...Object.values(BATTLE).map(v=>v[1]),
 ...Object.values(CHANCE_PHRASES).flat(),'闇の向こうに、誰かいる',
])]);

/** Queue and active draw share this cue, independently of anti-repeat battle
 * selection. Its low false-positive rates are original design choices. */
export function holdPredictionCue({drawId,mode='normal',win}){
 if(mode!=='normal'&&mode!=='rush')throw new RangeError('mode must be normal or rush');
 if(typeof win!=='boolean')throw new TypeError('win must be the saved boolean outcome');
 const appearance=presentationRoll(drawId,mode,80),strength=presentationRoll(drawId,mode,81);
 if(appearance>=(win?.55:.04))return 'none';
 const gold=win?.30:mode==='normal'?.00075:.005;
 const red=win?.65:mode==='normal'?.0095:.055;
 return strength<gold?'gold':strength<red?'red':'blue';
}

/** Invoke once at admission, alongside the already selected presentation plan.
 * Independent hash channels leave route/moon/premium weights unchanged. The
 * returned descriptors can be stored on a hold without touching gameplay RNG.
 */
export function createPredictionPlan({drawId,mode='normal',win,plan}){
 if(mode!=='normal'&&mode!=='rush')throw new RangeError('mode must be normal or rush');
 if(typeof win!=='boolean')throw new TypeError('win must be the saved boolean outcome');
 if(!plan||!['ordinary','basic','battle','direct','flash'].includes(plan.route))throw new RangeError('A selected presentation plan is required');
 if(plan.route==='battle'&&!Object.hasOwn(BATTLE,plan.variant))throw new RangeError('Unknown battle variant');
 if(!win&&(plan.premium||plan.ending==='revival'||plan.route==='direct'||plan.route==='flash'))throw new RangeError('Confirmed presentation requires a saved win');
 const roll=channel=>presentationRoll(drawId,mode,40+channel);
 const developed=plan.route==='battle';
 // High-tier signals are optional on wins and possible on losses. An ordinary
 // miss stays quiet; a losing developed reach can still build strong expectation.
 const strength=roll(0);
 let tier='blue';
 if(developed){tier=strength<(win?.30:.015)?'gold':strength<(win?.65:.075)?'red':'blue';}
 else if(plan.route==='basic'){tier=strength<(win?.12:.01)?'red':'blue';}
 const holdCue=holdPredictionCue({drawId,mode,win});
 const beforeChance=developed?.92:plan.route==='basic'?.50:plan.route==='ordinary'?.075:0;
 const before=BEFORE[mode][Math.floor(roll(2)*BEFORE[mode].length)];
 const beforeCue=roll(3)<beforeChance?{family:before[0],text:before[1],tier,start:mode==='normal'?.42:.10,end:mode==='normal'?1.85:.58,steps:STAGED[before[0]]??null}:null;
 // This overlays the opening scene; it adds no time to 54/58-second timelines.
 const precursorSeconds=developed?(mode==='normal'?5:2):0;
 // Keep the adopted reel-only reach alongside optional character/long scenes.
 const basicRoll=roll(4);
 const basicFamily=plan.route==='basic'?(basicRoll<.35?null:basicRoll<.675?'character':'long'):null;
 const basicPrelude=basicFamily?{family:basicFamily,text:DEVELOPMENT[basicFamily],tier,start:.5,end:mode==='normal'?3:2.4}:null;
 const specialEntrance=developed&&roll(9)<.06;
 const family=developed?(specialEntrance?'special':['character','long','directbattle'][Math.floor(roll(4)*3)]):null;
 const battleFamily=developed?BATTLE[plan.variant][0]:null;
 const development=developed?{family,text:specialEntrance?'闇の向こうに、誰かいる':DEVELOPMENT[family],tier,title:BATTLE[plan.variant][1]}:null;
 const chanceUps=[];
 if(developed){
  const phrases=CHANCE_PHRASES[mode];
  [8.2,28.1,40.6].forEach((time,index)=>{
   if(roll(5+index)<(win?.72:.38))chanceUps.push({family:['title','dialogue','resolve'][index],text:phrases[index],tier:index===0?'blue':tier,start:time,end:time+1.75});
  });
 }
 return freeze({drawId,mode,route:plan.route,holdCue,beforeCue,development,basicFamily,basicPrelude,battleFamily,chanceUps,precursorSeconds,
  // Late-result categories are metadata only: they must never identify a revival
  // before the ordinary shared defeat, or expose a premium before its reveal.
  resultFamily:plan.premium&&roll(10)<1/3?'fullrotation':plan.ending==='revival'?'special':null});
}

/** A stateless pose sampler: age is spin time or total developed-reach time.
 * It does not advance state, change the selected result, or replay an event.
 */
export function predictionPose(plan,age,{phase='spin'}={}){
 if(!plan||!Number.isFinite(age))throw new TypeError('Prediction plan and finite age required');
 if(phase!=='spin'&&phase!=='reach')throw new RangeError('phase must be spin or reach');
 const hidden={visible:false,stage:'none',text:'',tier:'blue',family:null,progress:0,precursorSeconds:plan.precursorSeconds};
 if(age<0)return hidden;
 let cue=null,stage='none';
 if(phase==='spin'){cue=plan.beforeCue;stage='before';}
 else if(plan.development&&age<plan.precursorSeconds){
  const split=plan.precursorSeconds*.58;
  cue={...plan.development,text:age<split?plan.development.text:plan.development.title,start:age<split?0:split,end:age<split?split:plan.precursorSeconds};
  stage=age<split?'precursor':'development';
 }else if(plan.basicPrelude){cue=plan.basicPrelude;stage='precursor';}
 else{cue=plan.chanceUps.find(c=>age>=c.start&&age<c.end);stage='chanceUp';}
 if(!cue||age<cue.start||age>=cue.end)return hidden;
 const progress=(age-cue.start)/(cue.end-cue.start);
 const step=cue.steps?Math.min(cue.steps.length-1,Math.floor(progress*cue.steps.length)):0;
 return {visible:true,stage,text:cue.steps?cue.steps[step]:cue.text,tier:cue.tier,family:cue.family,progress,step,precursorSeconds:plan.precursorSeconds};
}
