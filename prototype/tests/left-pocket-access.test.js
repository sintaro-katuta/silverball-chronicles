import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
test('all three left ordinary receivers admit a physical ball through their visible mouth',()=>{
 const m=createBoardFlow({lcd:true});m.setMode('normal');const pockets=m.flow.physics.pockets.filter(p=>p.kind==='normal');assert.equal(pockets.length,3);assert.deepEqual(pockets.map(p=>p.id),[0,1,2]);
 const admitted=new Set(),hit=m.flow.game.hit.bind(m.flow.game);m.flow.game.hit=(b,kind,id)=>{if(kind==='normal')admitted.add(id);hit(b,kind,id);};
 for(const pocket of pockets){const b=m.flow.physics.spawn({hits:0},0);Object.assign(b,{x:pocket.x,y:pocket.y-4,vx:0,vy:40,leftLaunchPlane:true});for(let i=0;i<120;i++)m.flow.step(1/120);assert.ok(admitted.has(pocket.id),`receiver ${pocket.id} must accept through its own opening`);}
 assert.equal(m.flow.physics.balls.length,0);assert.equal(m.flow.counts.normal,pockets.length);
 assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),m.flow.physics.metrics.spawned);
});
