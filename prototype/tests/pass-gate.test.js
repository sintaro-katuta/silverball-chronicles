import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachPassGate} from '../src/pixi/pass-gate.js';
import {SessionGame} from '../src/domain/session-game.js';
test('fuzu sensor counts only captured admissions, never upper passage or other prizes',()=>{
 const flow={physics:{time:1},game:{hit(){}}},gate=attachPassGate(flow);
 flow.game.hit({id:1},'normal',0);assert.equal(gate.snapshot().count,0);
 flow.game.hit({id:2},'fuzu',8);assert.equal(gate.snapshot().count,1);
 flow.game.hit({id:2},'fuzu',8);assert.equal(gate.snapshot().count,1);
 assert.equal(gate.snapshot().kind,'fuzu-inlet');
});
test('captured fuzu ball pays one without becoming a tokuzu draw in legacy adapter',()=>{
 const g=new SessionGame(()=>.9);g.hit({id:2},'fuzu',8);
 assert.equal(g.total,1);assert.equal(g.drawSerial,0);assert.ok(g.accounting.reconciled);
});
for(const interval of [.6,.05])for(const mode of ['right-closed','rush','bonus'])test(`fuzu observation preserves ${mode} flow at ${interval}s`,()=>{
 const a=createBoardFlow({lcd:true,launchInterval:interval}),b=createBoardFlow({lcd:true,launchInterval:interval,passGate:false});
 for(const m of [a,b]){m.setMode(mode);m.flow.start();}
 for(let i=0;i<20*120;i++)for(const m of [a,b])m.flow.step(1/120);
 assert.deepEqual(a.flow.physics.balls,b.flow.physics.balls);assert.deepEqual(a.flow.counts,b.flow.counts);
 assert.equal(a.gate.snapshot().count,a.flow.counts.fuzu);
 for(const m of [a,b]){m.flow.stop();m.setMode('right-closed');for(let i=0;i<30*120;i++)m.flow.step(1/120);assert.equal(m.flow.physics.balls.length,0);assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),m.flow.physics.metrics.spawned);}
});
test('lower fuzu opening captures a real ball exactly once and reaches the session award',async()=>{
 const {attachNormalSpin}=await import('../src/pixi/normal-spin-flow.js');
 const model=createBoardFlow({lcd:true}),g=new SessionGame(()=>.9);
 attachNormalSpin(model.flow,{sessionGame:g});
 const p=model.flow.physics.pockets.find(p=>p.kind==='fuzu');
 const ball=model.flow.physics.spawn({hits:0},0);
 Object.assign(ball,{x:p.x,y:p.y-4,vx:0,vy:40,leftLaunchPlane:true});
 for(let i=0;i<120;i++)model.flow.step(1/120);
 assert.equal(model.flow.counts.fuzu,1);
 assert.equal(model.gate.snapshot().count,1);
 assert.equal(model.flow.physics.metrics.fuzu,1);
 assert.equal(g.total,1);assert.equal(g.drawSerial,0);
 assert.equal(model.flow.physics.balls.length,0);
});
