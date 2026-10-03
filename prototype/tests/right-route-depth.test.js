import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {rightRouteDepth,projectRightRoute} from '../src/pixi/right-resin-route.js';
test('source-diagram route renders balls at their physical positions without the former depth offset',()=>{
 for(let y=230;y<=600;y++){const p={x:370,y};assert.equal(rightRouteDepth(p),0);assert.deepEqual(projectRightRoute(p),p);}
});
test('right route advances real balls and pause freezes their physical/display coordinates',()=>{
 const m=createBoardFlow({lcd:true});m.setMode('rush');m.flow.start();for(let i=0;i<12*120;i++)m.flow.step(1/120);
 assert.ok(m.flow.physics.metrics.spawned>=10);const positions=structuredClone(m.flow.physics.balls);m.flow.pause(true);m.flow.step(.05);assert.deepEqual(m.flow.physics.balls,positions);
});
