import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackgroundTransition} from '../src/pixi/background-transition.js';
test('normal to RUSH and back follows the game clock without changing on pause',()=>{
 const t=createBackgroundTransition();assert.equal(t.update(0,false),0);assert.equal(t.update(3,true),0);
 assert.ok(Math.abs(t.update(3.4,true)-.5)<1e-9);assert.equal(t.update(3.4,true),t.update(3.4,true));assert.equal(t.update(4,true),1);
 assert.equal(t.update(8,false),1);assert.ok(Math.abs(t.update(8.4,false)-.5)<1e-9);assert.equal(t.update(9,false),0);
});
test('interrupted transition reverses continuously and reset removes old progress',()=>{
 const t=createBackgroundTransition();t.update(0,false);t.update(1,true);const before=t.update(1.3,true);
 assert.equal(t.update(1.3,false),before);assert.ok(t.update(1.5,false)<before);assert.equal(t.update(2.2,false),0);
 assert.equal(t.update(0,true),1);assert.equal(t.update(0,false),1);assert.equal(t.update(1,false),0);
});
