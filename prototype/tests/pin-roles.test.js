import test from 'node:test';
import assert from 'node:assert/strict';
import {Physics} from '../src/physics/physics.js';
import {Game,freshProfile} from '../src/domain/game.js';

test('life nail clearances physically change admission for independent incoming balls',()=>{
 const sample=halfGap=>{let starts=0;for(let n=0;n<=40;n++){const g=new Game(freshProfile()),p=new Physics();p.pins=p.pins.filter(pin=>pin.role==='heso');p.pins[0].x=210-halfGap;p.pins[1].x=210+halfGap;p.mechanisms=[];g.hit=(b,kind)=>{if(kind==='start')starts++;};p.balls.push({id:1,x:190+n,y:500,vx:0,vy:100,r:4.6,age:0,hits:0});for(let i=0;i<1200&&p.balls.length;i++)p.step(1/120,g);}return starts;};
 assert.equal(sample(6),0);const normal=sample(10.5),wide=sample(15);assert.ok(normal>0);assert.ok(wide>normal);
});

test('normal launches reach the start through the role-based board without lifetime cleanup',()=>{for(let c=0;c<3;c++){const g=new Game(freshProfile(),c,()=>.6),p=new Physics(c);let starts=0,expired=0;g.hit=(b,k)=>{if(k==='start')starts++;};g.lose=b=>{if(b.age>=18)expired++;};for(let n=0;n<200;n++){p.spawn({hits:0},.57,Math.sin(n*.084)*.12);for(let i=0;i<72;i++)p.step(1/120,g);}for(let i=0;i<2400;i++)p.step(1/120,g);assert.ok(starts>0,`course ${c}`);assert.equal(expired,0);assert.equal(p.balls.length,0);}});

test('flow diagnostics retain role-to-pocket and role-to-out evidence with bounded route signatures',()=>{const g=new Game(freshProfile(),0,()=>.6),p=new Physics();g.hit=()=>{};g.lose=()=>{};for(let n=0;n<200;n++){p.spawn({hits:0},p.normalPower);for(let i=0;i<72;i++)p.step(1/120,g);}for(let i=0;i<2400&&p.balls.length;i++)p.step(1/120,g);const d=p.diagnostics();assert.ok(d.roleFlow.michi.start>0);assert.ok(d.roleFlow.yori.start>0);assert.ok(d.roleFlow.windmill.start>0);assert.ok(d.roleFlow.heso.start>0);assert.ok(d.roleFlow.michi.out>0);assert.ok(Object.keys(d.routeFlow).length<=65);assert.equal(Object.values(d.routeFlow).reduce((sum,route)=>sum+Object.values(route).reduce((a,b)=>a+b,0),0),200);for(const role of Object.values(d.roleFlow))assert.equal(role.balls,role.start+role.normal+role.bonus+role.out+role.returned);});
