import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
function isolated(){const m=createBoardFlow({lcd:true}),p=m.flow.physics;p.pins=[{id:1,x:100,y:400,r:.2,role:'prize'}];p.colliders=[];p.mechanisms=[];p.gate.active=false;p.rightChucker.scoop.active=false;p.rightChucker.cover.active=false;return {m,p};}
test('dense-ball separation resolves the existing pin shaft before the frame is displayed',()=>{
 const {m,p}=isolated();for(const x of [98,94.7]){const b=p.spawn({extra:true},.24);Object.assign(b,{x,y:400,vx:0,vy:0,leftLaunchPlane:true});}
 p.step(1/600,m.flow.game);
 assert.ok(p.metrics.ballContacts>0);
 for(const b of p.balls)assert.ok(Math.hypot(b.x-100,b.y-400)>=b.r+.2-1e-9);
 assert.equal(p.balls.length,2);
});
test('adaptive integration stops a fast front-plane ball at a pin instead of crossing its center',()=>{
 const {m,p}=isolated(),b=p.spawn({extra:true},.24);Object.assign(b,{x:80,y:400,vx:10000,vy:0,leftLaunchPlane:true});
 p.step(1/120,m.flow.game);
 assert.ok(b.hits>0);assert.ok(b.vx<0);assert.ok(b.x<100);
});
test('rear launch balls remain on their separate plane even when passing a front pin',()=>{
 const {m,p}=isolated(),b=p.spawn({extra:true},.24);Object.assign(b,{x:100,y:400,vx:0,vy:0,leftLaunchPlane:false});
 p.step(1/600,m.flow.game);assert.equal(b.hits,0);assert.equal(b.leftLaunchPlane,false);
});
test('a ball between staggered ordinary receivers clears their visible front edges',()=>{
 const m=createBoardFlow({lcd:true}),p=m.flow.physics,b=p.spawn({extra:true},.25);
 // Old +5-depth capsule ends trapped the ball at both normal-rim tangencies.
 Object.assign(b,{x:143.2866813378166,y:560.7471494019193,vx:0,vy:0,leftLaunchPlane:true});
 for(let i=0;i<10*120;i++)m.flow.step(1/120);
 assert.equal(p.balls.length,0);assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),1);
});
test('natural left power .25 drains after the ordinary receiver rim correction',()=>{
 const m=createBoardFlow({lcd:true,normalPower:.25}),p=m.flow.physics;m.setMode('normal');m.flow.start();
 for(let i=0;i<60*120;i++)m.flow.step(1/120);m.flow.stop();
 for(let i=0;i<30*120;i++)m.flow.step(1/120);
 assert.ok(p.metrics.spawned>0);assert.equal(p.balls.length,0);
 assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),p.metrics.spawned);
});
