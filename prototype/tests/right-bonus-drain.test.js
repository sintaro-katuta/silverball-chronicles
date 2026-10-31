import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';

test('bonus balls are counted once, travel below the receiver, and leave at the lower collection',()=>{
 const m=createBoardFlow({lcd:true,...productionBoardFlowOptions()});
 m.setMode('bonus');m.flow.start();let stop=null,seenDrain=false,maxSourceY=0;
 for(let i=0;i<18000;i++){
  if(m.flow.physics.metrics.spawned>=20&&stop===null){m.flow.stop();stop=m.flow.game.time;}
  m.flow.step(1/120);
  for(const b of m.flow.physics.balls)if(b.bonusDraining){seenDrain=true;maxSourceY=Math.max(maxSourceY,(b.y-120)*2);}
  if(stop!==null&&(m.flow.physics.balls.length===0||m.flow.game.time>stop+45))break;
 }
 assert.equal(m.flow.physics.metrics.spawned,20);
 assert.equal(m.flow.counts.bonus,20);
 assert.equal(m.flow.counts.out,0);
 assert.equal(m.flow.counts.returned,0);
 assert.ok(seenDrain&&maxSourceY>900);
 assert.equal(m.flow.physics.balls.length,0);
});
