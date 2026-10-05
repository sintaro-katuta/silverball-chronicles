import test from 'node:test';import assert from 'node:assert/strict';
import {SessionGame} from '../src/domain/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';

test('control pause freezes an active reach even when flow itself has not been paused',()=>{
 const g=new SessionGame(()=>0),m=createBoardFlow({lcd:true,fire:()=>g.fire()});attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true});
 g.hit({id:9000},'start');for(let n=0;n<1200&&!g.presentation;n++)m.flow.step(1/120);assert.ok(g.presentation);
 g.pause();const before={time:g.time,physicsTime:m.flow.physics.time,mechanismTime:m.flow.game.time,presentation:g.presentation.time,control:g.w.snapshot(),stock:g.stock};
 for(let n=0;n<120;n++)m.flow.step(1/120);
 assert.deepEqual({time:g.time,physicsTime:m.flow.physics.time,mechanismTime:m.flow.game.time,presentation:g.presentation.time,control:g.w.snapshot(),stock:g.stock},before);
 g.resume();m.flow.step(1/120);assert.ok(g.time>before.time);
});
test('retirement is idempotent and rejects late capture and subsequent ticks',()=>{
 const g=new SessionGame(()=>0);g.hit({id:1},'start');g.finish('retired');const result=g.result,stock=g.stock,control=g.w.snapshot();
 g.hit({id:2},'normal');g.tick(30);g.finish('retired');assert.equal(g.result,result);assert.equal(g.stock,stock);assert.deepEqual(g.w.snapshot(),control);
});
test('new play starts independently, including physical IDs and old profile upgrades',()=>{
 const first=new SessionGame(()=>.9);first.hit({id:1},'normal');first.profile.upgrades.stock=99;first.profile.upgrades.bonus=99;first.startRush();first.finish('retired');
 const next=new SessionGame(()=>.9);assert.equal(next.stock,400);assert.equal(next.total,0);assert.equal(next.rush,null);assert.equal(next.w.seen.size,0);assert.equal(next.profile.upgrades.stock??0,0);
 next.hit({id:1},'normal');assert.equal(next.stock,405);assert.equal(next.total,5);assert.equal(next.ticketEstimate,0);
});
