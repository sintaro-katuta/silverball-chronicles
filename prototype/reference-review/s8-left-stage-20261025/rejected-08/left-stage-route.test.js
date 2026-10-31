import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {sourcePoint,sourcePath,ROAD_SOURCE,LEFT_PINS_SOURCE,RIGHT_ROAD_SOURCE} from '../src/pixi/source-layout.js';
import {trackPose,enterRecessedTrack,advanceRecessedTrack} from '../src/physics/recessed-track.js';
import {GRAVITY} from '../src/physics/physics.js';
const board=()=>createBoardFlow({lcd:true,...productionBoardFlowOptions()});
const ball=(x,y,vx,vy)=>({id:1,x,y,vx,vy,r:3,age:0,leftLaunchPlane:true,contactCount:0,contactRoles:[]});
const at=([x,y],vx=30,vy=30)=>ball(...sourcePoint([x,y]),vx,vy);
test('confirmed entry leads behind nails and ends at nail depth above heso without moving source pins',()=>{
 const p=board().flow.physics,t=p.leftStageTrack,m=p.pockets.find(p=>p.kind==='start');
 assert.deepEqual([t.points[0].x,t.points[0].y],sourcePoint([174.3,634.7]));
 assert.equal(t.points.at(-1).x,m.x);assert.ok(t.points.at(-1).y<m.y-3);assert.equal(t.points.at(-1).depth,0);
 assert.ok(t.points.slice(2,-2).every(p=>p.depth===9));assert.ok(t.points.at(-2).depth>0);
 assert.deepEqual(p.pins.map(p=>[p.x,p.y]),sourcePath([...ROAD_SOURCE,...LEFT_PINS_SOURCE,...RIGHT_ROAD_SOURCE]));assert.equal(p.ballRadius,3);
});
test('finite entrance captures only forward front-plane crossings, not nearby misses or launch balls',()=>{
 const p=board().flow.physics,t=p.leftStageTrack,a=t.points[0],c=t.segments[0],len=Math.hypot(c.t.x,c.t.y),nx=c.t.x/len,ny=c.t.y/len;
 const previous={x:a.x-nx,y:a.y-ny},b=ball(a.x+nx,a.y+ny,30,30);assert.ok(enterRecessedTrack(t,b,previous));assert.equal(b.stageDistance,0);
 for(const [offset,rear]of [[10,false],[0,true]]){const q=ball(a.x+nx-ny*offset,a.y+ny+nx*offset,30,30);if(rear)q.leftLaunchPlane=false;assert.equal(enterRecessedTrack(t,q,{x:previous.x-ny*offset,y:previous.y+nx*offset}),false);}
 const reverse=ball(previous.x,previous.y,-30,-30);assert.equal(enterRecessedTrack(t,reverse,a),false);
});
test('gutter uses gravity and constraint impulses without adding energy, changing radius or teleporting to outlet',()=>{
 const p=board().flow.physics,t=p.leftStageTrack,b=at([174.3,634.7]);b.onLeftStage=true;b.stageDistance=0;b.stageSpeed=0;
 const energy=()=>.5*b.stageSpeed**2-GRAVITY*b.y;let last=energy(),maxStep=0,steps=0;
 while(b.onLeftStage&&steps++<12000){const old={x:b.x,y:b.y};advanceRecessedTrack(t,b,1/1200,GRAVITY);assert.ok(energy()<=last+1e-6);last=energy();maxStep=Math.max(maxStep,Math.hypot(b.x-old.x,b.y-old.y));}
 assert.ok(steps<12000);assert.ok(maxStep<1);assert.equal(b.r,3);assert.equal(b.leftStageExited,true);assert.equal(b.stageDepth,0);assert.equal(b.x,t.points.at(-1).x);assert.ok(b.vy>0);
});
test('recessed ball passes nail and front-wall projections, exits above heso and resumes actual pin/pocket physics',()=>{
 const m=board(),p=m.flow.physics,t=p.leftStageTrack,b=at([174.3,634.7]);b.onLeftStage=true;b.stageDistance=0;b.stageSpeed=0;p.balls=[b];
 // Put an extra front pin and wall exactly on a rear point. Neither can trap it.
 const q=trackPose(t,t.length*.5);p.pins.push({x:q.x,y:q.y,r:3,role:'prize'});p.colliders.push({a:{x:q.x-5,y:q.y},b:{x:q.x+5,y:q.y},r:3,role:'front-test'});
 let exited=false;for(let i=0;i<1200&&p.balls.length;i++){m.flow.step(1/120);if(b.leftStageExited)exited=true;}
 assert.ok(exited);assert.equal(p.leftStageMetrics.exited,1);assert.equal(m.flow.counts.start,1);assert.equal(p.balls.length,0);
});
test('trajectory prediction does not mutate stage state, counters or the original ball',()=>{
 const m=board(),p=m.flow.physics,b=at([174.3,634.7]);b.onLeftStage=true;b.stageDistance=0;b.stageSpeed=0;const original=JSON.stringify(b),stats=JSON.stringify(p.leftStageMetrics);
 p.predictArrival(b,m.flow.game);assert.equal(JSON.stringify(b),original);assert.equal(JSON.stringify(p.leftStageMetrics),stats);
});
test('projected front and rear balls do not collide; two gutter balls retain single-file separation',()=>{
 const m=board(),p=m.flow.physics,t=p.leftStageTrack;
 const a=at([174.3,634.7]);Object.assign(a,{onLeftStage:true,stageDistance:t.length*.5,stageSpeed:20});advanceRecessedTrack(t,a,1/1200,GRAVITY);
 const front={...a,id:2,onLeftStage:false,leftStageExited:true};p.balls=[a,front];p.step(1/1200,m.flow.game);assert.equal(p.metrics.ballContacts,0);
 const rear={...a,id:3,onLeftStage:true,stageDistance:a.stageDistance-4,stageSpeed:50};p.balls=[a,rear];p.step(1/1200,m.flow.game);assert.ok(p.metrics.ballContacts>0);assert.ok(Math.abs(a.stageDistance-rear.stageDistance)>=6-1e-7);
});
