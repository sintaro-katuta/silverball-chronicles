import {readFileSync} from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';
import {windmillVisibleShape,windmillContactGeometry,pointInWindmillUnion} from '../src/domain/windmill-shape.js';
import {windmillUnionContact,resolveVisibleWindmill} from '../src/physics/windmill-shape-contact.js';
import {Physics,collideSegment} from '../src/physics/physics.js';import {createBoardFlow} from '../src/pixi/board-flow.js';
import {withPhysicsTrace} from '../src/physics/passive-trace.js';
import {measurePinAdjustment} from '../src/dev/pin-adjustment-measurement.js';
import {inspectShotCase} from '../src/dev/s8-shot-comparison.js';import {inspectWindmillCase} from '../src/dev/s8-windmill-comparison.js';
import {inspectWheelShapeCase,measureS8WheelShapeCase,validateWheelShapeResult} from '../src/dev/s8-wheel-shape-comparison.js';
import {withS7Observation} from '../src/dev/s7-launch-observation.js';
const data=v=>JSON.parse(JSON.stringify(v));
const config=(profile='photo-three-vane')=>({id:profile,label:'Direct test only',leftAdmissionGuides:false,hesoMouthWidth:20,normalPower:.18,launchRailProfile:'legacy',moves:[],windmillOffset:{dx:0,dy:0},windmillShapeProfile:profile});
const mechanism=angle=>({kind:'windmill',x:0,y:0,radius:10,angle,omega:0,shapeProfile:'photo-three-vane'});
const ball=(x,y,vx=0,vy=0)=>({id:1,x,y,vx,vy,r:1.8,hits:0,contactCount:0});
function synthetic(operation){const step=Physics.prototype.step,canLaunch=Physics.prototype.canLaunch;Physics.prototype.canLaunch=()=>true;Physics.prototype.step=function(dt,game){this.time+=dt;this.updateGate(game);for(const b of this.balls){this.recordOutcome(b,'out');game.lose(b);}this.balls=[];};try{return operation();}finally{Physics.prototype.step=step;Physics.prototype.canLaunch=canLaunch;}}
test('accepted photo proposal vertices/ratios and analytic round hub are the shared contact source',()=>{
 const proposal=JSON.parse(readFileSync(new URL('./fixtures/windmill-photo-three-vane.json',import.meta.url)));
 const g=windmillVisibleShape(10,0);assert.equal(g.components.length,4);assert.deepEqual(g.components[0].points,proposal.localVane);assert.equal(g.components[3].radius,proposal.hubRadius);assert.equal(g.plate.radius,proposal.plate.radius);assert.equal(g.plate.contact,false);assert.equal(g.axis.radius,proposal.axisRadius);
 for(const angle of [0,.28,Math.PI/4,Math.PI/2]){const local=windmillVisibleShape(10,angle),world=windmillContactGeometry({...mechanism(angle),x:64,y:476.5});assert.equal(local.components.filter(c=>c.kind==='blade').length,3);for(let i=0;i<4;i++)assert.deepEqual(world.components[i].points,local.components[i].points.map(p=>({x:p.x+64,y:p.y+476.5})));}
 assert.equal(windmillContactGeometry({...mechanism(0),shapeProfile:undefined}).capsules.length,4);assert.throws(()=>windmillContactGeometry({...mechanism(0),shapeProfile:'visible-polygons'}));
});
test('exposed lines/arcs exclude every overlap interior at specified poses',()=>{
 for(const angle of [0,1e-12,.28,Math.PI/4,Math.PI/2]){const g=windmillVisibleShape(10,angle);for(const e of g.boundary){const q=(e.startAngle+e.endAngle)/2,p=e.type==='arc'?{x:Math.cos(q)*e.radius,y:Math.sin(q)*e.radius}:{x:(e.a.x+e.b.x)/2,y:(e.a.y+e.b.y)/2},n=e.type==='arc'?{x:p.x/e.radius,y:p.y/e.radius}:e.outward;assert.equal(pointInWindmillUnion({x:p.x+n.x*1e-6,y:p.y+n.y*1e-6},g),false);assert.equal(pointInWindmillUnion({x:p.x-n.x*1e-6,y:p.y-n.y*1e-6},g),true);}}
});
test('no solid outer plate or phantom material between vanes',()=>{assert.equal(windmillUnionContact(ball(5,7),mechanism(0)),null);assert.equal(windmillUnionContact(ball(12,0),mechanism(0)),null);});
test('rotating circular hub has tangential surface speed, radial impulse has exactly zero torque',()=>{
 for(const omega of [0,3,-3]){const m={...mechanism(0),omega},b=ball(-4.5,0,10,0),events=[];withPhysicsTrace(()=>resolveVisibleWindmill(new Physics(),b,m),e=>events.push(e));const contacts=events.filter(e=>e.type==='contact');assert.ok(contacts.length);assert.ok(contacts.every(e=>e.part.componentKind==='hub'));assert.equal(m.omega,omega);assert.ok(b.vx<0);assert.equal(windmillUnionContact(b,m),null);if(omega)assert.ok(contacts.some(e=>Math.abs(e.part.surfaceVelocity.y)>0));}
});
test('rotating blade uses relative surface velocity; prediction retains rotation/stats',()=>{
 const run=(omega,vy,predict=false)=>{const m={...mechanism(0),omega},b=ball(6,2,0,vy),p=new Physics();resolveVisibleWindmill(p,b,m,{predict});return{m,b,p};};
 const approach=run(1,0),escape=run(-1,0);assert.ok(approach.b.vy>0);assert.equal(escape.b.vy,0);assert.equal(escape.m.omega,-1);
 const real=run(0,-10),prediction=run(0,-10,true);assert.deepEqual([real.b.x,real.b.y,real.b.vx,real.b.vy],[prediction.b.x,prediction.b.y,prediction.b.vx,prediction.b.vy]);assert.equal(prediction.m.omega,0);assert.equal(prediction.p.roleFlow.windmill.contacts,0);
});
test('factory default old profile unchanged; explicit new profile only adds declared geometry identity, no pin/other fields',()=>{
 for(const leftAdmissionGuides of [false,true]){const a=createBoardFlow({lcd:true,leftAdmissionGuides}).flow.physics,b=createBoardFlow({lcd:true,leftAdmissionGuides,windmillShapeProfile:'legacy-capsules'}).flow.physics;assert.deepEqual(data(a),data(b));const c=createBoardFlow({lcd:true,leftAdmissionGuides,windmillShapeProfile:'photo-three-vane'}).flow.physics;const expected=data(a);Object.assign(expected.mechanisms[0],{shapeProfile:'photo-three-vane',shapeVersion:'photo-three-vane-v1'});assert.deepEqual(data(c),expected);}
 assert.throws(()=>createBoardFlow({lcd:true,windmillShapeProfile:'unknown'}));
});
test('old pin-only/windmill-offset inspectors reject any shape field and new comparison fixes all pins, no tray, centre',()=>{
 for(const profile of ['legacy-capsules','photo-three-vane',null]){assert.equal(inspectShotCase({...config(),leftAdmissionGuides:true,windmillShapeProfile:profile}).valid,false);assert.equal(inspectWindmillCase({...config(),leftAdmissionGuides:true,windmillShapeProfile:profile}).valid,false);}
 for(const profile of ['legacy-capsules','photo-three-vane'])assert.equal(inspectWheelShapeCase(config(profile)).valid,true);
 for(const change of [{leftAdmissionGuides:true},{moves:[{pinId:2,dx:0,dy:.25}]},{windmillOffset:{dx:.25,dy:0}},{normalPower:.2},{ballRadius:1.8}])assert.equal(inspectWheelShapeCase({...config(),...change}).valid,false);
});
test('new polygon branch is non-acting under S7 observer, and no-guide legacy retains full time mode output',()=>{
 const opts={seconds:3,drain:2,replaySeconds:5,replayFPS:30};for(const profile of ['legacy-capsules','photo-three-vane']){const c=config(profile),plain=measurePinAdjustment(c,opts),observed=withS7Observation(()=>measurePinAdjustment(c,opts)).result;assert.deepEqual(plain,observed);assert.equal(plain.fixed.colliders.some(c=>c.role==='heso-guide'),false);}
 const a=config('legacy-capsules'),b={...a};delete b.windmillShapeProfile;const r=measurePinAdjustment(a,opts),old=measurePinAdjustment(b,opts);delete r.config.windmillShapeProfile;assert.deepEqual(r,old);
});
test('synthetic250 count control strictly validates both no-guide profiles and rejects mixed replay shapes',()=>{
 for(const profile of ['legacy-capsules','photo-three-vane']){const r=synthetic(()=>measureS8WheelShapeCase(config(profile)));assert.equal(r.physical.shots,250);assert.equal(validateWheelShapeResult(r),true);for(const phase of [.1,NaN]){const invalid=structuredClone(r);invalid.phase=phase;invalid.conditions.phase=phase;assert.throws(()=>validateWheelShapeResult(invalid),/phase/);}
 const changed=structuredClone(r);changed.replayFrames[1].mechanisms[0].shapeProfile=profile==='photo-three-vane'?'legacy-capsules':'photo-three-vane';assert.throws(()=>validateWheelShapeResult(changed),/mechanism/);const tray=structuredClone(r);tray.fixed.colliders.push({role:'heso-guide'});assert.throws(()=>validateWheelShapeResult(tray),/fixed/);}
});

test('exterior union projection clears dense synthetic centre/edge/corner samples at every specified pose',()=>{
 for(const angle of [0,.28,Math.PI/4,Math.PI/2]){const m=mechanism(angle),p=new Physics();for(let x=-10;x<=10;x++)for(let y=-10;y<=10;y++){const b=ball(x+.13,y+.17);resolveVisibleWindmill(p,b,m,{predict:true});assert.equal(windmillUnionContact(b,m),null,`residual at ${angle}/${x}/${y}`);}}
});
