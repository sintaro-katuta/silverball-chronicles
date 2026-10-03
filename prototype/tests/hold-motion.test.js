import test from 'node:test';
import assert from 'node:assert/strict';
import {createHoldMotion} from '../src/pixi/hold-motion.js';
test('same-size queue replacement still moves consumed identity and lands new entry',()=>{
 const m=createHoldMotion();m.update(0,'normal',[2,3],1);
 const start=m.update(1,'normal',[3,4],2);assert.equal(start.find(s=>s.id===2).x,69);assert.equal(start.find(s=>s.id===4).y,120);
 const moving=m.update(1.1,'normal',[3,4],2);assert.deepEqual(m.update(1.1,'normal',[3,4],2),moving);
 const end=m.update(2,'normal',[3,4],2);assert.equal(end.find(s=>s.id===2).x,45);assert.equal(end.find(s=>s.id===3).x,69);assert.equal(end.find(s=>s.id===4).x,87);
 assert.ok(!end.some(s=>s.id===1));
});
test('full queue, immediate entry, mode switches and resets reconcile without ghost holds',()=>{
 const m=createHoldMotion();m.update(0,'normal',[],null);assert.equal(m.update(1,'normal',[],1)[0].y,120);
 m.update(2,'normal',[2,3,4,5,6],1);assert.equal(m.update(3,'normal',[2,3,4,5,6],1).length,6);
 assert.deepEqual(m.update(4,'rush',[],null),[]);assert.equal(m.update(0,'normal',[7],null)[0].y,130);
});
