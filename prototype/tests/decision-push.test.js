import test from 'node:test';
import assert from 'node:assert/strict';
import {decisionPushPose,pressDecisionPush,advanceDecisionPresentation,reachFinalePose,DECISION_PUSH} from '../src/pixi/decision-push.js';
import {cabinetLightPose} from '../src/pixi/cabinet-light-motion.js';
import {longReachPose} from '../src/pixi/long-reach-timeline.js';
import {SessionGame} from '../src/domain/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
const fixture=(win,time=47,ending='standard')=>({phase:'playing',time:100,presentation:{longReach:true,displayRoute:'battle',reachEnding:ending,time,win,reachVariant:'pressure'}});

test('button eligibility, countdown and warm light disclose no saved outcome',()=>{
 for(const t of [43,46.49,46.5,48,49.89,49.9,50.2]){
  const a=fixture(false,t),b=fixture(true,t);
  assert.deepEqual(decisionPushPose(a),decisionPushPose(b));assert.deepEqual(reachFinalePose(a),reachFinalePose(b));
  assert.equal(reachFinalePose(a).confirmed,false);assert.equal(cabinetLightPose(b).rainbow,false);
 }
 for(const patch of [{displayRoute:'basic'},{displayRoute:'direct'},{reachEnding:'flash'},{premium:'moon'},{predictionPlan:{resultFamily:'fullrotation'}}]){
  const g=fixture(true);Object.assign(g.presentation,patch);assert.equal(pressDecisionPush(g),false);
 }
 const g=fixture(true);assert.equal(pressDecisionPush(g,{paused:true}),false);g.phase='paused';assert.equal(pressDecisionPush(g),false);
});

test('press is one-shot and preserves the release, contact hold and follow-through before reveal',()=>{
 const g=fixture(false);assert.equal(pressDecisionPush(g),true);assert.equal(g.time,100);assert.equal(g.presentation.win,false);
 assert.equal(g.presentation.time,DECISION_PUSH.releaseAt);assert.equal(pressDecisionPush(g),false);
 const seen=[];for(let n=0;n<150;n++){advanceDecisionPresentation(g.presentation,1/120);seen.push(g.presentation.time);}
 assert.ok(seen.some(t=>t>=50.2&&t<50.32));assert.ok(seen.some(t=>t>=50.5&&t<50.8));
 assert.ok(seen.some(t=>t>=51.7));assert.equal(g.presentation.pushInput.settled,true);
 const p=longReachPose(50.22,{variant:'pressure',motionFrames:true});assert.ok(p.slash.alpha>0);assert.equal(p.hero.frame,2);
});

test('timeout advances normally, rainbow starts only at confirmation and revival stays hidden',()=>{
 for(const win of [false,true]){
  const g=fixture(win,46.5);for(let n=0;n<408;n++)advanceDecisionPresentation(g.presentation,1/120);
  assert.ok(Math.abs(g.presentation.time-49.9)<1e-8);assert.equal(g.presentation.pushInput,undefined);
 }
 for(const t of [51.7,52.5,53.99,54.4,55.69]){
  const loss=fixture(false,t),revival=fixture(true,t,'revival');
  assert.deepEqual(reachFinalePose(loss),reachFinalePose(revival));assert.equal(cabinetLightPose(revival).rainbow,false);
 }
 assert.equal(reachFinalePose(fixture(true,55.7,'revival')).confirmed,true);
 assert.equal(cabinetLightPose(fixture(true,51.7)).rainbow,true);assert.equal(cabinetLightPose(fixture(false,51.7)).rainbow,false);
 assert.equal(reachFinalePose({time:20,previewWinAt:19,jackpot:{charge:true}}).confirmed,false);
});

test('live flow press/timeout preserve admitted outcomes, FIFO, RNG, pause and physical clock',()=>{
 for(const mode of ['normal','rush'])for(const win of [false,true])for(const press of [false,true]){
  let rolls=0;const g=new SessionGame(()=>{rolls++;return win?0:.9;}),m=createBoardFlow({lcd:true,fire:()=>null});
  const s=attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true,presentationPatterns:true});
  if(mode==='rush'){g.startRush();m.setMode('rush');}g.reviewPresentationRoute='battle';g.reviewReachVariant='pressure';
  const kind=mode==='rush'?'fuzu':'start';g.hit({id:'active'},kind);g.hit({id:'queued'},kind);
  for(let n=0;n<1200&&!g.presentation;n++)m.flow.step(1/120);
  assert.ok(g.presentation);const calls=rolls,queued=g.w.queues[mode==='rush'?'fuzu':'tokuzu1'][0];
  for(let n=0;n<47*120;n++)m.flow.step(1/120);
  m.flow.pause(true);assert.equal(s.pressDecision(),false);const old=s.snapshot();m.flow.step(1);assert.deepEqual(s.snapshot(),old);m.flow.pause(false);
  const time=g.time,physics=m.flow.physics.time,p=g.presentation.time;
  if(press){assert.equal(s.pressDecision(),true);assert.equal(s.pressDecision(),false);assert.equal(g.time,time);assert.equal(m.flow.physics.time,physics);}
  for(let n=0;n<12*120&&g.presentation;n++)m.flow.step(1/120);
  assert.equal(g.lastDraw,win);assert.equal(rolls,calls);assert.equal(g.w.queues[mode==='rush'?'fuzu':'tokuzu1'][0],queued);
  assert.equal(g.accounting.reconciled,true);assert.ok(Math.abs((g.time-time)-(m.flow.physics.time-physics))<1e-6);
  assert.ok(press?g.time-time<54-p:Math.abs(g.time-time-(54-p))<.02);
  if(mode==='rush'){assert.equal(g.w.rush.remaining,129);assert.equal(g.w.electricOpen,win);assert.equal(g.jackpot,null);}
 }
});
