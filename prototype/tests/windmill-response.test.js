import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {resolveVisibleWindmill,windmillUnionContact} from '../src/physics/windmill-shape-contact.js';
const mechanism=()=>({...createBoardFlow({lcd:true,...productionBoardFlowOptions(),windmillResponseProfile:'coupled-impulse-v1'}).flow.physics.mechanisms[0],x:0,y:0,angle:0,omega:0});
const ball=(x=6,y=2,vx=0,vy=-80)=>({id:1,x,y,vx,vy,r:1.8});
const energy=(b,m)=>(b.vx*b.vx+b.vy*b.vy+m.momentOfInertia*m.omega*m.omega)/2;
test('coupled blade impulse preserves angular momentum and dissipates pair energy in either direction',()=>{
 for(const sign of [-1,1])for(const speed of [20,80,160])for(const omega of [-1,0,1]){
  const b=ball(6,2*sign,0,-speed*sign),m={...mechanism(),omega},contact=windmillUnionContact(b,m),q=contact.point;
  const momentum=()=>q.x*b.vy-q.y*b.vx+m.momentOfInertia*m.omega;
  const beforeL=momentum(),beforeE=energy(b,m),beforeNormal=(b.vx+q.y*omega)*contact.normal.x+(b.vy-q.x*omega)*contact.normal.y;
  resolveVisibleWindmill({recordRole(){}},b,m);
  assert.ok(Math.abs(momentum()-beforeL)<1e-9);
  assert.ok(energy(b,m)<=beforeE+1e-9);
  const afterNormal=(b.vx+q.y*m.omega)*contact.normal.x+(b.vy-q.x*m.omega)*contact.normal.y;
  assert.ok(Math.abs(afterNormal+.3*beforeNormal)<1e-9);
  assert.equal(windmillUnionContact(b,m),null);
 }
});
test('axis impact adds no spin, blade direction and strength produce distinct responses',()=>{
 const respond=(b)=>{const m=mechanism();resolveVisibleWindmill({recordRole(){}},b,m);return m.omega;};
 assert.ok(Math.abs(respond(ball(-4.5,0,80,0)))<1e-12);
 const weak=respond(ball(6,2,0,-20)),strong=respond(ball(6,2,0,-160));
 assert.ok(weak<0&&strong<weak);assert.ok(Math.abs(strong-8*weak)<1e-10);
 assert.ok(respond(ball(6,-2,0,80))>0);
});
test('prediction leaves rotor and diagnostics unchanged while using finite effective mass',()=>{
 const m=mechanism(),initial=structuredClone(m),b=ball(),real=ball();let hits=0;
 resolveVisibleWindmill({recordRole(){hits++;}},b,m,{predict:true});
 resolveVisibleWindmill({recordRole(){}},real,mechanism());
 assert.deepEqual(b,real);assert.deepEqual(m,initial);assert.equal(hits,0);
});
test('no-contact rotor stays still and real rotation decays continuously across pause/resume',()=>{
 const model=createBoardFlow({lcd:true,...productionBoardFlowOptions(),windmillResponseProfile:'coupled-impulse-v1'}),p=model.flow.physics,m=p.mechanisms[0];
 model.flow.stop();model.flow.step(.025);assert.equal(m.omega,0);const angle=m.angle;
 m.omega=1;model.flow.step(.025);assert.ok(m.angle>angle);assert.ok(m.omega>0&&m.omega<1);
 const paused=structuredClone(m);model.flow.pause(true);model.flow.step(.05);assert.deepEqual(m,paused);
 model.flow.pause(false);model.flow.step(.025);assert.ok(m.angle>paused.angle&&m.omega<paused.omega);
});
test('response profile is opt-in for the current three-vane model; old fixtures retain old response',()=>{
 assert.equal(createBoardFlow({lcd:true,windmillShapeProfile:'photo-three-vane'}).flow.physics.mechanisms[0].responseProfile,undefined);
 assert.throws(()=>createBoardFlow({lcd:true,windmillResponseProfile:'coupled-impulse-v1'}));
 assert.throws(()=>createBoardFlow({lcd:true,windmillShapeProfile:'photo-three-vane',windmillResponseProfile:'unknown'}));
});
