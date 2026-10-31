import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {referenceVisibleRails} from '../src/pixi/reference-rail-shapes.js';
const make=(options={})=>createBoardFlow({lcd:true,...productionBoardFlowOptions(),...options});
const results=[];
for(const [mode,phase] of [['normal',0],['normal',.175],['normal',.35],['rush',0],['bonus',0]])test(`production ${mode} phase ${phase}: 30 natural shots leave the rear launcher`,()=>{
 const m=make(),p=m.flow.physics,transfers=new Set();m.setMode(mode);
 const advance=p.advanceBall.bind(p);p.advanceBall=(b,h,o)=>{
  const before={...b},prev=advance(b,h,o);
  if(!before.leftLaunchPlane&&b.leftLaunchPlane){
   assert.equal(before.launchExitCrossed,true);assert.equal(before.nonReturnValveCrossed,true);assert.equal(p.launchFrontIsClear(before),true);
   transfers.add(b.id);
  }
  return prev;
 };
 for(let i=0;i<Math.round(phase*120);i++)m.flow.step(1/120);
 m.flow.start();let stoppedAt=null;
 for(let i=0;i<25*120;i++){
  if(p.metrics.spawned>=30&&stoppedAt===null){m.flow.stop();stoppedAt=p.time;}
  m.flow.step(1/120);
  if(stoppedAt!==null&&p.time-stoppedAt>=4)break;
 }
 assert.equal(p.metrics.spawned,30);assert.equal(transfers.size,30);assert.equal(m.flow.counts.returned,0);
 assert.equal(p.balls.filter(b=>!b.leftLaunchPlane).length,0);
 assert.equal(p.balls.filter(b=>b.y<290).length,0,'no retained balls at the upper exit');
 assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0)+p.balls.length,30);
 assert.ok(stoppedAt-phase<18,'keep the existing 0.6 second shot cadence');
 results.push({mode,phase,shots:p.metrics.spawned,entered:transfers.size,rearRemaining:0,upperRemaining:0,counts:{...m.flow.counts},fieldRemaining:p.balls.length});
});
test('rear contact is absent from front balls; original visible polygons and other profiles remain unchanged',()=>{
 const p=make().flow.physics,c=p.colliders.find(c=>c.rearOnly),x=(c.a.x+c.b.x)/2,y=(c.a.y+c.b.y)/2;
 assert.ok(c);assert.equal(p.colliders.find(c=>c.role==='launch-inner-visible-band').playfieldOnly,true);
 const rear={id:1,x,y,r:3,vx:0,vy:0,hits:0,contactCount:0},front={...rear,leftLaunchPlane:true};
 p.advanceBall(rear,0);assert.ok(Math.hypot(rear.x-x,rear.y-y)>0);
 p.advanceBall(front,0);assert.equal(front.x,x);assert.equal(front.y,y);
 assert.deepEqual(p.railVisibleShape,referenceVisibleRails());
 for(const options of [{leftInletRoute:'legacy'},{ballRadius:1.8},{launchRailProfile:'legacy'}])assert.equal(make(options).flow.physics.colliders.some(c=>c.rearOnly),false);
});
test('the front layer is not entered while a ball overlaps a pin or visible front component',()=>{
 const p=make().flow.physics,pin=p.pins[30];assert.equal(p.launchFrontIsClear({x:pin.x,y:pin.y,r:3}),false);
 const solid=p.colliders.find(c=>c.sourceComponentId==='upper-rim-left');const q=solid.solid.points[10];
 assert.equal(p.launchFrontIsClear({x:q.x,y:q.y,r:3}),false);
 // The rendered upper character is now a solid front component.
 assert.equal(p.launchFrontIsClear({x:200,y:200,r:3}),false);
 assert.equal(p.launchFrontIsClear({x:200,y:560,r:3}),true);
});
test('insufficient rear launch energy returns the ball instead of forcing a transfer',()=>{
 const m=make({normalLaunchSpeedOffset:0}),p=m.flow.physics;m.setMode('normal');m.setNormalPower(0);m.flow.single();
 for(let i=0;i<10*120;i++)m.flow.step(1/120);
 assert.equal(p.metrics.spawned,1);assert.equal(m.flow.counts.returned,1);assert.equal(p.balls.length,0);assert.equal(p.nonReturnValve.forwardPasses,0);
});
test.after(()=>{if(process.env.LAUNCH_DEPTH_REPORT)console.log('LAUNCH_DEPTH_RESULTS '+JSON.stringify(results));});
