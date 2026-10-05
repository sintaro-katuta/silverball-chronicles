import test from 'node:test';
import assert from 'node:assert/strict';
import {SessionGame} from '../src/domain/session-game.js';
import {W_RUNTIME_POLICY} from '../src/domain/w-runtime-policy.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';

test('electric opening expires on game time while the first V bonus is celebrating',()=>{
 const g=new SessionGame(()=>0,{policy:{...W_RUNTIME_POLICY,electricOpenSeconds:2}});
 const model=createBoardFlow({lcd:true,fire:()=>null});
 attachNormalSpin(model.flow,{sessionGame:g,roundModel:model,lifecycle:true});
 g.startRush();g.hit({id:'f'},'fuzu');
 // Resolve the preselected fuzu result and admit only the first electric ball.
 g.startSpin(g.w.active.fuzu);g.resolveDraw(true);
 g.hit({id:'e'},'rush');g.w.resolveDraw('tokuzu2');g.syncW();
 assert.ok(g.w.pendingV);assert.ok(g.w.electricOpen);
 g.hit({id:'v'},'bonus');model.flow.step(.01);
 assert.ok(g.jackpot);assert.ok(g.previewWinAt!==undefined);
 const before={time:g.time,electricTime:g.electricTime,total:g.total};
 g.pause();for(let n=0;n<120;n++)model.flow.step(1/120);
 assert.deepEqual({time:g.time,electricTime:g.electricTime,total:g.total},before);
 g.resume();for(let n=0;n<250;n++)model.flow.step(1/120);
 assert.equal(g.w.electricOpen,false,'opening must expire even while the bonus presentation waits');
 assert.equal(g.w.electricAuthorization,false);
 assert.equal(g.jackpot.round,1);assert.equal(g.w.bonus.open,false);
 assert.equal(g.total,before.total,'clock progress must not fill missing admissions');
 assert.equal(g.accounting.reconciled,true);
});

test('presentation clock expires V opportunity without inventing payout or another draw',()=>{
 const g=new SessionGame(()=>.9,{policy:{...W_RUNTIME_POLICY,smallHitOpenSeconds:.5}});
 g.startRush();g.w.rng=()=>0;g.hit({id:'f'},'fuzu');g.startSpin(g.w.active.fuzu);g.resolveDraw(true);
 g.hit({id:'e'},'rush');g.w.resolveDraw('tokuzu2');g.syncW();assert.ok(g.w.pendingV);
 const total=g.total,serial=g.w.serial;
 g.advanceClock(.5);
 assert.equal(g.w.pendingV,null);assert.equal(g.jackpot,null);assert.equal(g.total,total);assert.equal(g.w.serial,serial);
 assert.equal(g.w.events.filter(e=>e.type==='vMissed').length,1);
 g.advanceClock(.5);assert.equal(g.w.events.filter(e=>e.type==='vMissed').length,1);
});
