import test from 'node:test';
import assert from 'node:assert/strict';
import {SessionGame} from '../../src/pixi/session-game.js';
import {W_RUNTIME_POLICY} from '../../src/pixi/w-runtime-policy.js';
import {createBoardFlow} from '../../src/pixi/board-flow.js';
import {attachNormalSpin} from '../../src/pixi/normal-spin-flow.js';
const b=id=>({id,x:200,y:500,hits:0});
const advance=(g,n=2000)=>{for(let i=0;i<n;i++){g.tick(.01);if(g.presentation){const win=g.presentation.win;g.presentation=null;g.resolveDraw(win);}if(g.jackpot||g.w.electricOpen||g.w.pendingV)return;}};
const finish=(g,p)=>{let id=0;while(g.jackpot){g.jackpot.gap=0;g.openWRound();const left=10-g.jackpot.count;for(let n=0;n<left;n++)g.hit(b(`${p}-${id++}`),'bonus');}};
const rush=()=>{const g=new SessionGame(()=>.9,{policy:{...W_RUNTIME_POLICY,nextGuaranteedFuzuRate:0}});g.startRush();g.w.rng=()=>0;g.hit(b('f'),'fuzu');advance(g);g.hit(b('e1'),'rush');g.hit(b('e2'),'rush');return g;};

test('zero stock keeps pending electric and V processing alive',()=>{
 const g=rush();g.stock=0;advance(g);assert.ok(g.w.pendingV);assert.equal(g.phase,'playing');
 for(let n=0;n<400;n++)g.tick(.01);
 assert.equal(g.phase,'playing');assert.ok(g.w.pendingV);
 g.hit(b('v'),'bonus');assert.ok(g.jackpot);assert.equal(g.total,18);
});
test('normal holds retain IDs, lottery rolls, and kind across normal win into RUSH',()=>{
 const g=new SessionGame(()=>.9);g.w.rng=()=>0;g.hit(b('s0'),'start');g.w.rng=()=>.7;
 for(let n=1;n<=4;n++)g.hit(b(`s${n}`),'start');
 const held=structuredClone(g.w.queues.tokuzu1);advance(g);finish(g,'a');
 assert.ok(g.rush);assert.deepEqual(g.w.queues.tokuzu1,held);
 for(let n=0;n<100;n++)g.tick(.01);
 assert.deepEqual(g.w.queues.tokuzu1,held);assert.equal(g.w.active.tokuzu1,null);
});
test('individual 1500 bonuses retain RUSH and the shared 3000 display plan',()=>{
 const g=rush();advance(g);g.hit(b('v1'),'bonus');finish(g,'a');
 assert.ok(g.rush);assert.equal(g.w.queues.tokuzu2.length,1);assert.equal(g.wBatch.maxPayout,3000);assert.equal(g.wBatch.payout,1500);
 advance(g);assert.ok(g.w.pendingV);assert.ok(g.rush);g.hit(b('v2'),'bonus');
 assert.equal(g.jackpot.payoutAmount,3000);assert.equal(g.jackpot.payout,1515);finish(g,'z');
 assert.equal(g.wBatch.payout,3000);assert.equal(g.events.filter(e=>e.type==='rushEnd').length,0);
});
test('pause freezes physical and control clocks; stop feed does not pause processing',()=>{
 const g=rush(),m=createBoardFlow({lcd:true});attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true});
 m.flow.pause(true);const before=JSON.stringify(g.w.snapshot()),t=g.time,pt=m.flow.physics.time;
 for(let n=0;n<120;n++)m.flow.step(1/120);
 assert.equal(g.time,t);assert.equal(m.flow.physics.time,pt);assert.equal(JSON.stringify(g.w.snapshot()),before);
 m.flow.pause(false);m.flow.stop();for(let n=0;n<24;n++)m.flow.step(1/120);
 assert.ok(g.time>t);assert.ok(g.w.pendingV);assert.equal(m.flow.continuous,false);
});
