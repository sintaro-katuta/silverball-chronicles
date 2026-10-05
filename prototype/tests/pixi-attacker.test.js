import test from 'node:test';
import assert from 'node:assert/strict';
import {createPartFlow} from '../src/physics/ball-flow.js';
test('attacker demonstration keeps real launch physics and scores only during open interval',()=>{
 const flow=createPartFlow();flow.start();const checkpoints=[];
 for(let i=0;i<2400;i++){
  if(i===600)flow.game.jackpot={gap:0,count:0,displayRounds:4};
  if(i===1800)flow.game.jackpot=null;
  flow.step(1/120);if([599,1799,2399].includes(i))checkpoints.push({...flow.counts});
 }
 assert.equal(checkpoints[0].bonus,0);assert.ok(checkpoints[1].bonus>0);assert.equal(checkpoints[2].bonus,checkpoints[1].bonus);assert.ok(checkpoints[2].out>checkpoints[1].out);
 const before=flow.game.time;flow.pause(true);flow.step(.05);assert.equal(flow.game.time,before);
});
