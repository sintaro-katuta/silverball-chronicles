import {sourceGuidePaths} from '../src/pixi/source-guide-trace.js';
import {resolveRampSides} from '../src/physics/recessed-stage.js';
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createBoardFlow} from '../src/pixi/board-flow.js';import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {sourcePath,sourcePoint,ROAD_SOURCE,LEFT_PINS_SOURCE,RIGHT_ROAD_SOURCE,SCREEN_SOURCE} from '../src/pixi/source-layout.js';
import {circlePolygonContact} from '../src/physics/solid-polygon-contact.js';
import {sourceBoardSurfaces} from '../src/pixi/source-board-surfaces.js';
const board=()=>createBoardFlow({lcd:true,...productionBoardFlowOptions()});
const ball=(source,vx=0,vy=0)=>{const[x,y]=sourcePoint(source);return{id:1,x,y,vx,vy,r:3,age:0,leftLaunchPlane:true,contactCount:0,contactRoles:[]};};
test('stage preserves marked inverse-V, ball diameter and pin centres except approved upper/right pins',()=>{
 const p=board().flow.physics,s=p.sourceStage,paths=JSON.parse(readFileSync(new URL('../reference-review/s8-right-user-layout-20261026/user-layout.json',import.meta.url))).lines;
 for(const q of paths)assert.deepEqual(p.sourceGuidePaths.find(v=>v.id===q.id).points,q.points);
 assert.deepEqual(s.points,sourcePath(paths.find(q=>q.id==='apron-moulding').points).map(([x,y])=>({x,y})));
 for(const g of s.guides){const q=sourceGuidePaths().find(v=>v.id===g.sourceGuideId);assert.deepEqual(g.a,q.worldPoints[g.sourceGuideSegment]);assert.deepEqual(g.b,q.worldPoints[g.sourceGuideSegment+1]);}
 assert.deepEqual(p.pins.map(p=>[p.x,p.y]),sourcePath([...ROAD_SOURCE,...LEFT_PINS_SOURCE,...RIGHT_ROAD_SOURCE]).map(([x,y],i)=>{const q=JSON.parse(readFileSync(new URL('./fixtures/s8-approved-right-road.json',import.meta.url))).pins.find(p=>p.id===i+1);return q?[q.x,q.y]:[x-(i===32?3:0),y];}));assert.equal(p.ballRadius,3);
 assert.ok(sourceBoardSurfaces(p).details.find(q=>q.id==='apron-moulding').recessedGuide);assert.equal(p.sourceGuidePaths.find(q=>q.id==='apron-bevel-left').contactRole,undefined);
});
test('front and rear balls both stay out of the LCD solid, while rear launch remains separate',()=>{
 const p=board().flow.physics,c=p.colliders.find(c=>c.role==='source-lcd-exclusion');assert.deepEqual(c.solid.points,sourcePath(SCREEN_SOURCE).map(([x,y])=>({x,y})));
 for(const rear of [false,true]){const b=ball([440,600]);if(rear){b.onSourceStage=true;b.stageDepth=9;}p.advanceBall(b,1/1200);assert.equal(circlePolygonContact(b,c.solid),null);}
 const launch=ball([440,600]);launch.leftLaunchPlane=false;p.advanceBall(launch,1/1200);assert.ok(circlePolygonContact(launch,c.solid)?.inside);
});
test('recessed guide catches a ball above the actual marked slope and leaves the front nail plane unobstructed',()=>{
 const p=board().flow.physics,stage=ball([300,760],80,100),front={...stage,id:2};stage.onSourceStage=true;stage.stageDepth=9;stage.stageNeckCleared=true;
 p.pins=[];p.mechanisms=[];p.colliders=[];for(let i=0;i<120;i++){p.advanceBall(stage,1/1200);p.advanceBall(front,1/1200);}
 assert.equal(stage.lastContact,'source-stage-guide');assert.notEqual(front.lastContact,'source-stage-guide');assert.ok(stage.y<front.y);
});
test('the central original trough returns a ball through the depth slope, then ordinary pin and pocket physics resumes',()=>{
 const m=board(),p=m.flow.physics,b=ball([445,814]);Object.assign(b,{onSourceStage:true,stageDepth:9,stageNeckCleared:true});p.balls=[b];
 let ramp=false,depthSeen=new Set();for(let i=0;i<600&&p.balls.length;i++){m.flow.step(1/120);if(b.onStageRamp){ramp=true;depthSeen.add(Math.round(b.stageDepth));}}
 assert.ok(ramp);assert.ok(depthSeen.size>3);assert.equal(b.sourceStageExited,true);assert.equal(b.stageDepth,0);assert.equal(p.sourceStageMetrics.exited,1);assert.equal(m.flow.counts.start,1);
});
test('stage prediction does not change original sphere state or entry/exit counters',()=>{
 const m=board(),p=m.flow.physics,b=ball([300,760],30,40);Object.assign(b,{onSourceStage:true,stageDepth:9,stageNeckCleared:true});const original=JSON.stringify(b),metrics=JSON.stringify(p.sourceStageMetrics);p.predictArrival(b,m.flow.game);assert.equal(JSON.stringify(b),original);assert.equal(JSON.stringify(p.sourceStageMetrics),metrics);
});

