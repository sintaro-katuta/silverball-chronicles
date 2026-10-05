import test from 'node:test';
import assert from 'node:assert/strict';
import {SessionGame} from '../src/pixi/session-game.js';
import {advancePresentationClock} from '../src/pixi/presentation-clock.js';
test('presentation advances announced mechanical deadlines without consuming a queued draw',()=>{
 const g=new SessionGame(()=>.9);g.startRush();g.w.electricOpen=true;g.electricTime=g.policy.electricOpenSeconds-.1;
 g.w.enqueue('fuzu');const before=g.w.queues.fuzu.map(r=>r.id);
 advancePresentationClock(g,.2);assert.equal(g.time,.2);assert.equal(g.w.electricOpen,false);assert.deepEqual(g.w.queues.fuzu.map(r=>r.id),before);assert.equal(g.draws,0);
});
test('pause stops both presentation time and mechanical expiry',()=>{
 const g=new SessionGame(()=>.9);g.w.pendingV={drawId:1};g.smallHitTime=7;g.pause();
 advancePresentationClock(g,5);assert.equal(g.time,0);assert.ok(g.w.pendingV);g.resume();advancePresentationClock(g,1.1);assert.equal(g.w.pendingV,null);assert.equal(g.jackpots,0);
});
