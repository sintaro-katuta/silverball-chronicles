import test from 'node:test';
import assert from 'node:assert/strict';
import {Physics} from '../src/physics.js';
import {rightGatePose} from '../src/playcanvas/right-mechanism-geometry.mjs';
import {RIGHT_HOUSING,RightHousing} from '../src/playcanvas/right-housing.mjs';

test('both door poses reconstruct live contact endpoints rather than a horizontal closed door',()=>{
 const physics=new Physics();
 for(const game of [{},{jackpot:{gap:0,count:0}}]){
  physics.updateGate(game);const p=rightGatePose(physics.gate),r=p.angle*Math.PI/180;
  for(const [sign,point] of [[-1,physics.gate.a],[1,physics.gate.b]]){
   assert.ok(Math.abs(p.x+sign*Math.cos(r)*p.length/2-(point.x-210))<1e-8);
   assert.ok(Math.abs(p.y+sign*Math.sin(r)*p.length/2-(340-point.y))<1e-8);
  }
 }
});
test('native mouths stay at physical openings and backing stays behind balls',()=>{
 const physics=new Physics();for(const [name,kind] of [['rush','rush'],['attacker','bonus']]){const p=physics.pockets.find(p=>p.kind===kind),h=RIGHT_HOUSING[name];assert.equal(h.x,p.x);assert.equal(h.y,p.y);assert.equal(h.width,p.w);}
 assert.ok(RIGHT_HOUSING.frontOfBack<RIGHT_HOUSING.ballZ-4.6);
});

test('decorative bearings follow moving physical pivots across open and close',()=>{
 const marker=()=>({setLocalPosition(...position){this.position=position;}}),material=()=>({update(){}});
 const housing={closedShutter:{},updateShutter(){},attackerBearing:marker(),attackerBearingCap:marker(),coverPivot:marker(),m:{blue:material(),amber:material()}},physics=new Physics();
 for(const game of [{},{rush:{}},{jackpot:{gap:0,count:0}},{}]){
  physics.updateGate(game);RightHousing.prototype.applyState.call(housing,physics);
  const a=physics.gate.a,c=physics.rightChucker.cover.a;
  assert.deepEqual(housing.attackerBearing.position,[a.x-210,340-a.y,24]);
  assert.deepEqual(housing.attackerBearingCap.position,[a.x-210,340-a.y,28]);
  assert.deepEqual(housing.coverPivot.position,[c.x-210,340-c.y,24]);
 }
});
test('closed shutter infill starts at the live slope and stays behind the ball plane',()=>{
 const physics=new Physics();physics.updateGate({});let positions;
 const mesh={setPositions(p){positions=p;},setNormals(){},setIndices(){},update(){}};
 RightHousing.prototype.updateShutter.call({shutterMesh:mesh},physics.gate);
 const {a,b}=physics.gate;
 for(let i=0;i<positions.length;i+=3){const x=positions[i]+210,y=340-positions[i+1],top=a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x);assert.ok(y>=top-1e-8);assert.ok(positions[i+2]<27-4.6);}
 const housing={closedShutter:{},updateShutter(){},attackerBearing:{setLocalPosition(){}},attackerBearingCap:{setLocalPosition(){}},coverPivot:{setLocalPosition(){}},m:{blue:{update(){}},amber:{update(){}}}};
 RightHousing.prototype.applyState.call(housing,physics);assert.equal(housing.closedShutter.enabled,true);
 physics.updateGate({jackpot:{gap:0,count:0}});RightHousing.prototype.applyState.call(housing,physics);assert.equal(housing.closedShutter.enabled,false);
});
