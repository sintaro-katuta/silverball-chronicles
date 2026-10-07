import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {reelState} from '../src/domain/reels.js';
test('second review draw reaches, retains left/middle, holds queue, misses and resumes',()=>{
 const m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow,{reach:true});
 for(let i=0;i<3;i++)m.flow.game.hit({id:i,x:210,y:480},'start',4);
 let guard=0;while(!s.game.presentation&&guard++<2000)m.flow.step(1/120);
 assert.ok(s.game.presentation?.basicReach);const queue=s.game.holdCount;assert.equal(queue,1);
 const state=reelState(s.game);assert.deepEqual(state.stopped,[true,true,false]);assert.equal(state.numbers[0],state.numbers[1]);const expected=[...s.game.reelOutcome];assert.notEqual(expected[2],expected[0]);
 m.flow.pause(true);const snap=s.snapshot();m.flow.step(.05);assert.deepEqual(s.snapshot(),snap);m.flow.pause(false);
 for(let i=0;i<1*120;i++)m.flow.step(1/120);assert.equal(s.game.holdCount,queue);assert.deepEqual(reelState(s.game).stopped,[true,true,false]);
 while(s.game.presentation)m.flow.step(1/120);assert.deepEqual(s.game.stoppedReels,expected);assert.equal(s.game.stopTimer,.85);
 for(let i=0;i<6*120;i++)m.flow.step(1/120);assert.equal(s.game.draws,3);assert.equal(s.game.holdCount,0);assert.equal(s.game.jackpots,0);
});
