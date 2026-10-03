import test from 'node:test';
import assert from 'node:assert/strict';
import {createPartFlow} from '../src/part-flow-fixture.js';
import {attachRightStartMotion} from '../src/pixi/right-start-motion.js';
test('right-start admits only when open and reverses continuously',()=>{
 const f=createPartFlow(),m=attachRightStartMotion(f);f.start();let atClose;
 for(let i=0;i<2400;i++){m.request(i>=600&&i<1800);f.step(1/120);assert.equal(f.physics.rightChucker.cover.active,true);if(i===599)assert.equal(f.counts.rush,0);if(i===1800)atClose=f.counts.rush;}
 assert.ok(atClose>0);assert.equal(f.counts.rush,atClose);assert.ok(Math.abs(f.physics.rightChucker.scoop.b.x-359.5)<1e-8);assert.equal(f.physics.pockets.find(p=>p.kind==='rush').x,359.5);
 m.request(true);for(let i=0;i<20;i++)f.step(1/120);const pose=structuredClone(f.physics.rightChucker);m.request(false);assert.deepEqual(f.physics.rightChucker,pose);
 f.pause(true);const state=m.state();f.step(.05);assert.deepEqual(m.state(),state);
});
test('closed tulip leaves a bypass and releases all launched balls',()=>{const f=createPartFlow();attachRightStartMotion(f);f.start();for(let i=0;i<4800;i++)f.step(1/120);f.stop();for(let i=0;i<3600;i++)f.step(1/120);assert.equal(f.counts.rush,0);assert.equal(f.physics.balls.length,0);});
