import test from 'node:test';
import assert from 'node:assert/strict';
import {DenchuControl} from '../src/denchu-control.js';
import {createDenchuFlow} from '../src/denchu-flow-fixture.js';
test('through passage opens only after a separate winning draw and opening expires',()=>{
 const c=new DenchuControl(()=>0);c.tick(0,true);assert.equal(c.tick(.3,true),false);c.pass();assert.equal(c.tick(.1,true),false);assert.equal(c.tick(.11,true),true);assert.equal(c.openings,1);assert.equal(c.tick(1.81,true),false);c.pass();c.tick(.1,false);assert.equal(c.queue.length,0);assert.equal(c.phase,'idle');
 const lose=new DenchuControl(()=>.99);lose.tick(0,true);lose.pass();assert.equal(lose.tick(.21,true),false);assert.equal(lose.wins,0);
});
test('ordinary holds are bounded independently of start holds',()=>{const c=new DenchuControl(()=>0);c.tick(0,true);for(let i=0;i<20;i++)c.pass();assert.equal(c.queue.length,4);assert.equal(c.passes,20);});
test('real launched balls pass through, start draws and pay prizes; pause freezes both',()=>{
 const f=createDenchuFlow();f.start();for(let i=0;i<2400;i++)f.step(1/120);const s=f.snapshot();console.log(s);assert.ok(s.passes>0);assert.ok(s.openings>1);assert.ok(f.counts.rush>0);assert.ok(s.accepted>0);assert.ok(s.resolved>0);assert.ok(s.prize>0);assert.ok(s.holds<=f.game.machine.holdLimit);assert.ok(s.accepted<=f.counts.rush+f.counts.start);assert.equal(f.physics.metrics.spawned,f.physics.balls.length+Object.values(f.counts).reduce((a,b)=>a+b,0));
 f.pause(true);const before={...f.snapshot(),time:f.game.time};f.step(.05);assert.deepEqual({...f.snapshot(),time:f.game.time},before);
});
