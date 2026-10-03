import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
const intersects=(a,b,c)=>{const rx=b.x-a.x,ry=b.y-a.y,sx=c.b.x-c.a.x,sy=c.b.y-c.a.y,den=rx*sy-ry*sx;if(Math.abs(den)<1e-9)return false;const qx=c.a.x-a.x,qy=c.a.y-a.y,t=(qx*sy-qy*sx)/den,u=(qx*ry-qy*rx)/den;return t>1e-8&&t<1-1e-8&&u>1e-8&&u<1-1e-8;};
const distance=(b,c)=>{const dx=c.b.x-c.a.x,dy=c.b.y-c.a.y,u=Math.max(0,Math.min(1,((b.x-c.a.x)*dx+(b.y-c.a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(b.x-c.a.x-u*dx,b.y-c.a.y-u*dy);};
test('a naturally launched ball leaves through the actual rail mouth before changing plane',()=>{
 const m=createBoardFlow({lcd:true}),p=m.flow.physics;m.setMode('normal');const b=p.spawn({extra:true},.24),advance=p.advanceBall.bind(p);let transfer=null;
 p.advanceBall=(ball,h,o)=>{const before={x:ball.x,y:ball.y,front:!!ball.leftLaunchPlane},prev=advance(ball,h,o);if(!before.front&&ball.leftLaunchPlane)transfer={...before,crossed:ball.launchExitCrossed,r:ball.r};return prev;};
 for(let i=0;i<2*120;i++)m.flow.step(1/120);
 assert.ok(transfer);assert.equal(transfer.crossed,true);
 const e=p.launchExit,progress=(transfer.x-e.a.x)*e.normal.x+(transfer.y-e.a.y)*e.normal.y;
 assert.ok(progress>=transfer.r+e.railRadius-1e-9);
});
for(const [power,interval] of [[.20,.6],[.24,.05]])test(`natural ${power}/${interval} stream cannot cross launch rails and drains`,()=>{
 const m=createBoardFlow({lcd:true,normalPower:power,launchInterval:interval}),p=m.flow.physics;m.setMode('normal');
 const rails=p.colliders.filter(c=>c.role.startsWith('launch-')),advance=p.advanceBall.bind(p);
 p.advanceBall=(b,h,o={})=>{const previous={x:b.x,y:b.y},out=advance(b,h,o);if(!o.predict)for(const c of rails)assert.equal(intersects(previous,b,c),false,`${c.role}: ball${b.id}`);return out;};
 m.flow.start();for(let i=0;i<20*120;i++){m.flow.step(1/120);for(const b of p.balls)for(const c of rails)assert.ok(b.r+c.r-distance(b,c)<=1e-6,`${c.role} retains ball${b.id} penetration`);}
 m.flow.stop();for(let i=0;i<30*120;i++)m.flow.step(1/120);
 assert.equal(p.balls.length,0);assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),p.metrics.spawned);
});
