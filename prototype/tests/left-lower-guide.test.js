import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {sourcePoint,sourcePath} from '../src/pixi/source-layout.js';
import {LEFT_LOWER_GUIDE_SOURCE} from '../src/pixi/source-left-lower-guide.js';
import {circlePolygonContact} from '../src/physics/solid-polygon-contact.js';
import {withPhysicsTrace} from '../src/physics/passive-trace.js';
import {sourceBoardSurfaces} from '../src/pixi/source-board-surfaces.js';
test('confirmed lower-left trapezoid shares source outline with art and contacts, and feeds the following nail row',()=>{
 const p=createBoardFlow({lcd:true,...productionBoardFlowOptions()}).flow.physics;
 const guide=p.colliders.find(c=>c.role==='source-left-lower-guide');
 assert.deepEqual(guide.solid.points,sourcePath(LEFT_LOWER_GUIDE_SOURCE).map(([x,y])=>({x,y})));
 assert.deepEqual(sourceBoardSurfaces(p).leftLowerGuide,LEFT_LOWER_GUIDE_SOURCE);
 const [tx,ty]=sourcePoint([163.7,774.2]);assert.equal(circlePolygonContact({x:tx,y:ty,r:3},guide.solid).inside,true);
 const [x,y]=sourcePoint([160,750]),ball={id:999,x,y,vx:10,vy:0,r:3,omega:0,hits:0,contactCount:0,leftLaunchPlane:true,sourceStageSpilled:true};
 let guideTouched=false,firstPin=null;
 withPhysicsTrace(()=>{for(let i=0;i<3600;i++){p.advanceBall(ball,1/1200);p.resolvePins(ball);}},event=>{
  if(event.type!=='contact')return;
  if(event.part.role==='source-left-lower-guide')guideTouched=true;
  if(guideTouched&&event.part.kind==='pin'&&!firstPin)firstPin=event.part;
 });
 assert.ok(guideTouched);assert.equal(firstPin?.id,64);
 assert.deepEqual([firstPin.x*2+28,(firstPin.y-120)*2],[195.5,777.5]);
 assert.ok((ball.y-120)*2>850,'ball must leave the guide and row naturally');
});
