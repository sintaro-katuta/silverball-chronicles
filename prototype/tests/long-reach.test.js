import test from 'node:test';
import assert from 'node:assert/strict';
import {LONG_REACH,REACH_CUTS,REACH_STRIKES,strikePose,longReachPose,upperReachPose,attentionCamera,upperAttentionPose} from '../src/pixi/long-reach-timeline.js';
import {reachSeconds,mechanismTime} from '../src/pixi/win-sequence.js';
import {cabinetSwordPose,cabinetLightPose} from '../src/pixi/cabinet-light-motion.js';
import {createMoonCueController,MOON_CUES} from '../src/pixi/moon-cue.js';
import {SessionGame} from '../src/domain/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {weaponPose,REACH_SCRIPTS} from '../src/pixi/long-reach-timeline.js';

test('new intermediate poses keep blade crossings and particle origin stable in all three stories',()=>{
 for(const [variant,script] of Object.entries(REACH_SCRIPTS))for(const event of script.strikes.filter(e=>!e.dodge)){
  const p=longReachPose(event.at,{variant,motionFrames:true}),later=longReachPose(event.at+.08,{variant,motionFrames:true});
  assert.ok(p.contact.gap<1e-5,`${variant} ${event.id}`);
  assert.equal(p.hero.frame,2);assert.equal(p.enemy.frame,4);
  assert.ok(Math.abs(p.impact.x-later.impact.x)<1e-5);
  assert.ok(Math.abs(p.impact.y-later.impact.y)<1e-5);
  for(const offset of [-.18,-.12,-.055,.13,.16,.42]){
   const a=longReachPose(event.at+offset-1e-6,{variant,motionFrames:true}),b=longReachPose(event.at+offset+1e-6,{variant,motionFrames:true});
   for(const actor of ['hero','enemy']){
    const pa=weaponPose(a[actor]),pb=weaponPose(b[actor]);
    assert.ok(Math.hypot(pa.tip.x-pb.tip.x,pa.tip.y-pb.tip.y)<.01,`${variant} ${event.id} ${offset} ${actor}`);
   }
  }
 }
});

test('guard alignment never teleports the actors at contact or recovery',()=>{
 for(const [variant,script] of Object.entries(REACH_SCRIPTS))for(const event of script.strikes.filter(e=>!e.dodge)){
  let previous;
  for(let ms=-339;ms<650;ms++){
   const p=longReachPose(event.at+ms/1000,{variant,motionFrames:true});
   if(previous)for(const actor of ['hero','enemy'])assert.ok(Math.hypot(p[actor].x-previous[actor].x,p[actor].y-previous[actor].y)<1,`${variant} ${event.id} ${ms} ${actor}`);
   previous=p;
  }
 }
});

test('new kneeling and rise poses preserve indistinguishable defeat before 54 seconds',()=>{
 for(const variant of ['pressure','initiative','exchange'])for(const t of [51.7,51.9,52.2,53.5,53.999]){
  assert.deepEqual(longReachPose(t,{variant,win:false,motionFrames:true}),longReachPose(t,{variant,win:true,ending:'revival',motionFrames:true}));
 }
 assert.equal(longReachPose(53.5,{win:false,motionFrames:true}).hero.frame,10);
 assert.equal(longReachPose(54.4,{win:true,ending:'revival',motionFrames:true}).hero.frame,11);
});

test('new no-cue records omit upper action and arrows while LCD attacks continue',()=>{
 for(const ending of ['standard','revival','flash']){
  const t=ending==='flash'?4.5:19.6;
  const p=longReachPose(t,{ending,upperCueActive:false,motionFrames:true});
  assert.equal(p.handoff,0);assert.equal(p.upper,false);
  const presentation={longReach:true,time:t,reachEnding:ending,displayRoute:'battle',moonCue:null};
  assert.equal(upperReachPose(presentation).active,false);
  delete presentation.displayRoute;assert.equal(upperReachPose(presentation).active,true);
  if(ending!=='flash')assert.ok(p.lcdAction>0);
 }
});

test('ordinary loss and revival share the complete defeat and silence until the reveal',()=>{
 for(const variant of ['pressure','initiative','exchange'])for(const reducedEffects of [false,true]){
  for(const t of [51.55,51.7,51.85,52.3,53.4,53.999]){
   const loss=longReachPose(t,{variant,reducedEffects,win:false});
   const revival=longReachPose(t,{variant,reducedEffects,ending:'revival',win:true});
   assert.deepEqual(loss,revival,`${variant} ${t}`);
  }
  assert.equal(longReachPose(54,{variant,win:false}).visible,false);
  assert.equal(longReachPose(54.4,{variant,ending:'revival',win:true}).visible,true);
 }
});

