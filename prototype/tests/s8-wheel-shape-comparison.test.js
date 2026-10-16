import test from 'node:test';import assert from 'node:assert/strict';
import {windmillVisibleShape,windmillContactGeometry,pointInWindmillUnion} from '../src/domain/windmill-shape.js';
import {windmillUnionContact,resolveVisibleWindmill} from '../src/physics/windmill-shape-contact.js';
import {Physics,collideSegment} from '../src/physics/physics.js';import {createBoardFlow} from '../src/pixi/board-flow.js';
import {withPhysicsTrace} from '../src/physics/passive-trace.js';
import {measurePinAdjustment} from '../src/dev/pin-adjustment-measurement.js';
import {inspectShotCase} from '../src/dev/s8-shot-comparison.js';import {inspectWindmillCase} from '../src/dev/s8-windmill-comparison.js';
import {inspectWheelShapeCase,measureS8WheelShapeCase,validateWheelShapeResult} from '../src/dev/s8-wheel-shape-comparison.js';
import {withS7Observation} from '../src/dev/s7-launch-observation.js';
const data=v=>JSON.parse(JSON.stringify(v));
const config=(profile='visible-polygons')=>({id:profile,label:'Direct test only',leftAdmissionGuides:false,hesoMouthWidth:20,normalPower:.18,launchRailProfile:'legacy',moves:[],windmillOffset:{dx:0,dy:0},windmillShapeProfile:profile});
const mechanism=angle=>({kind:'windmill',x:0,y:0,radius:10,angle,omega:0,shapeProfile:'visible-polygons'});
const ball=(x,y,vx=0,vy=0)=>({id:1,x,y,vx,vy,r:1.8,hits:0,contactCount:0});
function synthetic(operation){const step=Physics.prototype.step,canLaunch=Physics.prototype.canLaunch;Physics.prototype.canLaunch=()=>true;Physics.prototype.step=function(dt,game){this.time+=dt;this.updateGate(game);for(const b of this.balls){this.recordOutcome(b,'out');game.lose(b);}this.balls=[];};try{return operation();}finally{Physics.prototype.step=step;Physics.prototype.canLaunch=canLaunch;}}
test('shared exact authored4 vanes and fixed cap, actual contact getter shares coordinates at0/initial/45/90',()=>{
 for(const angle of [0,.28,Math.PI/4,Math.PI/2]){const g=windmillVisibleShape(10,angle),m={...mechanism(angle),x:64,y:476.5},world=windmillContactGeometry(m);assert.equal(g.components.length,5);assert.equal(g.components.filter(c=>c.kind==='blade').length,4);assert.deepEqual(g.components[4].points,[{x:0,y:-8/3},{x:8/3,y:0},{x:0,y:8/3},{x:-8/3,y:0}]);for(let i=0;i<5;i++)assert.deepEqual(world.components[i].points,g.components[i].points.map(p=>({x:p.x+64,y:p.y+476.5})));assert.deepEqual(world.boundary.map(e=>[e.a,e.b]),g.boundary.map(e=>[{x:e.a.x+64,y:e.a.y+476.5},{x:e.b.x+64,y:e.b.y+476.5}]));assert.ok(g.boundary.length>=16);}
 const old=windmillContactGeometry({...mechanism(.28),shapeProfile:undefined});assert.equal(old.capsules.length,4);assert.equal(old.capsules[0].r,1.3);
});
test('union boundary has no internal overlap faces and keeps blade/cap attribution at intersecting poses',()=>{
 for(const angle of [0,1e-12,.28,Math.PI/4,Math.PI/2]){const g=windmillVisibleShape(10,angle);for(const edge of g.boundary){const p={x:(edge.a.x+edge.b.x)/2,y:(edge.a.y+edge.b.y)/2};assert.equal(pointInWindmillUnion({x:p.x+edge.outward.x*1e-6,y:p.y+edge.outward.y*1e-6},g),false);assert.equal(pointInWindmillUnion({x:p.x-edge.outward.x*1e-6,y:p.y-edge.outward.y*1e-6},g),true);assert.ok(g.components.some(c=>c.id===edge.ownerId&&c.kind===edge.kind));}}
});
test('centre/concave roots resolve outside union in bounded passes, gaps have no phantom circle',()=>{
 for(const angle of [0,.28,Math.PI/4,Math.PI/2])for(const [x,y]of [[0,0],[2,2],[-2,2],[3,0],[9,0]]){const m=mechanism(angle),b=ball(x,y),p=new Physics();resolveVisibleWindmill(p,b,m);assert.equal(windmillUnionContact(b,m),null);}
 assert.equal(windmillUnionContact(ball(6,6),mechanism(0)),null);const tip=ball(12.5,0,-10,0);assert.equal(windmillUnionContact(tip,mechanism(0)),null);assert.ok(collideSegment(tip,{x:0,y:0},{x:10,y:0},.3,undefined,1.3)>0);assert.equal(windmillUnionContact(ball(9,0),mechanism(Math.PI/4)),null);
});
test('near-boundary exterior points are not incorrectly treated as inside and pushed through material',()=>{
 const m=mechanism(0),b=ball(5,4/3+1e-11);resolveVisibleWindmill(new Physics(),b,m);assert.ok(b.y>4/3);assert.equal(windmillUnionContact(b,m),null);
});
test('fixed visible cap has zero surface velocity and never changes omega, even with spinning vanes',()=>{
 for(const omega of [0,3,-3]){const m={...mechanism(Math.PI/4),omega},b=ball(3,0,-10,0),events=[];withPhysicsTrace(()=>resolveVisibleWindmill(new Physics(),b,m),e=>events.push(e));const contacts=events.filter(e=>e.type==='contact');assert.ok(contacts.length);assert.ok(contacts.every(e=>e.part.componentKind==='cap'));assert.ok(contacts.every(e=>e.part.surfaceVelocity.x===0&&e.part.surfaceVelocity.y===0));assert.equal(m.omega,omega);assert.ok(b.vx>0);assert.equal(windmillUnionContact(b,m),null);}
});
test('blade uses relative normal surface velocity and retains existing torque law; prediction does not mutate rotation/stats',()=>{
 const run=(omega,vy,predict=false)=>{const m={...mechanism(0),omega},b=ball(5,2.5,0,vy),p=new Physics(),events=[];withPhysicsTrace(()=>resolveVisibleWindmill(p,b,m,{predict}),e=>events.push(e));return{m,b,p,events};};
 const approach=run(1,0);assert.ok(approach.b.vy>5);assert.ok(approach.m.omega<1);const escape=run(-1,0);assert.equal(escape.b.vy,0);assert.equal(escape.m.omega,-1);assert.ok(escape.b.y>2.5);
 const real=run(0,-10),predict=run(0,-10,true);assert.deepEqual([real.b.x,real.b.y,real.b.vx,real.b.vy],[predict.b.x,predict.b.y,predict.b.vx,predict.b.vy]);assert.equal(predict.m.omega,0);assert.equal(predict.p.roleFlow.windmill.contacts,0);assert.equal(predict.events.length,0);assert.ok(real.m.omega<0);
});
test('factory default old profile unchanged; explicit new profile only adds declared geometry identity, no pin/other fields',()=>{
 for(const leftAdmissionGuides of [false,true]){const a=createBoardFlow({lcd:true,leftAdmissionGuides}).flow.physics,b=createBoardFlow({lcd:true,leftAdmissionGuides,windmillShapeProfile:'legacy-capsules'}).flow.physics;assert.deepEqual(data(a),data(b));const c=createBoardFlow({lcd:true,leftAdmissionGuides,windmillShapeProfile:'visible-polygons'}).flow.physics;const expected=data(a);Object.assign(expected.mechanisms[0],{shapeProfile:'visible-polygons',shapeVersion:'visible-shared-v1'});assert.deepEqual(data(c),expected);}
 assert.throws(()=>createBoardFlow({lcd:true,windmillShapeProfile:'unknown'}));
});
test('old pin-only/windmill-offset inspectors reject any shape field and new comparison fixes all pins, no tray, centre',()=>{
 for(const profile of ['legacy-capsules','visible-polygons',null]){assert.equal(inspectShotCase({...config(),leftAdmissionGuides:true,windmillShapeProfile:profile}).valid,false);assert.equal(inspectWindmillCase({...config(),leftAdmissionGuides:true,windmillShapeProfile:profile}).valid,false);}
 for(const profile of ['legacy-capsules','visible-polygons'])assert.equal(inspectWheelShapeCase(config(profile)).valid,true);
 for(const change of [{leftAdmissionGuides:true},{moves:[{pinId:2,dx:0,dy:.25}]},{windmillOffset:{dx:.25,dy:0}},{normalPower:.2},{ballRadius:1.8}])assert.equal(inspectWheelShapeCase({...config(),...change}).valid,false);
});
test('new polygon branch is non-acting under S7 observer, and no-guide legacy retains full time mode output',()=>{
 const opts={seconds:3,drain:2,replaySeconds:5,replayFPS:30};for(const profile of ['legacy-capsules','visible-polygons']){const c=config(profile),plain=measurePinAdjustment(c,opts),observed=withS7Observation(()=>measurePinAdjustment(c,opts)).result;assert.deepEqual(plain,observed);assert.equal(plain.fixed.colliders.some(c=>c.role==='heso-guide'),false);}
 const a=config('legacy-capsules'),b={...a};delete b.windmillShapeProfile;const r=measurePinAdjustment(a,opts),old=measurePinAdjustment(b,opts);delete r.config.windmillShapeProfile;assert.deepEqual(r,old);
});
test('synthetic250 count control strictly validates both no-guide profiles and rejects mixed replay shapes',()=>{
 for(const profile of ['legacy-capsules','visible-polygons']){const r=synthetic(()=>measureS8WheelShapeCase(config(profile)));assert.equal(r.physical.shots,250);assert.equal(validateWheelShapeResult(r),true);for(const phase of [.1,NaN]){const invalid=structuredClone(r);invalid.phase=phase;invalid.conditions.phase=phase;assert.throws(()=>validateWheelShapeResult(invalid),/phase/);}
 const changed=structuredClone(r);changed.replayFrames[1].mechanisms[0].shapeProfile=profile==='visible-polygons'?'legacy-capsules':'visible-polygons';assert.throws(()=>validateWheelShapeResult(changed),/mechanism/);const tray=structuredClone(r);tray.fixed.colliders.push({role:'heso-guide'});assert.throws(()=>validateWheelShapeResult(tray),/fixed/);}
});

test('exterior union projection clears dense synthetic centre/edge/corner samples at every specified pose',()=>{
 for(const angle of [0,.28,Math.PI/4,Math.PI/2]){const m=mechanism(angle),p=new Physics();for(let x=-10;x<=10;x++)for(let y=-10;y<=10;y++){const b=ball(x+.13,y+.17);resolveVisibleWindmill(p,b,m,{predict:true});assert.equal(windmillUnionContact(b,m),null,`residual at ${angle}/${x}/${y}`);}}
});
