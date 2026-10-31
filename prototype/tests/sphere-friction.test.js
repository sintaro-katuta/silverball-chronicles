import test from 'node:test';import assert from 'node:assert/strict';
import {applySphereFriction} from '../src/physics/sphere-friction.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
const energy=b=>.5*(b.vx*b.vx+b.vy*b.vy)+.2*b.r*b.r*(b.omega??0)**2;
test('pin friction exchanges linear/angular energy within the Coulomb bound without adding energy',()=>{
 for(const theta of [0,.4,1.7,Math.PI])for(const vx of [-200,0,300])for(const vy of [-100,0,250])for(const omega of [-100,0,100]){
 const b={vx,vy,r:3,omega},nx=Math.cos(theta),ny=Math.sin(theta),before=energy(b),slip=vx*-ny+vy*nx-omega*3;
 const jt=applySphereFriction(b,nx,ny,120,.2);
 assert.ok(Math.abs(jt)<=24+1e-10);assert.ok(energy(b)<=before+1e-8);assert.ok(Math.abs(b.vx*-ny+b.vy*nx-b.omega*3)<=Math.abs(slip)+1e-8);
 }
});
test('zero friction or no support impulse cannot initialize spin or propel a stopped ball',()=>{
 for(const [jn,mu]of [[0,.2],[100,0]]){const b={vx:100,vy:200,r:3},before={...b};assert.equal(applySphereFriction(b,0,-1,jn,mu),0);assert.deepEqual(b,before);}
 const stopped={vx:0,vy:0,r:3};applySphereFriction(stopped,0,-1,100,.2);assert.equal(energy(stopped),0);
});
test('front pin contact generates spin passively while rear launch ignores pins and legacy physics remains unchanged',()=>{
 const p=createBoardFlow({lcd:true,...productionBoardFlowOptions()}).flow.physics;assert.equal(p.pinContactFriction,.5);assert.equal(p.pinContactFrictionMaxX,190);assert.equal(p.pinFrictionAt({x:300}),0);
 p.pins=[{id:1,x:100,y:100,r:.2,role:'michi',restitution:.12}];
 const b={id:1,x:100,y:96.81,vx:120,vy:100,r:3,hits:0,contactCount:0,leftLaunchPlane:true},before=energy(b);p.resolvePins(b);assert.ok(b.omega>0);assert.ok(energy(b)<=before+1e-8);
 const rear={id:2,x:100,y:96.81,vx:120,vy:100,r:3,hits:0,contactCount:0,leftLaunchPlane:false},copy={...rear};p.resolvePins(rear);assert.deepEqual(rear,copy);
 assert.equal(createBoardFlow({lcd:true}).flow.physics.pinContactFriction,undefined);
});