test('blade light follows atlas weapon landmarks and recoil starts after contact',()=>{
 for(const [variant,script] of Object.entries(REACH_SCRIPTS))for(const event of script.strikes.filter(e=>!e.dodge)){
  const p=longReachPose(event.at+.03,{variant}),weapon=weaponPose(p.slash.side==='hero'?p.hero:p.enemy);
  assert.equal(p.slash.x,weapon.x);assert.equal(p.slash.y,weapon.y);assert.equal(p.slash.rotation,weapon.angle);
  const before=longReachPose(event.at-.01,{variant}),after=longReachPose(event.at+(event.decisive?.20:.08),{variant});
  const recipient=event.side==='hero'?'enemy':'hero';
  assert.equal(Math.abs(before[recipient].rotation),0);
  assert.notEqual(after[recipient].rotation,0);
 }
});

test('normal and RUSH use 54s with a separate 5s upper window and late win-only mechanism',()=>{
 for(const rush of [false,true])for(const win of [false,true]){
  const p={longReach:true,basicReach:true,win,time:20.5};assert.equal(reachSeconds(p,rush),54);
  assert.ok(longReachPose(p.time).wind>=1);assert.equal(upperReachPose(p).active,true);
  assert.equal(cabinetSwordPose({presentation:p}).phase,'spin');assert.equal(cabinetLightPose({presentation:p}).phase,'upper');
  for(const t of [0,6,16,17,18,24,29,39,51]){p.time=t;assert.equal(upperReachPose(p).active,false);assert.equal(cabinetSwordPose({presentation:p}).angle,0);}
  p.time=51;assert.ok(mechanismTime({presentation:p,rush:rush?{}:null})<0);
  p.time=52;assert.equal(mechanismTime({presentation:p,rush:rush?{}:null}),win?52-LONG_REACH.decisionAt:-1);
 }
 assert.equal(attentionCamera({longReach:true,time:21}),0);assert.equal(attentionCamera({longReach:true,time:26}),0);
 assert.deepEqual(cabinetSwordPose({time:90.5,previewWinAt:90,lastReachWasLong:true}),{phase:'rest',y:0,angle:0});
});

test('moon reveal uses the same stored phase/colour only in the upper window',()=>{
 const c=createMoonCueController(),cue=MOON_CUES.at(-1),game={isWMachine:true,time:0,presentation:{longReach:true,drawId:1,time:6,moonCue:cue}};
 assert.equal(c.render(game,{phase:'rest'}).cueActive,false);
 game.presentation.time=21;assert.equal(c.render(game,{phase:'spin'}).cueActive,true);assert.equal(c.render(game,{phase:'spin'}).color,cue.color);
 game.presentation.time=25;assert.equal(c.render(game,{phase:'rest'}).cueActive,false);
});

test('long reach preserves accepted outcomes, FIFO, pause and physical mechanics without extra lottery calls',()=>{
 for(const mode of ['normal','rush'])for(const win of [false,true]){
  let calls=0;const g=new SessionGame(()=>{calls++;return win?0:.9;});
  const m=createBoardFlow({lcd:true,fire:()=>null});const s=attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true});
  if(mode==='rush'){g.startRush();m.setMode('rush');}
  g.hit({id:'first'},mode==='rush'?'fuzu':'start');g.hit({id:'second'},mode==='rush'?'fuzu':'start');
  const start=g.startSpin.bind(g);g.startSpin=record=>{start(record);g.spinResult={...g.spinResult,reach:true,reels:win?[7,7,7]:[7,7,8]};};
  for(let n=0;n<1200&&!g.presentation;n++)m.flow.step(1/120);
  assert.ok(g.presentation.longReach);assert.equal(g.presentation.win,win);
  const bank=g.w.queues[mode==='rush'?'fuzu':'tokuzu1'],next=bank[0],rolls=calls,serial=g.w.serial,total=g.total;
  for(let n=0;n<21*120;n++)m.flow.step(1/120);
  assert.ok(g.presentation);assert.equal(s.snapshot().reach.stage,'upper');assert.equal(bank[0],next);assert.equal(g.total,total);assert.equal(calls,rolls);assert.equal(g.w.serial,serial);
  m.flow.pause(true);const before=s.snapshot();m.flow.step(1);assert.deepEqual(s.snapshot(),before);m.flow.pause(false);
  for(let n=0;n<60*120&&g.presentation;n++)m.flow.step(1/120);
  assert.equal(g.presentation,null);assert.equal(g.lastDraw,win);assert.equal(calls,rolls);assert.equal(bank[0],next);
  if(mode==='rush'){assert.equal(g.w.rush.remaining,129);assert.equal(g.w.electricOpen,win);assert.equal(g.jackpot,null);}
  else assert.equal(!!g.jackpot,win);
  assert.equal(g.accounting.reconciled,true);
 }
});

