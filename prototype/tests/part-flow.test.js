import test from 'node:test';import assert from 'node:assert/strict';
import {createPartFlow} from '../src/physics/ball-flow.js';
import {LAUNCHER} from '../src/physics/physics.js';
test('part flow uses original launcher, fixed gates and actual physical crossing counts',()=>{
 for(const mode of ['normal','rush','bonus']){const f=createPartFlow(mode);f.single();f.step(1/120);assert.equal(f.physics.metrics.spawned,1);const b=f.physics.balls[0];assert.equal(b.power,1);assert.equal(b.x,LAUNCHER.origin.x);assert.ok(b.y<LAUNCHER.origin.y&&b.y>LAUNCHER.origin.y-12);
  f.start();for(let i=0;i<1200;i++)f.step(1/120);f.stop();for(let i=0;i<1200;i++)f.step(1/120);
  for(const kind of Object.keys(f.counts))assert.equal(f.counts[kind],f.physics.metrics[kind]);
  assert.equal(f.physics.gate.open,mode==='bonus');assert.equal(f.physics.rightChucker.open,mode==='rush');
  if(mode==='normal')assert.equal(f.counts.rush+f.counts.bonus,0);else assert.ok(f.counts[mode]>0);
 }
});
test('pause freezes physics and stop cancels pending launches without erasing live balls',()=>{
 const f=createPartFlow('rush');f.start();f.step(.05);f.pause(true);const before=JSON.stringify(f.physics.balls),time=f.game.time;f.step(1);assert.equal(JSON.stringify(f.physics.balls),before);assert.equal(f.game.time,time);f.stop();assert.equal(f.physics.balls.length,1);f.pause(false);f.step(.05);assert.equal(f.physics.metrics.spawned,1);
});
