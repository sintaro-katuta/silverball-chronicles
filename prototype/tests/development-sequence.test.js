import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {DEVELOPMENT,developsReach,developmentPose,reachSeconds,mechanismTime} from '../src/pixi/win-sequence.js';

test('development is separate from win-only ornament, and RUSH timing stays unchanged',()=>{
 for(const win of [false,true]){
  const p={basicReach:true,win,developed:true,time:1.1};
  assert.equal(reachSeconds(p,false),4.8);
  assert.equal(developmentPose(p).stage,'gather');
  p.time=2;assert.equal(developmentPose(p).stage,'slash');
  assert.equal(mechanismTime({presentation:p}),win?2-DEVELOPMENT.mechanismAt:-1);
  p.time=2.8;assert.equal(developmentPose(p).visible,false);
  assert.equal(mechanismTime({presentation:p}),win?2.8-DEVELOPMENT.mechanismAt:-1);
  assert.equal(reachSeconds(p,true),win?2.5:.45);
  assert.equal(developmentPose(p,true).visible,false);
 }
 assert.equal(developsReach({win:false,drawId:1},false),false);
 assert.equal(developsReach({win:false,drawId:2},false),true);
 assert.equal(developsReach({win:true,drawId:1},false),true);
 assert.equal(developsReach({win:true,drawId:1},true,true),false);
});

test('developed losing reach preserves stored results and RNG calls, freezes during pause, retains readable stop',()=>{
 const run=developed=>{
  const m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow,{reach:true});s.game.reviewDevelopment=developed;
  let calls=0;const rng=s.game.rng;s.game.rng=()=>{calls++;return rng();};
  for(let i=0;i<2;i++)m.flow.game.hit({id:i,x:210,y:480},'start',4);
  for(let i=0;i<1200&&!s.game.presentation;i++)m.flow.step(1/120);
  assert.equal(s.game.presentation.win,false);assert.equal(s.game.presentation.developed,developed);
  const outcome=[...s.game.reelOutcome],cue=s.game.presentation.moonCue;
  const snap=s.snapshot();m.flow.pause(true);m.flow.step(1);assert.deepEqual(s.snapshot(),snap);m.flow.pause(false);
  for(let i=0;i<720&&s.game.presentation;i++)m.flow.step(1/120);
  assert.deepEqual(s.game.stoppedReels,outcome);assert.equal(s.game.jackpots,0);assert.ok(s.game.stopTimer>.65);
  return {outcome,cue,calls,draws:s.game.draws,accepted:s.snapshot().accepted};
 };
 assert.deepEqual(run(true),run(false));
});

test('presentation admission trace stays bounded while lifetime counters retain rejected entries',()=>{
 const m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow);
 for(let i=0;i<130;i++)m.flow.game.hit({id:i,x:210,y:480},'start',4);
 assert.equal(s.events.length,100);
 assert.equal(s.snapshot().events.length,100);
 assert.equal(s.snapshot().entries,130);
 assert.equal(s.snapshot().accepted,6);
 assert.equal(s.events[0].ballId,30);
});
