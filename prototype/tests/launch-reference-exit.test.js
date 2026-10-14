import {collideSolidPolygon} from '../src/physics/solid-polygon-contact.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {Physics} from '../src/physics/physics.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {boardRailGeometry,INNER_ARC,OUTER_ARC,LAUNCH_EXIT} from '../src/pixi/board-rails.js';
import {LAUNCH_EXIT_CONTACT_SOURCE,LAUNCH_EXIT_VISIBLE_SOURCE,sourcePath} from '../src/pixi/source-layout.js';
const make=profile=>createBoardFlow({lcd:true,launchRailProfile:profile,leftAdmissionGuides:false,hesoMouthWidth:12,ballRadius:1.8});
test('legacy geometry retains original arcs; reference visible bands replace estimated upper centerlines',()=>{
 const old=boardRailGeometry();assert.equal(old.inner,INNER_ARC);assert.equal(old.outer,OUTER_ARC);assert.equal(old.exit,LAUNCH_EXIT);
 const next=boardRailGeometry('reference-exit');assert.equal(next.reference.retainedLegacyInnerThroughIndex,null);assert.equal(next.reference.supersededContactSource,true);assert.deepEqual(next.exit.a,{x:70,y:264});assert.deepEqual(next.exit.b,{x:57.25,y:264});assert.equal(next.exit.railRadius,0);assert.equal(next.exit.normal.y,-1);assert.ok(next.exit.width>3.6);assert.throws(()=>boardRailGeometry('invented'));
});
test('reference geometry leaves all original101 pins and physical launch/material settings unchanged, unknown static mark has no invented force; only user-described finite valve adds contact',()=>{
 const a=make('legacy').flow.physics,b=make('reference-exit').flow.physics;for(const key of ['pins','pockets','mechanisms','gate','rightChucker','ballRadius','launchSpeedOffset','displayBallScale','displayBallDiameter','outlet','returnOutlet'])assert.deepEqual(b[key],a[key],key);assert.equal(b.pins.length,101);assert.deepEqual(b.colliders.filter(c=>!c.role.startsWith('launch-')),a.colliders.filter(c=>!c.role.startsWith('launch-')));assert.equal(b.colliders.filter(c=>c.shape==='solid-polygon').length,5);assert.ok(b.colliders.filter(c=>c.role==='launch-inner-arc').every(c=>c.r===.7&&c.restitution===.05));assert.deepEqual(b.launchRailReference.visibleSource,LAUNCH_EXIT_VISIBLE_SOURCE);assert.ok(!b.colliders.some(c=>c.role.includes('mark')||c.role.includes('component')));
 const x=a.spawn({hits:0},.20),y=b.spawn({hits:0},.20);assert.deepEqual(y,x);
});
test('naturally launched single balls cross the inferred opening before front-plane transfer in all three modes',()=>{
 for(const mode of ['normal','rush','bonus']){const m=make('reference-exit'),p=m.flow.physics;m.setMode(mode);const ball=p.spawn({hits:0},mode==='normal'?.20:.85),advance=p.advanceBall.bind(p);let transfer=null;p.advanceBall=(b,h,o)=>{const before={x:b.x,y:b.y,front:!!b.leftLaunchPlane};const result=advance(b,h,o);if(!before.front&&b.leftLaunchPlane)transfer={...before,crossed:!!b.launchExitCrossed,r:b.r};return result;};for(let i=0;i<15*120;i++)m.flow.step(1/120);assert.ok(transfer,mode);assert.equal(transfer.crossed,true,mode);const e=p.launchExit,d=(transfer.x-e.a.x)*e.normal.x+(transfer.y-e.a.y)*e.normal.y;assert.ok(d>=transfer.r+e.railRadius-1e-9,mode);assert.equal(p.balls.length,0,mode);assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),1,mode);}
});
test('reference local rail clears all original pin shafts, including existing legacy overlap at36',()=>{
 const distance=(p,c)=>{const dx=c.b.x-c.a.x,dy=c.b.y-c.a.y,t=Math.max(0,Math.min(1,((p.x-c.a.x)*dx+(p.y-c.a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-c.a.x-t*dx,p.y-c.a.y-t*dy);};
 const legacy=make('legacy').flow.physics,reference=make('reference-exit').flow.physics,overlaps=p=>p.pins.flatMap(pin=>p.colliders.filter(c=>{if(!c.role.startsWith('launch-'))return false;if(c.shape==='solid-polygon'){const q={x:pin.x,y:pin.y,r:pin.r,vx:0,vy:0};collideSolidPolygon(q,c);return Math.hypot(q.x-pin.x,q.y-pin.y)>1e-9;}return distance(pin,c)<pin.r+c.r-1e-9;}).map(c=>({pin:pin.id,role:c.role})));
 assert.ok(overlaps(legacy).some(x=>x.pin===36));assert.deepEqual(overlaps(reference),[]);assert.deepEqual(reference.pins,legacy.pins);
});

// Isolate pair interaction from static contacts: both balls fall equally under
// unchanged gravity; only physical front/back flags and profile differ.
const pairTrial=(profile,fronts)=>{
 const m=make(profile),p=m.flow.physics;p.advanceBall=Physics.prototype.advanceBall;p.colliders=[];p.pins=[];p.pockets=[];p.mechanisms=[];p.gate.active=false;p.rightChucker.scoop.active=false;p.rightChucker.cover.active=false;
 const a=p.spawn({extra:true},.20),b=p.spawn({extra:true},.20);Object.assign(a,{x:200,y:350,vx:10,vy:0,leftLaunchPlane:fronts[0],launchExitCrossed:false});Object.assign(b,{x:203,y:350,vx:-10,vy:0,leftLaunchPlane:fronts[1],launchExitCrossed:false});p.step(1/600,m.flow.game);return {contacts:p.metrics.ballContacts,balls:p.balls.map(({x,y,vx,vy})=>({x,y,vx,vy}))};
};
test('reference-exit excludes cross-plane pair only, preserves original same-plane impulse and legacy behavior',()=>{
 const cross=pairTrial('reference-exit',[true,false]);assert.equal(cross.contacts,0);assert.equal(cross.balls[0].vx,10);assert.equal(cross.balls[1].vx,-10);
 for(const fronts of [[true,true],[false,false]]){const reference=pairTrial('reference-exit',fronts),legacy=pairTrial('legacy',fronts);assert.ok(reference.contacts>0);assert.deepEqual(reference,legacy);assert.ok(reference.balls[0].vx<0);assert.ok(reference.balls[1].vx>0);}
 const oldCross=pairTrial('legacy',[true,false]);assert.ok(oldCross.contacts>0);assert.deepEqual(oldCross,pairTrial('legacy',[true,true]));
});

test('retained clipped rail has no invented end cap; continuous outside side and legacy cap remain',async()=>{
 const {collideRailSegment,collideSegment}=await import('../src/physics/physics.js');
 const c={a:{x:37,y:338},b:{x:38,y:335},r:.7,restitution:.05,excludeCapB:true,excludedSurfaceYRange:{min:242.5,max:335}};
 const cap={x:38,y:333,r:1.8,vx:0,vy:20},before={...cap};assert.equal(collideRailSegment(cap,c),0);assert.deepEqual(cap,before);
 const side={x:35.5,y:337,r:1.8,vx:20,vy:0};assert.ok(collideRailSegment(side,c)>0);assert.notEqual(side.x,35.5);
 const legacy={...before};assert.ok(collideSegment(legacy,c.a,c.b,c.restitution,undefined,c.r)>0);
 const p=make('reference-exit').flow.physics;const cuts=p.colliders.filter(c=>c.excludeCapA||c.excludeCapB);assert.ok(cuts.length>=2);for(const c of cuts)assert.ok(c.excludedSurfaceYRange);
});

test('reference launch hold ignores front playfield overlap but retains actual rear barrel obstruction and legacy rule',()=>{
 for(const profile of ['reference-exit','legacy']){
  const p=make(profile).flow.physics;p.balls=[{id:1,x:34.017,y:316.974,r:1.8,vx:-3.77,vy:8.66,dead:false,leftLaunchPlane:true}];assert.equal(p.canLaunch(),profile==='reference-exit');
  p.balls[0].leftLaunchPlane=false;assert.equal(p.canLaunch(),false);
  p.balls[0]={...p.balls[0],x:p.launcher.origin.x,y:p.launcher.origin.y,leftLaunchPlane:false,vy:-20};assert.equal(p.canLaunch(),false);
 }
});

test('existing visible U strips and body contact front balls only, while launch back and white opening remain traversable',()=>{
 const p=make('reference-exit').flow.physics,solids=p.colliders.filter(c=>c.playfieldOnly&&c.shape==='solid-polygon');assert.deepEqual(solids.map(c=>c.sourceComponentId),['upper-rim-left','upper-rim-right','black-valve-body']);
 const points=[[57.97378392584559,271.2930595988443],[65.107493834361,274.0451645110667],[64.00229675198771,270.06211363152494]];
 for(let i=0;i<solids.length;i++){
  const [x,y]=points[i],base={id:1,x,y,r:1.8,vx:0,vy:0,hits:0,contactCount:0,launchExitCrossed:true,nonReturnValveCrossed:true};
  const front={...base,leftLaunchPlane:true};p.advanceBall(front,0);assert.ok(Math.hypot(front.x-x,front.y-y)>0,solids[i].sourceComponentId);
  const rear={...base,leftLaunchPlane:false,launchExitCrossed:false,nonReturnValveCrossed:false};p.advanceBall(rear,0);assert.equal(rear.x,x);assert.equal(rear.y,y);
 }
 assert.ok(!p.colliders.some(c=>c.sourceComponentId==='white-mark'));const legacy=make('legacy').flow.physics;assert.ok(!legacy.colliders.some(c=>c.sourceComponentId));
});
