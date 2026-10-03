import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {LEFT_INLET_GUIDES_SOURCE,sourcePath} from '../src/pixi/source-layout.js';
test('reference inlet guides share their visible coordinates and feed falling left shots downstream',()=>{
 const m=createBoardFlow({lcd:true});m.setMode('normal');const p=m.flow.physics;
 const guides=p.colliders.filter(c=>c.role==='left-inlet-guide');
 const expected=LEFT_INLET_GUIDES_SOURCE.flatMap(path=>{const q=sourcePath(path);return q.slice(1).map((b,i)=>({a:{x:q[i][0],y:q[i][1]},b:{x:b[0],y:b[1]}}));});
 assert.deepEqual(guides.map(({a,b})=>({a,b})),expected);
 const touched=new Set(),passed=new Set(),advance=p.advanceBall.bind(p);
 p.advanceBall=(b,dt,o={})=>{const prev=advance(b,dt,o);if(!o.predict){if(b.lastContact==='left-inlet-guide')touched.add(b.id);if(prev.y<410&&b.y>=410&&b.x>32&&b.x<90)passed.add(b.id);}return prev;};
 m.flow.start();for(let i=0;i<20*120;i++)m.flow.step(1/120);m.flow.stop();for(let i=0;i<30*120;i++)m.flow.step(1/120);
 assert.ok(touched.size>p.metrics.spawned/2);assert.ok(passed.size>p.metrics.spawned/2);
 assert.equal(p.balls.length,0);assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),p.metrics.spawned);
 console.log(JSON.stringify({shots:p.metrics.spawned,guideContact:touched.size,downstream:passed.size}));
});
test('a front-plane ball rebounds from the visible inner launch rail instead of passing through',()=>{
 const m=createBoardFlow({lcd:true}),p=m.flow.physics,b=p.spawn({extra:true},.24);
 // Start in the clear space between the rail and inlet. The previous fixture
 // at (47.70,310.51) began inside the restored rail/inlet capsule corridor.
 Object.assign(b,{x:40,y:350,vx:-80,vy:10,leftLaunchPlane:true});
 for(let i=0;i<8;i++)m.flow.step(1/120);
 assert.equal(b.lastContact,'launch-inner-arc');assert.ok(Math.abs(b.vx)<80);
 for(let i=0;i<15*120;i++)m.flow.step(1/120);
 assert.equal(p.balls.length,0);assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),1);
});
