import {LONG_REACH} from '../src/pixi/long-reach-timeline.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {SessionGame} from '../src/pixi/session-game.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
test('production W bridge accepts physical fuzu/electric/V/attacker crossings and counts 3000',()=>{
 const g=new SessionGame(()=>.9),m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true});
 const advance=sec=>{for(let n=0;n<sec*120;n++)m.flow.step(1/120);};
 const drop=kind=>{const p=m.flow.physics.pockets.find(p=>p.kind===kind),t=p.captureTray,b=m.flow.physics.spawn({extra:true},.24);Object.assign(b,{x:t?(t.left+t.right)/2:p.x,y:t?t.y-t.radius-b.r-1:p.y-2,vx:0,vy:80,leftLaunchPlane:true});advance(.1);};
 g.startRush();g.w.rng=()=>0;drop('fuzu');advance(LONG_REACH.seconds+1.5);assert.equal(g.w.electricOpen,true);assert.equal(m.tulip.state().progress,1);
 drop('rush');drop('rush');advance(1);assert.ok(g.w.pendingV);assert.equal(g.jackpot,null);assert.equal(m.attacker.state().progress,1);
 for(let n=0;n<3000&&(g.wBatch?.payout??0)<3000;n++){
  if(g.w.pendingV&&m.attacker.state().progress===1)drop('bonus');
  else if(g.jackpot&&s.rounds.snapshot().phase==='open')drop('bonus');
  else advance(.1);
 }
 assert.equal(g.wBatch.payout,3000);assert.equal(m.flow.counts.bonus,200);assert.equal(m.flow.counts.rush,2);assert.equal(m.flow.counts.fuzu,1);
 assert.equal(g.total,3003);assert.equal(g.accounting.reconciled,true);assert.equal(g.w.events.filter(e=>e.type==='vDetected').length,2);
});
test('natural right launches traverse fuzu, two electric admissions, two V entries and 3000',()=>{
 const g=new SessionGame(()=>.9),m=createBoardFlow({lcd:true,fire:()=>g.fire()}),s=attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true});
 // Only the initial mode and lottery RNG are fixtures. No ball is teleported,
 // no inlet callback is called by the test, and every prize comes from physics.
 g.startRush();g.w.rng=()=>0;m.setMode('rush');m.flow.start();
 for(let n=0;n<(240+LONG_REACH.seconds)*120&&(g.wBatch?.payout??0)<3000;n++)m.flow.step(1/120);
 assert.equal(g.wBatch.payout,3000);assert.equal(m.flow.counts.bonus,200);assert.equal(m.flow.counts.rush,2);
 assert.ok(m.flow.counts.fuzu>0);assert.equal(g.w.events.filter(e=>e.type==='vDetected').length,2);
 assert.equal(g.w.events.filter(e=>e.type==='bonusEnd').length,2);assert.equal(g.accounting.reconciled,true);
 const c=m.flow.counts;assert.equal(m.flow.physics.metrics.spawned,Object.values(c).reduce((a,b)=>a+b,0)+m.flow.physics.balls.length);
 assert.equal(g.total,3000+c.fuzu+c.rush);m.flow.stop();
});
test('dense arrivals cannot be consumed beyond the ten-count closing boundary',()=>{
 const g=new SessionGame(()=>0),m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true});
 g.hit({id:'start-fixture'},'start');
 for(let n=0;n<(20+LONG_REACH.seconds)*120&&s.rounds.snapshot().phase!=='open';n++)m.flow.step(1/120);
 assert.equal(s.rounds.snapshot().phase,'open');
 const p=m.flow.physics.pockets.find(p=>p.kind==='bonus'),t=p.captureTray;
 for(let n=0;n<16;n++){const b=m.flow.physics.spawn({extra:true},.24);Object.assign(b,{x:(t.left+t.right)/2,y:t.y-t.radius-b.r-1-n*(2*b.r+.2),vx:0,vy:200,leftLaunchPlane:true});}
 for(let n=0;n<60;n++)m.flow.step(1/120);
 assert.equal(m.flow.counts.bonus,10);assert.equal(g.w.payout,151);assert.equal(g.w.bonus.round,2);
 assert.equal(g.w.events.filter(e=>e.type==='attackerClose').length,1);assert.equal(g.accounting.reconciled,true);
 assert.equal(m.flow.physics.metrics.spawned,Object.values(m.flow.counts).reduce((a,b)=>a+b,0)+m.flow.physics.balls.length);
});