test('authored exchanges accelerate in 180ms, recover quickly and change framing instead of stretching playback',()=>{
 assert.ok(LONG_REACH.seconds<60);assert.equal(LONG_REACH.upperEnd-LONG_REACH.upperAt,5);
 assert.ok(REACH_CUTS.length>=12);assert.equal(REACH_CUTS.at(-1).end,LONG_REACH.seconds);
 for(const e of REACH_STRIKES){
  assert.equal(strikePose(e.at-.181,e).travel,0);assert.equal(strikePose(e.at,e).travel,1);
  assert.equal(strikePose(e.at+.521,e).travel,0);
  assert.equal(strikePose(e.at-.01,e).impact,0);assert.ok(strikePose(e.at,e).impact>0);
 }
 assert.notDeepEqual(longReachPose(5.5,{variant:'exchange'}).camera,longReachPose(7,{variant:'exchange'}).camera);
 assert.ok(longReachPose(40).camera.scale>2);
 for(const t of [19,20,21,22,23,23.9]){
  const p=longReachPose(t,{variant:'exchange'});assert.equal(p.wind,1);assert.equal(p.dim,0);assert.equal(p.label,'');
 }
 assert.ok(longReachPose(19.6).lcdAction>0);assert.ok(longReachPose(22.3).lcdAction>0);
 assert.ok(longReachPose(19.6,{variant:'exchange'}).sparks.some(q=>q.alpha>0));
 assert.notDeepEqual(longReachPose(19.6,{variant:'exchange'}).hero,longReachPose(20,{variant:'exchange'}).hero);
 assert.equal(upperAttentionPose(16).visible,false);assert.equal(upperAttentionPose(21).visible,false);
 assert.notEqual(upperAttentionPose(18).y,upperAttentionPose(18.125).y);
 assert.equal(upperAttentionPose(18.125,true).y,16);
 const impact=longReachPose(28.3,{variant:'exchange'}),reduced=longReachPose(28.3,{variant:'exchange',reducedEffects:true});
 assert.ok(impact.impact.alpha>0);assert.equal(reduced.impact.alpha,0);assert.ok(reduced.sparks.every(q=>q.alpha===0));
 assert.deepEqual(impact.hero,reduced.hero);assert.equal(impact.cut,reduced.cut);
});


test('pressure gather adds smooth bounded focus without extending captions or leaking the result',async()=>{
 const {gatherFocus}=await import('../src/pixi/long-reach-timeline.js');
 for(const t of [0,23.99,24,33,33.01,54])assert.equal(gatherFocus(t),0);
 for(const t of [24.8,25.3,29.5,32.2])assert.equal(gatherFocus(t),1);
 for(const edge of [24,24.8,32.2,33]){
  const a=gatherFocus(edge-1e-5),b=gatherFocus(edge+1e-5);
  assert.ok(Math.abs(a-b)<1e-7,'only the additional correction is smooth at its envelope boundaries');
 }
 for(const t of [24,24.4,25.3,29.5,32.6,33]){
  for(const ending of ['standard','revival']){
   const lose=longReachPose(t,{ending,win:false,motionFrames:true}),win=longReachPose(t,{ending,win:true,motionFrames:true});
   assert.deepEqual(lose,win);assert.equal(lose.captionBackdropAlpha,.22*gatherFocus(t));
   assert.ok(lose.captionBackdropAlpha>=0&&lose.captionBackdropAlpha<=.22);
   if(t<33)assert.equal(lose.label,'この刃に、集え');
  }
  for(const variant of ['initiative','exchange'])assert.equal(longReachPose(t,{variant}).captionBackdropAlpha,0);
  assert.equal(longReachPose(t,{ending:'flash'}).captionBackdropAlpha,0);
 }
});

test('short flash vow focus enters and exits smoothly without affecting other endings',async()=>{
 const {flashVowFocus}=await import('../src/pixi/long-reach-timeline.js');
 for(const t of [0,5.8,6,8,8.2,12,43,45])assert.equal(flashVowFocus(t,{ending:'flash'}),0);
 for(const t of [6.25,7,7.75]){assert.equal(flashVowFocus(t,{ending:'flash'}),1);assert.equal(longReachPose(t,{ending:'flash'}).camera.y,40);}
 for(const ending of ['standard','revival'])for(const t of [6.1,7,7.9,43])assert.equal(flashVowFocus(t,{ending}),0);
 for(const edge of [6,6.25,7.75,8])assert.ok(Math.abs(flashVowFocus(edge-1e-5,{ending:'flash'})-flashVowFocus(edge+1e-5,{ending:'flash'}))<.0001);
 assert.equal(reachSeconds({longReach:true,reachEnding:'flash'}),12);
});
