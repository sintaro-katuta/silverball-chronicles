import test from 'node:test';
import assert from 'node:assert/strict';
import {createReachVariety,REACH_VARIANTS} from '../src/pixi/reach-variety.js';
import {longReachPose,LONG_REACH} from '../src/pixi/long-reach-timeline.js';
import {SessionGame} from '../src/domain/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';

test('each mode visits every story per bag, never repeats consecutively, and reuses a draw',()=>{
 const a=createReachVariety(),b=createReachVariety();
 for(const mode of ['normal','rush']){
  const picks=[];
  for(let id=1;id<=300;id++){
   const pick=a.choose(id,mode);assert.equal(a.choose(id,mode),pick);assert.equal(b.choose(id,mode),pick);
   if(picks.length)assert.notEqual(pick,picks.at(-1));picks.push(pick);
  }
  for(let i=0;i<300;i+=3)assert.deepEqual([...new Set(picks.slice(i,i+3))].sort(),[...REACH_VARIANTS].sort());
 }
});

test('RUSH history does not influence normal story choice',()=>{
 const a=createReachVariety(),b=createReachVariety();
 for(let id=1;id<=90;id++){a.choose(id,'rush');assert.equal(a.choose(id,'normal'),b.choose(id,'normal'));}
});

test('stories differ in attacking side and framing but retain timing and upper guidance',()=>{
 const p=longReachPose(6.4,{variant:'pressure'}),i=longReachPose(6.4,{variant:'initiative'});
 assert.equal(p.slash.alpha,0);assert.ok(p.enemy.x>130);assert.ok(i.hero.x>80);assert.notDeepEqual(p.hero,i.hero);
 assert.notDeepEqual(longReachPose(5.5,{variant:'pressure'}).camera,longReachPose(5.5,{variant:'initiative'}).camera);
 assert.notDeepEqual(longReachPose(40,{variant:'pressure'}).camera,longReachPose(40,{variant:'exchange'}).camera);
 for(const variant of REACH_VARIANTS){
  const p=longReachPose(19.6,{variant});assert.ok(p.lcdAction>0);assert.ok(p.handoff>0);assert.equal(p.dim,0);
  assert.equal(longReachPose(LONG_REACH.decisionAt,{variant}).visible,false);
  assert.equal(longReachPose(18,{variant,reducedEffects:true}).arrowY,16);
 }
});

test('selected story survives presentation and pause without drawing extra lottery randomness',()=>{
 for(const mode of ['normal','rush'])for(const win of [false,true]){
  let rolls=0;const g=new SessionGame(()=>{rolls++;return win?0:.9;});
  const m=createBoardFlow({lcd:true,fire:()=>null});attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true});
  const start=g.startSpin.bind(g);g.startSpin=record=>{start(record);g.spinResult={...g.spinResult,reach:true,reels:win?[7,7,7]:[7,7,8]};};
  if(mode==='rush'){g.startRush();m.setMode('rush');}
  g.hit({id:1},mode==='rush'?'fuzu':'start');for(let n=0;n<1200&&!g.presentation;n++)m.flow.step(1/120);
  const chosen=g.presentation.reachVariant,acceptedRolls=rolls;assert.ok(REACH_VARIANTS.includes(chosen));
  m.flow.pause(true);m.flow.step(1);assert.equal(g.presentation.reachVariant,chosen);m.flow.pause(false);
  for(let n=0;n<60*120&&g.presentation;n++)m.flow.step(1/120);
  assert.equal(g.lastDraw,win);assert.equal(rolls,acceptedRolls);assert.equal(g.accounting.reconciled,true);
 }
});
