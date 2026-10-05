import test from 'node:test';
import assert from 'node:assert/strict';
import {pocketCrossing} from '../src/physics/pocket-sensor.js';
test('recessed opening captures side entry but rejects paths outside the visible hole',()=>{
 const p={captureRegion:{left:10,right:70,top:20,bottom:60}};
 assert.ok(pocketCrossing({x:80,y:40},{x:60,y:40,r:4,vy:0},p));
 assert.equal(pocketCrossing({x:80,y:10},{x:0,y:10,r:4,vy:0},p),null);
 assert.equal(pocketCrossing({x:80,y:70},{x:0,y:70,r:4,vy:0},p),null);
 assert.ok(pocketCrossing({x:40,y:0},{x:40,y:80,r:4,vy:1},p));
});
