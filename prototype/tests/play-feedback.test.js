import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {resolveVisibleWindmill} from '../src/physics/windmill-shape-contact.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {collideSegment} from '../src/physics/physics.js';
import {lcdGuardTiles} from '../src/pixi/lcd-guard-tiles.js';
const response=profile=>{const m={...createBoardFlow({lcd:true,windmillShapeProfile:'photo-three-vane',windmillResponseProfile:profile}).flow.physics.mechanisms[0],x:0,y:0,angle:0,omega:0};resolveVisibleWindmill({recordRole(){}},{id:1,x:6,y:2,vx:0,vy:-80,r:1.8},m);return m;};
test('light rotor responds strongly to a real blade impulse and coasts longer without changing geometry',()=>{
 const old=response('legacy'),light=response('light-rotor-v1');assert.ok(Math.abs(light.omega)>Math.abs(old.omega)*6);assert.equal(light.momentOfInertia,200);assert.equal(light.angularDamping,.35);assert.equal(light.radius,old.radius);
 const model=createBoardFlow({lcd:true,windmillShapeProfile:'photo-three-vane',windmillResponseProfile:'light-rotor-v1'}),m=model.flow.physics.mechanisms[0];m.omega=1;model.flow.step(.025);assert.ok(Math.abs(m.omega-Math.exp(-.025*.35))<1e-10);
});
test('soft road impact reduces upward rebound through the same normal and retains tangential motion',()=>{
 const run=restitution=>{const p=createBoardFlow({lcd:true,roadPinRestitution:restitution}).flow.physics;p.pins=[{id:3,role:'michi',x:80,y:491.75,r:.2,restitution}];const b={id:1,x:79.5,y:489.95,vx:0,vy:180,r:1.8,leftLaunchPlane:true};p.resolvePins(b,{predict:true});return b;};
 const old=run(.85),soft=run(.12);assert.ok(old.vy<0);assert.ok(Math.abs(soft.vy)<Math.abs(old.vy)*.2);assert.notEqual(soft.vx,0);assert.ok(soft.vx**2+soft.vy**2<=180**2);
 const p=createBoardFlow({lcd:true,roadPinRestitution:.12}).flow.physics;assert.ok(p.pins.filter(p=>p.id<=26).every(p=>p.restitution===.12));assert.ok(p.pins.filter(p=>p.id>26).every(p=>p.restitution!==.12));
});
test('launch calibration belongs to normal mode and restores right speed on every transition',()=>{
 const model=createBoardFlow({lcd:true,normalLaunchSpeedOffset:125});assert.equal(model.flow.physics.launchSpeedOffset,125);
 for(const mode of ['rush','bonus','right-closed']){model.setMode(mode);assert.equal(model.flow.physics.launchSpeedOffset,55);model.setMode('normal');assert.equal(model.flow.physics.launchSpeedOffset,125);}
 for(const value of [NaN,-1,201,'125'])assert.throws(()=>createBoardFlow({lcd:true,normalLaunchSpeedOffset:value}));
});
test('stepped guard faces are anchored to the actual LCD contact outline and leave physics untouched',()=>{
 const p=createBoardFlow({lcd:true}).flow.physics,before=structuredClone(p.colliders),tiles=lcdGuardTiles(p);assert.ok(tiles.length>15);
 for(const tile of tiles){const c=p.colliders.find(c=>c.role===tile.role),dx=c.b.x-c.a.x,dy=c.b.y-c.a.y,length=Math.hypot(dx,dy);
  for(const point of [tile.a,tile.b]){const outward=((point.x-c.a.x)*dy-(point.y-c.a.y)*dx)/length;assert.ok(Math.abs(outward-c.r)<1e-9);}
  assert.ok(tile.depth>tile.contactRadius);assert.ok(Math.hypot(tile.a.x-tile.b.x,tile.a.y-tile.b.y)<=10+1e-9);
 }
 assert.deepEqual(p.colliders,before);
});

test('visible metal guards support a large ball smoothly and preserve two passable spill gaps',()=>{
 const p=createBoardFlow({lcd:true,...productionBoardFlowOptions(),ballRadius:3,pixelRoadGuards:true}).flow.physics,guards=p.colliders.filter(c=>c.pixelGuard),tiles=lcdGuardTiles(p);assert.equal(guards.length,3);assert.ok(tiles.every(t=>t.role.startsWith('pixel-road-guard-')));
 for(const c of guards){const n=c.guardNormal,face={x:(c.a.x+c.b.x)/2+n.x*c.r,y:(c.a.y+c.b.y)/2+n.y*c.r},b={x:face.x+n.x*(p.ballRadius-.02),y:face.y+n.y*(p.ballRadius-.02),r:p.ballRadius,vx:0,vy:80};assert.ok(collideSegment(b,c.a,c.b,c.restitution,undefined,c.r)>0);assert.ok(b.vy>0&&b.vx>0);assert.ok(Math.abs((b.x-face.x)*n.x+(b.y-face.y)*n.y-p.ballRadius)<1e-9);
  for(const tile of tiles.filter(t=>t.role===c.role))for(const point of [tile.a,tile.b])assert.ok(Math.abs((point.x-c.a.x)*n.x+(point.y-c.a.y)*n.y-c.r)<1e-9);
 }
 for(let i=1;i<guards.length;i++)assert.ok(Math.hypot(guards[i].a.x-guards[i-1].b.x,guards[i].a.y-guards[i-1].b.y)-guards[i].r-guards[i-1].r>p.ballRadius*2);
 assert.throws(()=>createBoardFlow({pixelRoadGuards:true}));assert.throws(()=>createBoardFlow({lcd:true,pixelRoadGuards:1}));
});
