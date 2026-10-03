import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
for(const interval of [.6,.05])test(`traced right channel guides physical balls and drains at ${interval}s`,()=>{
 const m=createBoardFlow({lcd:true,launchInterval:interval});m.setMode('right-closed');m.flow.start();
 const exits=[];const lose=m.flow.game.lose.bind(m.flow.game);
 m.flow.game.lose=b=>{exits.push({x:b.x,y:b.y});lose(b);};
 const contacts=new Set();const advance=m.flow.physics.advanceBall.bind(m.flow.physics);
 m.flow.physics.advanceBall=(b,dt,options={})=>{const prev=advance(b,dt,options);if(!options.predict&&b.lastContact?.startsWith('right-channel-'))contacts.add(b.id);return prev;};
 for(let i=0;i<12*120;i++)m.flow.step(1/120);
 assert.ok(contacts.size>=10,'balls must contact the visible resin channel');
 m.flow.stop();for(let i=0;i<15*120;i++)m.flow.step(1/120);
 assert.equal(m.flow.physics.balls.length,0);
 assert.equal(exits.length+m.flow.counts.fuzu+m.flow.counts.normal+m.flow.counts.start+m.flow.counts.returned,m.flow.physics.metrics.spawned);
 assert.ok(exits.every(p=>p.y>668),'misses must drain below the playfield');
 assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),m.flow.physics.metrics.spawned);
 // The sensor counts captured fuzu balls, never every upper-right passage.
 assert.equal(m.gate.snapshot().count,m.flow.counts.fuzu);
});
for(const normalPower of [.20,.24,.28])test(`lower resin rim leaves normal pocket discharge clear at power ${normalPower}`,()=>{
 const m=createBoardFlow({lcd:true,normalPower});m.setMode('normal');m.flow.start();
 for(let i=0;i<30*120;i++)m.flow.step(1/120);
 m.flow.stop();for(let i=0;i<20*120;i++)m.flow.step(1/120);
 assert.equal(m.flow.physics.balls.length,0);
 assert.equal(Object.values(m.flow.counts).reduce((a,b)=>a+b,0),m.flow.physics.metrics.spawned);
});
