// Fixed terminal-state fixture. Excluded from reliability statistics.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {SessionGame} from '../src/pixi/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
const g=new SessionGame(()=>.9),m=createBoardFlow({lcd:true,fire:()=>null});attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true,presentationPatterns:true});
let ball=1;function inlet(kind){m.flow.game.hit({id:ball++,x:200,y:470,hits:0},kind,0);m.flow.physics.nextId=ball;}
for(let n=0;n<5;n++)inlet('start');g.startRush();m.setMode('rush');
// The initial active normal record finishes first. Four queued normal records
// then correctly wait for RUSH, reproducing the longitudinal stop condition.
for(let n=0;n<2000&&g.draws<1;n++)m.flow.step(.05);
assert.equal(g.draws,1);assert.equal(g.w.queues.tokuzu1.length,4);
g.w.rush.remaining=2;g.syncW();
for(let n=0;n<200;n++)m.flow.step(.05);
assert.equal(g.draws,1);assert.equal(g.w.queues.tokuzu1.length,4);assert.equal(g.w.rush.remaining,2);
const waiting={draws:g.draws,normalIds:g.w.queues.tokuzu1.map(r=>r.id),remaining:g.w.rush.remaining};
inlet('fuzu');inlet('fuzu');
for(let n=0;n<10000&&(g.w.queues.tokuzu1.length||g.w.queues.fuzu.length||g.w.active.tokuzu1||g.w.active.fuzu||g.presentation||g.spinActive);n++)m.flow.step(.05);
assert.equal(g.rush,null);assert.equal(g.w.queues.tokuzu1.length,0);assert.equal(g.w.queues.fuzu.length,0);assert.equal(g.draws,7);assert.equal(g.w.serial,7);assert.equal(g.accounting.reconciled,true);
const resolved=g.events.filter(e=>e.type==='draw').map(e=>({id:e.id,kind:e.kind,outcome:e.outcome}));assert.deepEqual(resolved.map(r=>r.id),[1,6,7,2,3,4,5]);assert.ok(resolved.every(r=>r.outcome==='miss'));
await writeFile('reference-review/parallel-distribution-2026-10-05/drain-regression.json',JSON.stringify({scope:'Fixed terminal state: all stored rolls=.9, remaining2. No forced resolution/RUSH exit. Excluded from natural reliability statistics.',waiting,resolved,time:g.time,passed:true},null,2));console.log(JSON.stringify({passed:true,waiting,resolved}));
