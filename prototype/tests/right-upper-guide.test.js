import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {sourcePath} from '../src/pixi/source-layout.js';
import {sourceBoardSurfaces} from '../src/pixi/source-board-surfaces.js';
import {withPhysicsTrace} from '../src/physics/passive-trace.js';
import {RIGHT_UPPER_GUIDE_SOURCE} from '../src/pixi/source-right-upper-guide.js';

test('upper right diagram band shares its complete solid outline with its art and has no invented nail',()=>{
 const p=createBoardFlow({lcd:true,...productionBoardFlowOptions()}).flow.physics;
 assert.equal(p.pins.length,101);assert.equal(p.pins.some(pin=>pin.id===102),false);
 const guide=p.colliders.find(c=>c.role==='source-right-upper-guide');
 assert.equal(guide.shape,'solid-polygon');assert.equal(guide.r,0);
 assert.deepEqual(guide.solid.points,sourcePath(RIGHT_UPPER_GUIDE_SOURCE).map(([x,y])=>({x,y})));
 assert.deepEqual(sourceBoardSurfaces(p).upperRightGuide,RIGHT_UPPER_GUIDE_SOURCE);
 // Historical layout tools retain their existing unmodified contacts.
 assert.equal(createBoardFlow({lcd:true}).flow.physics.sourceRightUpperGuide,undefined);
});

test('natural right launches make contact with the band and never hit an invented pin102',()=>{
 const m=createBoardFlow({lcd:true,...productionBoardFlowOptions()}),contacts=[];
 m.setMode('rush');m.flow.start();
 withPhysicsTrace(()=>{for(let i=0;i<6*120;i++)m.flow.step(1/120);},event=>{
  if(event.type==='contact'&&event.part.role==='source-right-upper-guide'&&event.velocityChanged)contacts.push(event);
 });
 assert.ok(contacts.length>0,'real launches must reach the source guide');
 assert.ok(contacts.every(e=>e.part.kind==='wall'));
});
