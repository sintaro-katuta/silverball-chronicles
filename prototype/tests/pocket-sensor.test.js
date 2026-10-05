import test from 'node:test';
import assert from 'node:assert/strict';
import {pocketCrossing} from '../src/physics/pocket-sensor.js';
const mouth={x:100,y:100,w:20};
const ball=(x,y,vy=10)=>({x,y,vy,r:4});
test('entrance uses crossing position, rejecting a ball that enters sideways below the mouth',()=>{
 assert.equal(pocketCrossing({x:112,y:99},ball(103,110),mouth),null);
});
test('a diagonal ball through the mouth is accepted even if its next position is outside',()=>{
 assert.deepEqual(pocketCrossing({x:100,y:99},ball(110,110),mouth),{x:100+10/11,y:100,t:1/11});
});
test('sensor excludes upward, sideways, already-below and too-large balls',()=>{
 for(const [prev,b] of [[{x:100,y:101},ball(100,99,-10)],[{x:100,y:100},ball(101,100)],[{x:100,y:101},ball(100,102)],[{x:100,y:99},{...ball(100,101),r:11}]])assert.equal(pocketCrossing(prev,b,mouth),null);
});
test('entrance clearance accounts for ball radius and includes a tangent passage',()=>{
 assert.ok(pocketCrossing({x:106,y:99},ball(106,101),mouth));
 assert.equal(pocketCrossing({x:106.01,y:99},ball(106.01,101),mouth),null);
});