test('a sphere that cannot clear the original receiving corner spills to the front without a shove or relocation',()=>{
 const p=board().flow.physics,b=ball([187,709],20,150);Object.assign(b,{onSourceStage:true,stageDepth:9});const x=b.x,dt=1/1200;p.advanceBall(b,dt);assert.equal(b.sourceStageSpilled,true);assert.equal(b.onSourceStage,false);assert.equal(b.stageDepth,0);assert.ok(Math.abs(b.x-(x+20*dt))<1e-10);assert.equal(b.vx,20);assert.equal(p.sourceStageMetrics.spilled,1);
});

test('depth ramp side contacts dissipate kinetic energy without attracting a stationary sphere to the centre',()=>{
 const r=board().flow.physics.sourceStage.ramp;for(const side of [-1,1]){const b={x:side<0?r.backLeft:r.backRight,rampDistance:r.length*.5,vx:side*100,rampSpeed:50,r:3};const energy=.5*(b.vx*b.vx+b.rampSpeed*b.rampSpeed);resolveRampSides(r,b);assert.ok(.5*(b.vx*b.vx+b.rampSpeed*b.rampSpeed)<=energy+1e-9);}
 const still={x:(r.backLeft+r.backRight)/2,rampDistance:r.length*.3,vx:0,rampSpeed:0,r:3};const old={...still};resolveRampSides(r,still);assert.deepEqual(still,old);
});
test('the neighbouring low part of the original trough drains through the depth ramp instead of remaining in a 2D pit',()=>{
 const m=board(),p=m.flow.physics,b=ball([426.7,811.6]);Object.assign(b,{onSourceStage:true,stageDepth:9,stageNeckCleared:true});p.balls=[b];let exitX;for(let i=0;i<1200&&p.balls.length;i++){m.flow.step(1/120);if(b.sourceStageExited&&exitX===undefined)exitX=b.x*2+28;}assert.equal(b.sourceStageExited,true);assert.equal(b.stageDepth,0);assert.ok(exitX>=440&&exitX<=448);assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),1);
});

test('the shared floor closes the sampled right joint using existing vertices and does not form a capsule-end trap',()=>{
 const m=board(),p=m.flow.physics,allowed=new Set(sourceGuidePaths().flatMap(q=>q.worldPoints.map(v=>JSON.stringify(v))));for(const v of p.sourceStage.floor.solid.points)assert.ok(allowed.has(JSON.stringify(v)));
 const b=ball([621.84,777.27]);Object.assign(b,{onSourceStage:true,stageDepth:9,stageNeckCleared:true});p.balls=[b];for(let i=0;i<120*15&&p.balls.length;i++)m.flow.step(1/120);assert.equal(b.sourceStageExited,true);assert.equal(b.onSourceStage,false);
});
