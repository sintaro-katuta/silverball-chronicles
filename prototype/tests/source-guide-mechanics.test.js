import {LCD_PIN_HEAD_CONTACT_RADIUS} from '../src/domain/pin-dimensions.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {sourceBoardSurfaces} from '../src/pixi/source-board-surfaces.js';
import {sourcePath} from '../src/pixi/source-layout.js';
import {circlePolygonContact} from '../src/physics/solid-polygon-contact.js';
const board=()=>createBoardFlow({lcd:true,...productionBoardFlowOptions()});
test('decorative connection retains authored endpoints while rounded art remains visible',()=>{
 const p=board().flow.physics,path=id=>p.sourceGuidePaths.find(q=>q.id===id),bridge=p.sourceGuideBridge;
 assert.deepEqual(bridge.points,[path('left-title-edge').points.at(-1),path('left-return').points.at(-1),path('apron-outer').points[0]]);
 const segments=p.colliders.filter(c=>c.sourceGuideId===bridge.id);
 assert.equal(segments.length,2);assert.deepEqual(segments[0].b,segments[1].a);
 assert.ok(p.colliders.filter(c=>c.sourceGuideId==='left-return').every(c=>c.active===false&&c.contactRole==='decoration'));
 const art=sourceBoardSurfaces(p);assert.deepEqual(art.returnDecoration,path('left-return').points);assert.equal(art.guideMechanicsProfile,'continuous-source-v1');
 assert.deepEqual(art.strips.find(s=>s.id===bridge.id).points,bridge.points);
});
test('the guessed entrance bridge and terminal stub no longer trap a full-size ball',()=>{
 const p=board().flow.physics,parts=p.colliders.filter(c=>c.sourceGuideId==='left-guide-bridge'||c.sourceGuideId==='left-title-edge'&&c.sourceGuideSegment===22);
 assert.equal(parts.length,3);assert.ok(parts.every(c=>c.active===false&&c.contactRole==='decoration'));
 assert.equal(p.ballRadius,3);p.colliders=parts;p.pins=[];p.mechanisms=[];p.sourceStage=null;
 const b={id:1,x:70,y:437,vx:100,vy:0,r:3,contactCount:0,leftLaunchPlane:true};for(let i=0;i<120;i++)p.advanceBall(b,1/1200);assert.ok(b.x>79.9);assert.equal(b.contactCount,0);
});
test('upper character contact follows the rendered solid and leaves the rear launch plane clear',()=>{
 const p=board().flow.physics,c=p.colliders.find(c=>c.role==='upper-character-body');assert.equal(c.playfieldOnly,true);
 assert.deepEqual(c.solid.points,sourcePath(sourceBoardSurfaces(p).upperRelief).map(([x,y])=>({x,y})));
 p.colliders=[c];p.pins=[];p.mechanisms=[];
 const b={id:1,x:150,y:260,vx:0,vy:0,r:3,contactCount:0,leftLaunchPlane:true};assert.ok(circlePolygonContact(b,c.solid)?.inside);p.advanceBall(b,1/1200);assert.equal(circlePolygonContact(b,c.solid),null);
 const rear={id:2,x:150,y:260,vx:0,vy:0,r:3,contactCount:0,leftLaunchPlane:false};p.advanceBall(rear,1/1200);assert.equal(rear.x,150);assert.ok(Math.abs(rear.y-260)<.001);assert.ok(circlePolygonContact(rear,c.solid)?.inside);
});

test('user-specified upper slope is solid while the lower apron contour is decoration',()=>{
 const p=board().flow.physics,slope=p.colliders.find(c=>c.sourceGuideId==='user-left-slope');
 assert.deepEqual(p.sourceSlopeGuide.points,[[218.7,677],[408,766.9]]);
 const [a,b]=sourcePath(p.sourceSlopeGuide.points).map(([x,y])=>({x,y}));assert.deepEqual(slope.a,a);assert.deepEqual(slope.b,b);
 assert.ok(p.colliders.filter(c=>c.sourceGuideId==='apron-outer').every(c=>c.active===false&&c.contactRole==='decoration'));
 const art=sourceBoardSurfaces(p);assert.deepEqual(art.strips.find(s=>s.id==='user-left-slope').points,p.sourceSlopeGuide.points);
 // An actual circle crosses the old outer edge, but responds at the new slope.
 const old=p.colliders.find(c=>c.sourceGuideId==='apron-outer'&&c.sourceGuideSegment===2);
 p.colliders=[old,slope];p.pins=[];p.mechanisms=[];
 function probe(c){const dx=c.b.x-c.a.x,dy=c.b.y-c.a.y,len=Math.hypot(dx,dy),nx=dy/len,ny=-dx/len;
 const b={id:1,x:(c.a.x+c.b.x)/2+nx*5,y:(c.a.y+c.b.y)/2+ny*5,vx:-nx*100,vy:-ny*100,r:3,contactCount:0,leftLaunchPlane:true};
 for(let i=0;i<120;i++)p.advanceBall(b,1/1200);
 return{b,signed:(b.x-c.a.x)*nx+(b.y-c.a.y)*ny};}
 const through=probe(old);assert.ok(through.signed<0);assert.notEqual(through.b.lastContact,old.role);
 const stopped=probe(slope);assert.ok(stopped.signed>=3.5-1e-7);assert.equal(stopped.b.lastContact,'user-left-slope');
});

test('road contacts match the existing visible head size without moving pins or changing ball diameter',()=>{
 const p=board().flow.physics;assert.equal(p.ballRadius,3);assert.equal(p.pinContactFriction,.5);assert.equal(p.pinFrictionAt({x:300}),0);
 assert.equal(p.roadPinContactProfile,'visible-head-v1');for(const pin of p.pins){if(pin.id<=26){assert.equal(pin.r,LCD_PIN_HEAD_CONTACT_RADIUS);assert.equal(pin.shaftRadius,.2);assert.equal(pin.restitution,.12);}else if(pin.id>=97&&pin.id<=101){assert.equal(pin.r,LCD_PIN_HEAD_CONTACT_RADIUS);assert.equal(pin.shaftRadius,.2);assert.equal(pin.contactFriction,.5);}else assert.equal(pin.r,.2);}
});

test('head contact preserves both authored road spill gaps for the unchanged ball diameter',()=>{
 const p=board().flow.physics;for(const [a,b]of [[10,11],[22,23]]){const x=p.pins.find(q=>q.id===a),y=p.pins.find(q=>q.id===b);assert.ok(Math.hypot(x.x-y.x,x.y-y.y)-x.r-y.r>p.ballRadius*2);}
});
