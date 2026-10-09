import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {sourcePath,ROAD_SOURCE,RIGHT_ROAD_SOURCE} from '../src/pixi/source-layout.js';
test('left road has no bridging collision segments and an actual pin rebounds a falling ball',()=>{
 const m=createBoardFlow({lcd:true}),physics=m.flow.physics,points=sourcePath(ROAD_SOURCE);
 assert.equal(physics.colliders.filter(c=>c.role==='michi'&&c.a.x<=points.at(-1)[0]).length,0);
 const [x,y]=points[10],ball=physics.spawn({extra:true},.24);
 Object.assign(ball,{x,y:y-7,vx:0,vy:80,leftLaunchPlane:true});
 let rebound=false;
 for(let i=0;i<60;i++){m.flow.step(1/120);if(ball.contactRoles.includes('michi')&&ball.vy<0)rebound=true;}
 assert.ok(rebound,'the discrete road pin must visibly rebound a descending ball');
});
test('right road stays five separate pins without an invisible supporting wall',()=>{
 const m=createBoardFlow({lcd:true}),physics=m.flow.physics,points=sourcePath(RIGHT_ROAD_SOURCE);
 assert.equal(physics.colliders.filter(c=>c.role==='michi').length,0);
 for(const [x,y] of points)assert.ok(physics.pins.some(p=>p.role==='michi'&&p.x===x&&p.y===y));
 // The receiving tray now overlaps the probe's starting area. This test
 // isolates pin gaps; full-board tray drainage is covered by heso-calibration.
 const probe=bridged=>{
  const board=createBoardFlow({lcd:true}),p=board.flow.physics;
  p.colliders=p.colliders.filter(c=>c.role!=='heso-guide');
  const a=points[0],b=points[1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
  if(bridged)p.colliders.push({a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},r:.2,restitution:.46,role:'michi'});
  const ball=p.spawn({extra:true},.24),mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
  Object.assign(ball,{x:mx-nx*4,y:my-ny*4,vx:nx*80,vy:ny*80,leftLaunchPlane:true});
  let crossed=false;
  for(let i=0;i<20;i++){board.flow.step(1/120);if((ball.x-mx)*nx+(ball.y-my)*ny>0)crossed=true;}
  return crossed;
 };
 assert.equal(probe(false),true,'separate pins leave the midpoint traversable');
 assert.equal(probe(true),false,'the same probe detects an added invisible bridging segment');
});
