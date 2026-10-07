import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
test('win review reveals stored winning second draw, holds queue through announcement',()=>{
 const m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow,{win:true});for(let i=0;i<3;i++)m.flow.game.hit({id:i,x:210,y:480},'start',4);
 assert.equal(s.game.normalHolds[0].baseWin,true);for(let i=0;i<13*120;i++)m.flow.step(1/120);
 assert.ok(s.snapshot().win);assert.deepEqual(s.snapshot().reels.numbers,s.game.stoppedReels);assert.ok(s.game.stoppedReels.every(n=>n===s.game.stoppedReels[0]));assert.equal(s.game.holdCount,1);assert.equal(s.game.draws,2);
 const before=s.snapshot();m.flow.pause(true);m.flow.step(.05);assert.deepEqual(s.snapshot(),before);m.flow.pause(false);for(let i=0;i<6*120;i++)m.flow.step(1/120);assert.equal(s.game.holdCount,1);assert.equal(s.game.jackpot.round,1);
});
