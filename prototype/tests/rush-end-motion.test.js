import test from 'node:test';import assert from 'node:assert/strict';
import {rushEndPose,RUSH_END_SECONDS} from '../src/pixi/rush-end-motion.js';
test('only an actual completed RUSH shows an ending, then clears for left guidance',()=>{
 assert.equal(rushEndPose(100,undefined).visible,false);assert.equal(rushEndPose(99,100).visible,false);
 assert.equal(rushEndPose(100,100).visible,true);assert.equal(rushEndPose(101.2,100).alpha,1);
 assert.equal(rushEndPose(100.5,100,true).visible,false);assert.equal(rushEndPose(100+RUSH_END_SECONDS+.001,100).visible,false);
 assert.deepEqual(rushEndPose(100.5,100),rushEndPose(100.5,100));assert.equal(rushEndPose(0,100).visible,false);
});

test("last miss holds before result; light fades before total appears",()=>{assert.equal(rushEndPose(100.2,100).showResult,false);assert.equal(rushEndPose(100.2,100).dim,0);assert.ok(rushEndPose(100.6,100).dim>0);assert.equal(rushEndPose(101.2,100).showResult,true);assert.equal(rushEndPose(104.3,100).showResult,false);});
