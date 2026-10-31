import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {pocketCrossing} from '../src/physics/pocket-sensor.js';
test('approved mouth trials change only aperture and its two rims, preserving source board',()=>{
 const make=w=>createBoardFlow({lcd:true,...productionBoardFlowOptions(),hesoMouthWidth:w}).flow.physics;
 const base=make(20),old=base.pockets.find(p=>p.kind==='start');
 for(const w of [18,16]){const p=make(w),q=p.pockets.find(p=>p.kind==='start');assert.deepEqual(q,{...old,w});
  assert.deepEqual(p.colliders.filter(c=>c.role!=='start-rim'),base.colliders.filter(c=>c.role!=='start-rim'));
  for(const key of ['pins','sourceGuidePaths','sourceStage','mechanisms','ballRadius','launchSpeedOffset'])assert.deepEqual(p[key],base[key],key);
  assert.deepEqual(p.colliders.filter(c=>c.role==='start-rim').map(c=>c.a.x).sort((a,b)=>a-b),[q.x-w/2,q.x+w/2]);
  const x=q.x+(w/2-3+7)/2,before={x,y:q.y-1},ball={x,y:q.y+1,vy:20,r:3};assert.equal(pocketCrossing(before,ball,q),null);assert.ok(pocketCrossing(before,ball,old));
 }
});
