import test from 'node:test';
import assert from 'node:assert/strict';
import {createReachEndingSelector,reachSchedule} from '../src/pixi/reach-ending.js';
import {longReachPose,upperReachPose} from '../src/pixi/long-reach-timeline.js';
import {reachSeconds,mechanismTime} from '../src/pixi/win-sequence.js';
import {createMoonCueController,MOON_CUES} from '../src/pixi/moon-cue.js';
import {SessionGame} from '../src/pixi/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';

test('special endings are limited to winning records and appropriate mode, with no consecutive specials',()=>{
 const selector=createReachEndingSelector();
 for(const mode of ['normal','rush']){
  const special=mode==='rush'?'flash':'revival',history=[];
  for(let id=1;id<=160;id++){
   assert.equal(selector.choose(id+1000,mode,false),'standard');
   const e=selector.choose(id,mode,true);assert.equal(selector.choose(id,mode,true),e);
   if(history.at(-1)===special)assert.equal(e,'standard');history.push(e);
  }
  for(let i=0;i<160;i+=4)assert.equal(history.slice(i,i+4).filter(e=>e===special).length,1);
 }
});

test('revival stages defeat, silence, rising moonlight and final strike before delayed winning mechanism',()=>{
 const p={basicReach:true,longReach:true,win:true,reachEnding:'revival'};
 assert.equal(reachSeconds(p,false),58);
 for(const [t,cut] of [[52,'defeat'],[53.5,'silence'],[54.4,'revive'],[55.25,'return']]){
  const pose=longReachPose(t,{ending:'revival'});assert.equal(pose.cut,cut);assert.equal(pose.visible,true);
  p.time=t;assert.ok(mechanismTime({presentation:p})<0);
 }
 assert.ok(longReachPose(54.4,{ending:'revival'}).charge>0);
 assert.ok(longReachPose(55.25,{ending:'revival',variant:'exchange'}).sparks.some(s=>s.alpha>0));
 assert.ok(longReachPose(55.25,{ending:'revival',variant:'pressure'}).charge>0);
 assert.equal(longReachPose(55.25,{ending:'revival',variant:'pressure'}).slash.alpha,0);
 p.time=55.7;assert.equal(mechanismTime({presentation:p}),0);
 assert.equal(longReachPose(55.7,{ending:'revival'}).visible,false);
});

test('12s flash has one quick attack and a full stored five-second upper cue, without new cue selection',()=>{
 const p={basicReach:true,longReach:true,win:true,reachEnding:'flash',time:5,drawId:1,moonCue:MOON_CUES.at(-1)};
 assert.equal(reachSeconds(p,true),12);const schedule=reachSchedule(p);assert.equal(schedule.upperEnd-schedule.upperAt,5);
 const c=createMoonCueController();assert.equal(upperReachPose(p).active,true);assert.equal(c.render({isWMachine:true,presentation:p},{phase:'spin'}).color,p.moonCue.color);
 p.time=9.2;assert.equal(c.render({isWMachine:true,presentation:p},{phase:'rest'}).cueActive,false);
 assert.ok(longReachPose(8.4,{ending:'flash'}).lcdAction>0);assert.equal(longReachPose(8.4,{ending:'flash'}).handoff,0);
 assert.ok(mechanismTime({presentation:p})<0);p.time=9.7;assert.equal(mechanismTime({presentation:p}),0);
});

test('both endings preserve accepted results, pause, queued records and paid-ball accounting',()=>{
 for(const [mode,ending,seconds] of [['normal','revival',58],['rush','flash',12]])for(const win of [false,true]){
  let calls=0;const g=new SessionGame(()=>{calls++;return win?0:.9;});g.reviewReachEnding=ending;
  const m=createBoardFlow({lcd:true,fire:()=>null}),s=attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true});
  if(mode==='rush'){g.startRush();m.setMode('rush');}
  const start=g.startSpin.bind(g);g.startSpin=record=>{start(record);g.spinResult={...g.spinResult,reach:true,reels:win?[7,7,7]:[7,7,8]};};
  g.hit({id:1},mode==='rush'?'fuzu':'start');g.hit({id:2},mode==='rush'?'fuzu':'start');
  for(let n=0;n<1200&&!g.presentation;n++)m.flow.step(1/120);
  assert.equal(g.presentation.reachEnding,win?ending:'standard');assert.equal(s.snapshot().reach.duration,win?seconds:54);
  const rolls=calls,bank=g.w.queues[mode==='rush'?'fuzu':'tokuzu1'],next=bank[0];
  m.flow.pause(true);const snapshot=s.snapshot();m.flow.step(1);assert.deepEqual(s.snapshot(),snapshot);m.flow.pause(false);
  for(let n=0;n<60*120&&g.presentation;n++)m.flow.step(1/120);
  assert.equal(g.lastDraw,win);assert.equal(calls,rolls);assert.equal(bank[0],next);assert.equal(g.accounting.reconciled,true);
  if(mode==='rush'){assert.equal(g.w.electricOpen,win);assert.equal(g.jackpot,null);}
 }
});
