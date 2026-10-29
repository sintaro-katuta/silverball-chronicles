import test from 'node:test';import assert from 'node:assert/strict';
import {feedbackOptions} from '../tools/s8-play-feedback.mjs';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {PROTECTED_TITLE_SOURCE,TITLE_SIDE_RAILS_SOURCE,protectedTitlePoint,PROTECTED_TITLE_SOLID} from '../src/pixi/left-title-guide.js';
import {sourcePath,sourcePoint} from '../src/pixi/source-layout.js';
import {circlePolygonContact} from '../src/physics/solid-polygon-contact.js';
import {withPhysicsTrace} from '../src/physics/passive-trace.js';
const make=()=>createBoardFlow({lcd:true,...feedbackOptions('pinned-title-rail'),leftTitleGuard:true,leftInletRoute:'legacy'});
test('visible title outline and side rails share contacts, keep all individual nails uncovered and no road rail',()=>{
 const p=make().flow.physics,base=createBoardFlow({lcd:true,...feedbackOptions('pinned-title-rail'),leftTitleGuard:false}).flow.physics,body={solid:PROTECTED_TITLE_SOLID};
 assert.equal(p.pins.length,101);assert.deepEqual(p.pins,base.pins);assert.equal(p.colliders.some(c=>c.pixelGuard),false);assert.equal(p.colliders.some(c=>c.role==='left-title-body'),false);
 assert.deepEqual(body.solid.points,sourcePath(PROTECTED_TITLE_SOURCE).map(([x,y])=>({x,y})));
 assert.ok(p.pins.every(pin=>!circlePolygonContact(pin,body.solid)));
 const rails=p.colliders.filter(c=>c.role==='left-inlet-guide'),expected=TITLE_SIDE_RAILS_SOURCE.flatMap(path=>{const q=sourcePath(path).map(([x,y])=>({x,y}));return q.slice(1).map((b,i)=>({a:q[i],b}));});assert.deepEqual(rails.map(({a,b})=>({a,b})),expected);
 for(const rail of rails)for(const pin of p.pins){const dx=rail.b.x-rail.a.x,dy=rail.b.y-rail.a.y,t=Math.max(0,Math.min(1,((pin.x-rail.a.x)*dx+(pin.y-rail.a.y)*dy)/(dx*dx+dy*dy)));assert.ok(Math.hypot(pin.x-rail.a.x-t*dx,pin.y-rail.a.y-t*dy)>2*p.ballRadius+pin.r+rail.r,`rail clearance at pin ${pin.id}`);}
 assert.ok(Math.max(...PROTECTED_TITLE_SOURCE.map(p=>p[1]))<550);assert.ok(TITLE_SIDE_RAILS_SOURCE.every(path=>path.at(-1)[1]===550));
 for(const id of [37,38]){const pin=p.pins.find(p=>p.id===id);assert.ok(pin.y-sourcePoint([0,550])[1]>2*p.ballRadius+.6+pin.r);}
 assert.ok(protectedTitlePoint([151,594])[1]<Math.max(...PROTECTED_TITLE_SOURCE.map(p=>p[1])));
 assert.throws(()=>createBoardFlow({leftTitleGuard:true}));assert.throws(()=>createBoardFlow({lcd:true,leftTitleGuard:1}));
});
test('front side-rail contact keeps a ball outside the title while rear launch balls stay separate',()=>{
 const m=make(),p=m.flow.physics,rail=p.colliders.filter(c=>c.role==='left-inlet-guide').find(c=>Math.abs(c.a.y-sourcePoint([0,407])[1])<1e-9),dx=rail.b.x-rail.a.x,dy=rail.b.y-rail.a.y,len=Math.hypot(dx,dy),n={x:-dy/len,y:dx/len};
 const x=(rail.a.x+rail.b.x)/2+n.x*3.5,y=(rail.a.y+rail.b.y)/2+n.y*3.5,rear={id:900,x,y,r:3,vx:80,vy:0,leftLaunchPlane:false,hits:0,contactCount:0};
 p.advanceBall(rear,0);assert.equal(rear.x,x);assert.equal(rear.y,y);assert.equal(rear.vx,80);
 const front={...rear,leftLaunchPlane:true};p.advanceBall(front,0);assert.ok(front.vx<0);assert.ok(Math.hypot(front.vx,front.vy)<=80);assert.equal(circlePolygonContact(front,PROTECTED_TITLE_SOLID),null);
});
test('continuous natural launches cannot enter the title and leave the side rails for the pin area',()=>{
 const m=make();m.setMode('normal');const p=m.flow.physics,body={solid:PROTECTED_TITLE_SOLID},passed=new Set(),contacts=new Set();let stop=null,intrusions=0;
 withPhysicsTrace(()=>{m.flow.start();for(let i=0;i<100*120;i++){if(p.metrics.spawned>=30&&stop===null){stop=p.time;m.flow.stop();}m.flow.step(1/120);if(stop!==null&&p.time-stop>45)break;}},e=>{
  if(e.type==='contact'&&e.part.role==='left-inlet-guide')contacts.add(e.before.id);
  if(e.type==='substep'&&e.stage==='after')for(const b of e.balls)if(b.front){const hit=circlePolygonContact(b,body.solid);if(hit&&hit.penetration>1e-5)intrusions++;if(b.y>sourcePoint([0,568.5])[1])passed.add(b.id);}
 });
 assert.equal(p.metrics.spawned,30);assert.equal(intrusions,0);assert.ok(contacts.size>=15);assert.equal(passed.size,30);assert.equal(m.flow.counts.returned,0);
 // Remaining balls in the separate road-pin investigation do not constitute acceptance here.
});
