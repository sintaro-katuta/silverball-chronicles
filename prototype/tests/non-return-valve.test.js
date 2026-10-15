import test from 'node:test';import assert from 'node:assert/strict';
import {collideNonReturnValve,Physics} from '../src/physics/physics.js';import {createBoardFlow} from '../src/pixi/board-flow.js';
const make=()=>createBoardFlow({lcd:true,launchRailProfile:'reference-exit',leftAdmissionGuides:false,hesoMouthWidth:12,ballRadius:1.8});
const valve=()=>make().flow.physics.colliders.find(c=>c.nonReturnValve);
const tangent=c=>{const x=c.b.x-c.a.x,y=c.b.y-c.a.y,l=Math.hypot(x,y);return {x:x/l,y:y/l,l};};
const signed=(c,b)=>(b.x-c.a.x)*c.normal.x+(b.y-c.a.y)*c.normal.y;
const speed=(c,b)=>b.vx*c.normal.x+b.vy*c.normal.y;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const ball=(c,d=2,offset=0,v=-100,o={})=>{const t=tangent(c);return {id:1,x:(c.a.x+c.b.x)/2+c.normal.x*d+t.x*offset,y:(c.a.y+c.b.y)/2+c.normal.y*d+t.y*offset,r:1.8,vx:c.normal.x*v,vy:c.normal.y*v,leftLaunchPlane:true,...o};};
test('finite valve passes back-plane launch unchanged and reverses front contact using existing restitution',()=>{
 const c=valve(),back=ball(c,-.1,0,100,{leftLaunchPlane:false}),before={...back};assert.equal(collideNonReturnValve(back,c),0);assert.deepEqual(back,before);
 const front=ball(c);near(collideNonReturnValve(front,c),100);near(signed(c,front),2.5);near(speed(c,front),5);
 const outgoing=ball(c,2,0,100);collideNonReturnValve(outgoing,c);near(speed(c,outgoing),100);
});
test('finite endcaps do not stop outside balls and diagonal endpoint contact has local normal',()=>{
 const c=valve(),t=tangent(c),outside=ball(c,0,-t.l/2-2.50001),before={...outside};assert.equal(collideNonReturnValve(outside,c),0);assert.deepEqual(outside,before);
 const diagonal=ball(c,1,-t.l/2-1);diagonal.vx+=t.x*100;diagonal.vy+=t.y*100;assert.ok(collideNonReturnValve(diagonal,c)>0);assert.ok(signed(c,diagonal)>0);assert.ok(speed(c,diagonal)>0);
});
const isolated=()=>{const m=make(),p=m.flow.physics,c=p.colliders.find(c=>c.nonReturnValve);p.advanceBall=Physics.prototype.advanceBall;p.colliders=[c];p.pins=[];p.pockets=[];p.mechanisms=[];p.gate.active=false;p.rightChucker.scoop.active=false;p.rightChucker.cover.active=false;return {m,p,c};};
test('unchanged speed-dependent substeps prevent fast reverse penetration through diagonal finite mouth',()=>{
 const {m,p,c}=isolated(),b=p.spawn({extra:true},.20);Object.assign(b,ball(c,12,0,-2000,{id:b.id}));p.step(.02,m.flow.game);assert.ok(signed(c,b)>=b.r+c.r-1e-9);assert.ok(speed(c,b)>0);assert.ok(p.nonReturnValve.reverseContacts>0);assert.equal(b.leftLaunchPlane,true);
});
test('same-plane pair separation touching valve resolves on front rather than rear face',()=>{
 const {m,p,c}=isolated(),a=p.spawn({extra:true},.20),b=p.spawn({extra:true},.20);Object.assign(a,ball(c,2.6,0,0,{id:a.id}));Object.assign(b,ball(c,5.8,0,-100,{id:b.id}));p.step(1/600,m.flow.game);assert.ok(p.metrics.ballContacts>0);assert.ok(signed(c,a)>=a.r+c.r-1e-9);assert.ok(signed(c,b)>=b.r+c.r-1e-9);assert.ok(p.nonReturnValve.reverseContacts>0);
 const overlap=ball(c,-.2);collideNonReturnValve(overlap,c);near(signed(c,overlap),2.5);
});
test('natural forward ball clears both observation plane and actual diagonal valve before front transfer',()=>{
 const m=make(),p=m.flow.physics,b=p.spawn({extra:true},.20);let transition=null;const advance=p.advanceBall.bind(p);p.advanceBall=(b,dt,opt)=>{const old={x:b.x,y:b.y,front:!!b.leftLaunchPlane,valveCrossed:!!b.nonReturnValveCrossed},r=advance(b,dt,opt);if(!old.front&&b.leftLaunchPlane)transition={old,now:{x:b.x,y:b.y,vx:b.vx,vy:b.vy}};return r;};for(let i=0;i<4*120;i++)m.flow.step(1/120);assert.ok(transition);assert.ok(transition.old.y<=p.launchExit.a.y-b.r-p.launchExit.railRadius+1e-9);assert.equal(transition.old.valveCrossed,true);assert.ok(signed(p.nonReturnValve,transition.old)>=b.r+p.nonReturnValve.radius-1e-9);assert.ok(speed(p.nonReturnValve,transition.now)>0);assert.equal(p.nonReturnValve.forwardPasses,1);assert.equal(p.nonReturnValve.reverseContacts,0);
 const legacy=createBoardFlow({lcd:true,ballRadius:1.8});assert.equal(legacy.flow.physics.nonReturnValve,undefined);assert.equal(legacy.flow.physics.colliders.some(c=>c.nonReturnValve),false);
});
