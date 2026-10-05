import {reachSchedule} from './reach-ending.js';
// Display-only choreography. Authored beats, never a stretched animation clock.
// All effects are derived from time: no gameplay RNG, physics or result mutation.
export const LONG_REACH=Object.freeze({seconds:54,attentionAt:17,upperAt:19,upperEnd:24,decisionAt:51.7});
export const REACH_CUTS=Object.freeze([
 {id:'reach',at:0,end:2,label:'リーチ'},
 {id:'arrival',at:2,end:5,label:'月下の対峙'},
 {id:'enemy',at:5,end:10,label:''},
 {id:'dodge',at:10,end:13,label:''},
 {id:'pressure',at:13,end:16.2,label:'押し切られる…！'},
 {id:'silence',at:16.2,end:17,label:''},
 {id:'attention',at:17,end:19,label:''},
 {id:'upper',at:19,end:24,label:''},
 {id:'gather',at:24,end:27,label:'月光が、応える'},
 {id:'counter',at:27,end:33,label:''},
 {id:'clash',at:33,end:36,label:''},
 {id:'surge',at:36,end:39,label:'まだ倒れない！'},
 {id:'rally',at:39,end:43,label:'この月を守る'},
 {id:'vow',at:43,end:45,label:''},
 {id:'final',at:45,end:51.7,label:'月影の一閃'},
 {id:'decision',at:51.7,end:54,label:''}
].map(Object.freeze));
// The contact is separate from anticipation, travel and recovery. Swings take
// ~0.2 s, rather than the previous 3–4 second sine-wave slide out and back.
export const REACH_STRIKES=Object.freeze([
 {id:'block',at:6.4,side:'enemy',weight:.55,x:92,y:70,angle:-.65},
 {id:'second',at:8.6,side:'enemy',weight:.45,x:80,y:71,angle:.4},
 {id:'dodge',at:11.2,side:'enemy',weight:.35,x:83,y:92,angle:-.2,dodge:true},
 {id:'pressure',at:14.6,side:'enemy',weight:.8,x:78,y:76,angle:-.7},
 {id:'hold',at:19.6,side:'enemy',weight:.35,x:80,y:73,angle:-.4},
 {id:'opening',at:22.3,side:'hero',weight:.4,x:112,y:75,angle:.3},
 {id:'counter',at:28.3,side:'hero',weight:.55,x:119,y:73,angle:.5},
 {id:'follow',at:30.5,side:'hero',weight:.65,x:129,y:74,angle:-.45},
 {id:'parry',at:33.8,side:'enemy',weight:.6,x:113,y:72,angle:-.5},
 {id:'surge',at:36.8,side:'enemy',weight:.8,x:86,y:76,angle:.65},
 {id:'return',at:38,side:'hero',weight:.55,x:105,y:74,angle:.4},
 {id:'rush',at:46.1,side:'hero',weight:.55,x:117,y:71,angle:-.4},
 {id:'crescent',at:48.1,side:'hero',weight:.75,x:128,y:69,angle:.5},
 {id:'last',at:50.2,side:'hero',weight:1,x:139,y:70,angle:-.5}
].map(Object.freeze));
// Three authored stories share the result handoff and upper cue window.
// Changing who attacks, dodges and pushes back changes the battle's cause.
const alternate=(changes)=>Object.freeze(REACH_STRIKES.map(e=>Object.freeze({...e,...changes[e.id]})));
// 決意の一閃 has one release. Earlier shots establish danger and accumulate
// resolve; they are not miniature sword swings stretched across the clock.
export const RESOLVE_STRIKE=Object.freeze({id:'resolve',at:50.2,side:'hero',weight:1.3,x:139,y:70,angle:-.5,decisive:true});
export const RESOLVE_CUTS=Object.freeze([
 {id:'reach',at:0,end:2,label:'リーチ'},
 {id:'arrival',at:2,end:5,label:'月下の対峙'},
 {id:'enemy',at:5,end:10,label:''},
 {id:'pressure',at:10,end:16.2,label:''},
 {id:'silence',at:16.2,end:17,label:''},
 {id:'attention',at:17,end:19,label:''},
 {id:'upper',at:19,end:24,label:''},
 {id:'gather',at:24,end:33,label:'この刃に、集え'},
 {id:'surge',at:33,end:39,label:''},
 {id:'rally',at:39,end:43,label:'この一撃に、すべてを'},
 {id:'vow',at:43,end:46,label:''},
 {id:'final',at:46,end:51.7,label:'決意の一閃'},
 {id:'decision',at:51.7,end:54,label:''}
].map(Object.freeze));
export const REACH_SCRIPTS=Object.freeze({
 pressure:Object.freeze({strikes:Object.freeze([RESOLVE_STRIKE]),cuts:RESOLVE_CUTS,labels:{},intro:'enemy',portrait:'hero'}),
 initiative:Object.freeze({strikes:alternate({
  block:{side:'hero',x:119,y:71,angle:.5},second:{side:'hero',x:132,y:72,angle:-.4},
  dodge:{side:'enemy',x:100,y:87,dodge:true},pressure:{side:'enemy',weight:.85},
  hold:{side:'hero',x:114,y:72},opening:{side:'enemy',x:87,y:75},
  counter:{side:'enemy',x:85,y:73},follow:{side:'enemy',x:74,y:72},
  parry:{side:'hero',x:120,y:72},surge:{side:'hero',x:128,y:75},return:{side:'enemy',x:98,y:74}
 }),labels:{arrival:'道を切り拓く',pressure:'一筋縄ではいかない',gather:'隙を、見極めろ',surge:'ここで退けない',rally:'もう一度、前へ'},intro:'hero',portrait:'hero'}),
 exchange:Object.freeze({strikes:alternate({
  second:{side:'hero',x:120,y:71},dodge:{side:'hero',x:129,y:90,dodge:true},
  pressure:{side:'enemy',weight:.6},hold:{side:'enemy',weight:.5},opening:{side:'hero',weight:.55},
  follow:{side:'enemy',x:90,y:73},parry:{side:'hero',x:122,y:72},
  surge:{side:'enemy',weight:.55},return:{side:'hero',weight:.75}
 }),labels:{arrival:'刃が、交わる',pressure:'譲れない想い',gather:'次の一撃を待つ',surge:'まだ終わらない',rally:'この刃に、懸ける'},intro:'wide',portrait:'both'})
});
export const REACH_LABELS=Object.freeze([...new Set([...REACH_CUTS.map(c=>c.label),...RESOLVE_CUTS.map(c=>c.label),...Object.values(REACH_SCRIPTS).flatMap(s=>Object.values(s.labels)), 'まだ、終われない'].filter(Boolean))]);
export const clamp=x=>Math.max(0,Math.min(1,x));
export const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
const out=x=>1-(1-clamp(x))**3;
const mix=(a,b,t)=>a+(b-a)*t;
export function strikePose(t,event){
 const age=t-event.at;
 if(event.decisive){
  // A fast release, a 120ms visual contact hold, then a planted follow-through.
  // The presentation/physical clock continues; only the authored pose holds.
  const anticipation=smooth((age+.65)/.25)*(1-smooth((age+.28)/.28));
  const travel=age<0?smooth((age+.28)/.28):1+.12*smooth((age-.12)/.25);
  const impact=age>=0&&age<.12?1:age>=.12?(1-clamp((age-.12)/.28))**2:0;
  const trail=smooth((age+.17)/.12)*(1-smooth((age-.15)/.50));
  return {event,age,anticipation,travel,impact,trail,active:age>=-.65&&age<1.5};
 }
 // 160ms anticipation, 180ms acceleration, 90ms contact pose, 430ms recovery.
 const anticipation=age>=-.34&&age<-.18?smooth((age+.34)/.16):age>=-.18&&age<0?1-smooth((age+.18)/.18):0;
 const travel=age<-.18?0:age<0?smooth((age+.18)/.18):age<.09?1:1-out((age-.09)/.43);
 const impact=age>=0&&age<.24?(1-age/.24)**2:0;
 const trail=age>=-.16&&age<.23?smooth((age+.16)/.1)*(1-smooth((age-.03)/.2)):0;
 return {event,age,anticipation,travel,impact,trail,active:age>=-.34&&age<.65};
}
export const FLASH_CUTS=Object.freeze([{id:'reach',at:0,end:2,label:'リーチ'},{id:'arrival',at:2,end:4,label:''},{id:'gather',at:4,end:6,label:''},{id:'vow',at:6,end:8,label:''},{id:'final',at:8,end:9.7,label:'月影の一閃'},{id:'decision',at:9.7,end:12,label:''}].map(Object.freeze));
export const FLASH_STRIKES=Object.freeze([{id:'flash',at:8.4,side:'hero',weight:.85,x:124,y:71,angle:-.45}].map(Object.freeze));
export const REVIVAL_STRIKES=Object.freeze([{id:'defeat',at:51.85,side:'enemy',weight:.6,x:78,y:76,angle:-.5},{id:'revival',at:55.25,side:'hero',weight:.9,x:128,y:71,angle:-.45}].map(Object.freeze));
// Long-hair base v4 / motion v7: local source pixels in each 512px cell.
// Keep measurements in pixels so the source/overlay review remains readable.
// Grip means blade root at the guard; it excludes the pommel below the hands.
export const WEAPON_POINTS=Object.freeze([
 [326,315,499,423],[249,112,67,16],[356,269,501,216],
 [179,274,15,425],[229,227,49,160],[185,245,19,320],
 [327,286,496,408],[275,300,479,347],[223,213,81,66],
 [234,186,43,188],[300,337,477,418],[363,231,443,61]
].map(Object.freeze));
export const FRAME_FLOORS=Object.freeze([500,500,500,473,460,474,463,465,465,427,429,424]);
export function actorFrameLayout(frame){
 return {pivotX:.5,pivotY:FRAME_FLOORS[frame]/512,scale:frame<6?1:1.2};
}
export function weaponPose(actor){
 const landmark=frame=>{
  const [gx,gy,tx,ty]=WEAPON_POINTS[frame].map(v=>v/512),layout=actorFrameLayout(frame),scale=100*actor.scale*layout.scale;
  const point=(x,y)=>{const dx=(x-layout.pivotX)*scale,dy=(y-layout.pivotY)*scale,c=Math.cos(actor.rotation),s=Math.sin(actor.rotation);return {x:actor.x+dx*c-dy*s,y:actor.y+dx*s+dy*c};};
  return {grip:point(gx,gy),tip:point(tx,ty)};
 };
 const current=landmark(actor.frame),previous=actor.blendFrame===undefined?current:landmark(actor.blendFrame),u=actor.frameBlend??1;
 const grip={x:mix(previous.grip.x,current.grip.x,u),y:mix(previous.grip.y,current.grip.y,u)},tip={x:mix(previous.tip.x,current.tip.x,u),y:mix(previous.tip.y,current.tip.y,u)};
 return {grip,tip,x:(grip.x+tip.x)/2,y:(grip.y+tip.y)/2,angle:Math.atan2(tip.y-grip.y,tip.x-grip.x)};
}
function actorSequence(age,keys){
 let i=0;while(i+1<keys.length&&age>=keys[i+1][0])i++;
 const frame=keys[i][1],blendFrame=i?keys[i-1][1]:frame,frameBlend=i?smooth((age-keys[i][0])/.035):1;
 return {frame,blendFrame,frameBlend};
}
function segmentContact(a,b){
 const dx=a.tip.x-a.grip.x,dy=a.tip.y-a.grip.y,ex=b.tip.x-b.grip.x,ey=b.tip.y-b.grip.y;
 const denominator=dx*ey-dy*ex;
 if(Math.abs(denominator)>1e-6){
  const qx=b.grip.x-a.grip.x,qy=b.grip.y-a.grip.y,u=(qx*ey-qy*ex)/denominator,v=(qx*dy-qy*dx)/denominator;
  if(u>=0&&u<=1&&v>=0&&v<=1)return {x:a.grip.x+dx*u,y:a.grip.y+dy*u,gap:0};
 }
 const closest=(p,line)=>{const vx=line.tip.x-line.grip.x,vy=line.tip.y-line.grip.y,u=clamp(((p.x-line.grip.x)*vx+(p.y-line.grip.y)*vy)/(vx*vx+vy*vy||1));return {x:line.grip.x+vx*u,y:line.grip.y+vy*u};};
 const pairs=[[a.grip,closest(a.grip,b)],[a.tip,closest(a.tip,b)],[closest(b.grip,a),b.grip],[closest(b.tip,a),b.tip]];
 pairs.sort((p,q)=>Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)-Math.hypot(q[0].x-q[1].x,q[0].y-q[1].y));
 const [p,q]=pairs[0];return {x:(p.x+q.x)/2,y:(p.y+q.y)/2,gap:Math.hypot(p.x-q.x,p.y-q.y)};
}
function alignGuard(hero,enemy,active){
 const a=weaponPose({...hero,frame:2,blendFrame:undefined,frameBlend:1,rotation:0}),b=weaponPose({...enemy,frame:4,blendFrame:undefined,frameBlend:1,rotation:0}),lo=Math.max(Math.min(a.grip.y,a.tip.y),Math.min(b.grip.y,b.tip.y)),hi=Math.min(Math.max(a.grip.y,a.tip.y),Math.max(b.grip.y,b.tip.y));
 if(hi>=lo){
  const y=(lo+hi)/2,at=(w)=>w.grip.x+(w.tip.x-w.grip.x)*(y-w.grip.y)/(w.tip.y-w.grip.y||1),delta=at(a)-at(b);
  // Grounded lateral guard step; no y teleport or game-clock hitstop.
  const limited=Math.max(-30,Math.min(30,delta)),amount=smooth((active.age+.16)/.12)*(1-smooth((active.age-.12)/.20))*smooth((hi-lo)/2);if(active.event.side==='hero')enemy.x+=limited*amount;else hero.x-=limited*amount;
 }
 return segmentContact(weaponPose(hero),weaponPose(enemy));
}
const response=p=>p&&!p.event.dodge?(p.event.decisive?smooth((p.age-.12)/.08)*(1-out((p.age-.28)/.9)):p.age>=.02?smooth((p.age-.02)/.07)*(1-out((p.age-.12)/.48)):0):0;
export function longReachPose(t,{reducedEffects=false,variant='pressure',ending='standard',win,motionFrames=false,upperCueActive=true,contactSample=false}={}){
 const schedule=reachSchedule({reachEnding:ending});
 const script=REACH_SCRIPTS[variant]??REACH_SCRIPTS.pressure;
 const resolve=variant==='pressure'&&ending!=='flash';
 const cuts=ending==='flash'?FLASH_CUTS:script.cuts??REACH_CUTS;
 const cut=cuts.find(c=>t>=c.at&&t<c.end)??cuts.at(-1);
 const u=clamp((t-cut.at)/(cut.end-cut.at)),upper=upperCueActive&&t>=schedule.attentionAt&&t<schedule.upperEnd;
 const defeat=ending==='revival'||win===false;
 const events=ending==='flash'?FLASH_STRIKES:defeat&&!resolve?[...script.strikes,...(ending==='revival'?REVIVAL_STRIKES:REVIVAL_STRIKES.slice(0,1))]:script.strikes;
 const strikes=events.map(e=>strikePose(t,e)).filter(p=>p.active);
 const active=strikes.find(p=>p.travel>0||p.anticipation>0),enemyAttack=active?.event.side==='enemy'?active.travel:0,heroAttack=active?.event.side==='hero'?active.travel:0;
 const impact=strikes.find(p=>p.impact>0&&!p.event.dodge),entry=smooth((t-2)/.6),charge=['gather','vow'].includes(cut.id)?out(u):0;
 const pushed=smooth((t-13.8)/.4)*(1-smooth((t-24)/.4)),returning=smooth((t-27)/.6)*(1-smooth((t-36)/.4));
 const finishing=smooth((t-45)/.3),dodge=active?.event.dodge?Math.sin(Math.PI*active.travel)*13:0;
 let heroFrame=charge>0||['rally','final'].includes(cut.id)?1:0,enemyFrame=3;
 if(heroAttack>.08)heroFrame=2;if(enemyAttack>.08)enemyFrame=4;if(heroAttack>.7&&active.age>=0)enemyFrame=5;
 const anticipation=active?.anticipation??0,anticipationSide=active?.event.side;
 const heroResponse=active?.event.side==='hero'?response(active):0,enemyResponse=active?.event.side==='enemy'?response(active):0;
 const hero={frame:heroFrame,x:57-16*pushed+8*returning+12*finishing+31*heroAttack-10*enemyResponse-(anticipationSide==='hero'?4*anticipation:0),y:112-dodge,scale:.95,alpha:entry,rotation:-.05*enemyResponse};
 const enemy={frame:enemyFrame,x:144-14*pushed+3*returning-34*enemyAttack+7*heroResponse+(anticipationSide==='enemy'?4*anticipation:0),y:111,scale:1.03,alpha:entry,rotation:.1*heroResponse};
 if(motionFrames&&active&&!active.event.dodge){
  const attacking=active.event.side==='hero'?hero:enemy,defending=active.event.side==='hero'?enemy:hero;
  const attackKeys=active.event.side==='hero'?[[-1,heroFrame],[-.34,1],[-.18,6],[-.055,2],[.13,7],[.42,heroFrame]]:[[-1,3],[-.34,3],[-.20,8],[-.12,9],[-.055,4],[.16,8],[.42,3]];
  Object.assign(attacking,actorSequence(active.age,attackKeys));
  Object.assign(defending,actorSequence(active.age,active.event.side==='hero'?[[-.34,3],[-.26,8],[-.15,4],[.12,5],[.40,3]]:[[-.34,0],[-.15,2],[.14,0]]));
  enemy.y+=4*smooth((active.age+.2)/.08)*(1-smooth((active.age-.14)/.2));
 }
 const resolveCharge=resolve?smooth((t-15)/10)*(.25+.75*smooth((t-24)/23))*(1-smooth((t-49.55)/.35)):0;
 const resolveQuiet=resolve?smooth((t-49.05)/.2)*(1-smooth((t-49.92)/.15)):0;
 if(resolve){
  // Threat approaches, but neither actor pecks or shuffles during the charge.
  hero.x=57-9*smooth((t-10)/4)+52*heroAttack-4*anticipation;
  hero.y=112;hero.rotation=0;enemy.x=144-16*smooth((t-5)/8)+9*heroResponse;
  enemy.y=111;enemy.rotation=.12*heroResponse;
  if(!active){
   Object.assign(hero,motionFrames?actorSequence(t,[[0,0],[15,1],[46,6]]):{frame:t>=15?1:0});
   Object.assign(enemy,{frame:3,blendFrame:3,frameBlend:1});
  }else if(motionFrames){
   Object.assign(hero,actorSequence(active.age,[[-1,6],[-.07,2],[.14,7]]));
   Object.assign(enemy,actorSequence(active.age,[[-1,3],[-.22,8],[-.12,4],[.14,5]]));
  }
 }
 // Actual cuts: establishing shot, antagonist closeup, retreat, hero portrait,
 // blade resolve, then both opponents visible for the last exchange.
 let camera={x:105,y:70,scale:1};
 if(cut.id==='arrival')camera={x:105,y:70,scale:1.12-.12*out(u)};
 if(cut.id==='enemy'&&t<6)camera=script.intro==='hero'?{x:hero.x+2,y:60,scale:1.75}:script.intro==='wide'?{x:105,y:70,scale:1.12}:{x:150,y:52,scale:1.75};
 if(cut.id==='dodge')camera={x:100,y:77,scale:1.08};
 if(cut.id==='gather')camera={x:hero.x,y:63,scale:1.25};
 if(cut.id==='rally')camera=script.portrait==='both'?{x:105,y:70,scale:1.15}:{x:hero.x+2,y:60,scale:2.35};
 if(cut.id==='vow')camera={x:hero.x+8,y:36,scale:1.8};
 if(cut.id==='final')camera={x:112,y:70,scale:1.08};
 if(resolve){
  if(cut.id==='gather')camera={x:hero.x+7,y:52,scale:1.45+.1*smooth(u)};
  if(cut.id==='surge')camera={x:105,y:70,scale:1.08};
  if(cut.id==='final')camera=t<49.65?{x:hero.x+8,y:48,scale:1.6}:{x:105,y:70,scale:1.08};
 }
 const kick=impact&&!reducedEffects?(impact.event.side==='hero'?-1:1)*impact.impact*(resolve?2.6:1.8)*impact.event.weight:0;
 camera.x=Math.max(-14+105/camera.scale,Math.min(224-105/camera.scale,camera.x));
 camera.x+=kick;
 const lastTrail=strikes.find(p=>p.trail>0),emission=strikes.find(p=>p.age>=0&&p.age<.6&&!p.event.dodge);
 const sparks=Array.from({length:12},(_,i)=>{
  const e=emission?.event,age=emission?.age??1,angle=(e?.side==='hero'?-.5:Math.PI+.5)+(i*2.39996%1.8)-.9;
  const distance=(12+(i%4)*7)*out(age/.55),gravity=28*age*age;
  return {x:(e?.x??105)+Math.cos(angle)*distance,y:(e?.y??70)+Math.sin(angle)*distance+gravity,angle,alpha:e&&!reducedEffects?(1-clamp(age/.6))**2*(.5+e.weight*.5):0,scale:1-clamp(age/.6)*.7};
 });
 const slash=lastTrail?{x:lastTrail.event.x,y:lastTrail.event.y,alpha:reducedEffects?0:lastTrail.trail*.75,rotation:lastTrail.event.angle,scale:resolve?2.5:.75+lastTrail.event.weight*.6,side:lastTrail.event.side}:{x:105,y:70,alpha:0,rotation:0,scale:1,side:'hero'};
 const pose={time:t,cut:cut.id,variant:REACH_SCRIPTS[variant]?variant:'pressure',label:ending==='flash'?cut.label:script.labels[cut.id]??cut.label,u,upper,visible:t>=2&&t<schedule.decisionAt,hero,enemy,camera,sparks,
  lcdAction:Math.max(enemyAttack,heroAttack,resolveCharge),backdrop:{x:reducedEffects?0:4*Math.sin(t*.18),y:0,scale:1.02},slash,
  impact:{x:impact?.event.x??105,y:impact?.event.y??70,alpha:reducedEffects?0:(impact?.impact??0)*.65,scale:1+(1-(impact?.impact??1))*1.6},
  charge:resolve?resolveCharge:charge,chargePosition:{x:hero.x-16,y:hero.y-77},dim:resolve?(upper?0:.10*resolveCharge+.14*resolveQuiet):cut.id==='rally'?.12:0,
  resolve,resolveQuiet,chargeScale:resolve?.7+resolveCharge*.65:1,
  captionAlpha:Math.min(1,out(u*5),smooth((1-u)*4)),handoff:upperAttentionPose(t,reducedEffects,ending).alpha,arrowY:upperAttentionPose(t,reducedEffects,ending).y,
  wind:reducedEffects?0:resolve?(1+resolveCharge*.65)*(1-resolveQuiet):1,atmosphere:reducedEffects?.08:resolveQuiet>0?.18*(1-resolveQuiet):.18,cutShade:t>=2&&t<schedule.decisionAt&&!(t>=schedule.attentionAt&&t<schedule.upperEnd)?(1-out((t-cut.at)/.14))*.35:0,
 };
 if(defeat&&ending!=='flash'&&t>=51.7&&t<(ending==='revival'?55.7:54)){
  const fallen=smooth((t-51.7)/.35)*(1-smooth((t-54.4)/.45));
  const rise=smooth((t-54.4)/.45),strike=strikePose(t,{at:55.25,side:'hero',weight:.9,x:128,y:71,angle:-.45});
  pose.visible=true;pose.cut=t<53.3?'defeat':t<54?'silence':t<54.85?'revive':'return';
  pose.label=t>=54&&t<54.85?'まだ、終われない':'';pose.captionAlpha=1;
  pose.hero={...pose.hero,frame:rise>.8?2:t>=54?1:0,x:resolve?mix(106.24,64,smooth((t-51.7)/.35)):64+34*strike.travel,y:112+14*fallen,rotation:-.24*fallen,alpha:1};
  if(motionFrames){
   const keys=resolve?[[51.69,7],[51.95,10],[54.12,11],[54.55,1]]:[[51.69,1],[51.7,7],[51.95,10],[54.12,11],[54.55,1],[55.07,6],[55.20,2]];
   Object.assign(pose.hero,actorSequence(t,keys));pose.hero.y=112;pose.hero.rotation=0;
  }
  if(t>=53.3)pose.enemy={...pose.enemy,x:144+7*strike.travel,frame:strike.impact>0?5:3,alpha:1};
  pose.camera={x:105,y:70,scale:1};pose.dim=t<54?.2:0;pose.cutShade=0;
  pose.charge=t>=54&&t<55.1?smooth((t-54)/.3)*(1-smooth((t-54.85)/.25)):0;
  pose.chargePosition={x:pose.hero.x-16,y:pose.hero.y-77};
  if(t>=54.85&&!resolve){pose.slash={x:128,y:71,alpha:reducedEffects?0:strike.trail*.85,rotation:-.45,scale:1.3,side:'hero'};
   pose.impact={x:128,y:71,alpha:reducedEffects?0:strike.impact*.65,scale:1.3};}
  // Revival reignites the energy remaining on the blade, not another jab.
  if(resolve&&t>=54){pose.charge=smooth((t-54)/.4);pose.chargeScale=1+1.2*smooth((t-54.5)/.8);pose.lcdAction=pose.charge;}
  pose.lcdAction=Math.max(pose.lcdAction,strike.travel);pose.wind=t<54?0:reducedEffects?0:1;
 }
 const guard=motionFrames&&active&&!active.event.dodge&&active.age<.4&&!(defeat&&t>=51.7);
 const contact=guard?alignGuard(pose.hero,pose.enemy,active):null;
 pose.contact=contact?{...contact,kind:'blade'}:null;
 // Recovering swords must not drag contact particles across the screen.
 const anchor=motionFrames&&emission&&!contactSample?longReachPose(emission.event.at,{reducedEffects,variant,ending,win,motionFrames,upperCueActive,contactSample:true}).contact:null;
 const hitContact=anchor??contact;
 // Resolve blade-local light after every actor override (including revival).
 const weapon=weaponPose(pose.slash.side==='enemy'?pose.enemy:pose.hero);
 pose.slash={...pose.slash,x:weapon.x,y:weapon.y,rotation:weapon.angle};
 const charged=weaponPose(pose.hero);pose.chargePosition={x:charged.x,y:charged.y};
 if(impact){const blade=weaponPose(impact.event.side==='hero'?pose.hero:pose.enemy);pose.impact.x=hitContact?.x??blade.tip.x;pose.impact.y=hitContact?.y??blade.tip.y;if(hitContact&&hitContact.gap>1.5)pose.impact.alpha=0;}
 if(emission){const blade=weaponPose(emission.event.side==='hero'?pose.hero:pose.enemy);for(const spark of pose.sparks){spark.x+=(hitContact?.x??blade.tip.x)-emission.event.x;spark.y+=(hitContact?.y??blade.tip.y)-emission.event.y;if(hitContact&&hitContact.gap>1.5)spark.alpha=0;}}
 if(!upperCueActive){pose.handoff=0;pose.arrowY=16;}
 return pose;
}
export function upperReachPose(presentation){
 const t=presentation?.time??-1,schedule=reachSchedule(presentation);
 if((presentation?.displayRoute&&!presentation.moonCue)||!presentation?.longReach||t<schedule.upperAt||t>=schedule.upperEnd)return {active:false,phase:'rest',angle:0,progress:0};
 const age=t-schedule.upperAt,progress=clamp((age-.5)/3.5);
 const angle=age<4?Math.PI*2*smooth(progress):Math.PI*2+.025*Math.sin((age-4)*Math.PI*2)*(1-(age-4));
 return {active:true,phase:age<.5?'prepare':age<4?'spin':'settle',angle,progress};
}
// A four-second cue overlays uninterrupted LCD action. Reduced motion retains
// the cue, with no bouncing. Selected board/LCD view never moves automatically.
export function upperAttentionPose(t,reducedEffects=false,ending='standard'){
 const age=t-reachSchedule({reachEnding:ending}).attentionAt,visible=age>=0&&age<4;
 return {visible,alpha:visible?smooth(age/.2)*(1-smooth((age-3.6)/.4)):0,
  y:16-(visible&&!reducedEffects?4*Math.abs(Math.sin(age*Math.PI*2)):0)};
}
export function attentionCamera(){return 0;}
