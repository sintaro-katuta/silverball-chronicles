import test from 'node:test';import assert from 'node:assert/strict';
import {MOON_CUES,MOON_EXPECTATIONS,createMoonCueController,moonCueDistribution,assignMoonCue,moonPresentationRoll} from '../src/pixi/moon-cue.js';
test('moon expectations preserve all 12 user values and numerical strength',()=>{
 assert.deepEqual(MOON_EXPECTATIONS,[[6,11,23],[8,19,31],[14,28,39],[26,38,54]]);
 assert.equal(MOON_CUES.length,12);
 assert.ok(MOON_CUES.find(c=>c.phase==='crescent'&&c.color==='red').rank>MOON_CUES.find(c=>c.phase==='full'&&c.color==='none').rank);
 assert.ok(MOON_CUES.find(c=>c.phase==='full'&&c.color==='none').rank>MOON_CUES.find(c=>c.phase==='crescent'&&c.color==='green').rank);
});
test('Bayes reliability of each cue equals its target without changing normal or rush odds',()=>{
 for(const p of [.495/199.9,1/95.3,.3]){
  const d=moonCueDistribution(p,.055),q=d.reachWinProbability;
  assert.ok(d.winNone>=0&&d.lossNone>=0);
  assert.ok(Math.abs(d.win.reduce((a,b)=>a+b,0)+d.winNone-1)<1e-12);
  assert.ok(Math.abs(d.loss.reduce((a,b)=>a+b,0)+d.lossNone-1)<1e-12);
  for(let i=0;i<12;i++){const posterior=q*d.win[i]/(q*d.win[i]+(1-q)*d.loss[i]);assert.ok(Math.abs(posterior-MOON_CUES[i].expectation/100)<1e-12);}
 }
 const normal=moonCueDistribution(.495/199.9,.055);assert.ok(normal.lossNone>0,'low base odds require reaches without a moon cue');
 for(const p of [0,1]){const d=moonCueDistribution(p,.055);assert.equal(d.winNone,1);assert.equal(d.lossNone,1);}
});
test('selection has a non-cue branch, skips non-reaches and does not use an RNG callback',()=>{
 const args={win:true,reach:true,drawId:12,baseWinProbability:.495/199.9,lossReachRate:.055};
 assert.deepEqual(assignMoonCue(args),assignMoonCue(args));assert.equal(moonPresentationRoll(12),moonPresentationRoll(12));
 for(let i=0;i<12;i++)assert.equal(assignMoonCue({...args,roll:(i+.5)/12}),MOON_CUES[i]);
 assert.equal(assignMoonCue({...args,reach:false}),null);
 assert.equal(assignMoonCue({...args,win:false,roll:.9999}),null);
 assert.equal(assignMoonCue({...args,baseWinProbability:1}),null);
});
test('cue is retained through reach, strike retains its color without pre-result reliability and idle has no active cue',()=>{
 const moon=createMoonCueController(),g={time:1,spinResult:{drawId:2,moonCue:{phase:'half',color:'green'}}};
 const first=moon.render(g,{phase:'rest'});assert.equal(first.color,'green');assert.equal(first.expectation,19);assert.equal(first.cueActive,true);
 delete g.spinResult;g.presentation={drawId:2};assert.equal(moon.render(g,{phase:'rest'}).phase,'half');
 g.previewWinAt=1;const strike=moon.render(g,{phase:'spin'});assert.equal(strike.color,'green');assert.equal(strike.expectation,null);assert.equal(strike.cueActive,false);
 const beforeSword=moon.render(g,{phase:'rest'});assert.equal(beforeSword.expectation,null);assert.equal(beforeSword.cueActive,false);assert.equal(beforeSword.color,'green');
 const idle=moon.render({time:5},{phase:'rest'});assert.equal(idle.color,'none');assert.equal(idle.cueActive,false);assert.equal(idle.expectation,null);
});

import {SessionGame} from '../src/pixi/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
test('W draw result and lottery RNG call count are identical with moon presentation attached',()=>{
 for(const [kind,roll] of [['tokuzu1',0],['tokuzu1',.9],['fuzu',0],['fuzu',.9]]){
  let beforeCalls=0,afterCalls=0;
  const baseline=new SessionGame(()=>{beforeCalls++;return .9;}),decorated=new SessionGame(()=>{afterCalls++;return .9;});
  if(kind==='fuzu'){baseline.startRush();decorated.startRush();}
  const model=createBoardFlow({lcd:true});attachNormalSpin(model.flow,{sessionGame:decorated,roundModel:model,lifecycle:true});
  const record={kind,roll,id:7};baseline.startSpin(record);decorated.startSpin(record);
  const {moonCue,...actual}=decorated.spinResult;assert.deepEqual(actual,baseline.spinResult);assert.equal(afterCalls,beforeCalls);
 }
});

test('all twelve moon cues keep their first phase and color through the result and reset on the next draw',()=>{
 for(const cue of MOON_CUES){
  const moon=createMoonCueController(),game={time:10,spinResult:{drawId:1,moonCue:cue}};
  const first=moon.render(game,{phase:'rest'});
  game.spinResult.moonCue=MOON_CUES.find(c=>c.color!==cue.color);
  for(const [age,phase]of [[0,'rest'],[.3,'spin'],[.95,'settle'],[1.3,'rest']]){
   game.previewWinAt=10;game.time=10+age;
   const result=moon.render(game,{phase});
   assert.equal(result.color,first.color);assert.equal(result.phase,first.phase);assert.equal(result.expectation,null);
  }
  const next=game.spinResult.moonCue;game.spinResult={drawId:2,moonCue:next};delete game.previewWinAt;
  assert.equal(moon.render(game,{phase:'rest'}).color,next.color);
 }
});
