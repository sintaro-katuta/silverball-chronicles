import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';import {linkedWinScale} from '../src/pixi/review-reel-state.js';
for(const win of [false,true])test(`centre pending and returned ${win?'win':'miss'} use the stored outcome`,()=>{
 const m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow,{reach:true,win});for(let i=0;i<3;i++)m.flow.game.hit({id:i,x:210,y:480},'start',4);
 let n=0;while(!s.game.presentation&&n++<2000)m.flow.step(1/120);assert.ok(s.game.presentation);assert.deepEqual(s.snapshot().reels.stopped,[true,false,true]);const symbol=s.game.reelOutcome[0];assert.equal(s.snapshot().reels.numbers[0],symbol);assert.equal(s.snapshot().reels.numbers[2],symbol);
 const target=s.game.reelOutcome[2];while(s.game.presentation)m.flow.step(1/120);assert.deepEqual(s.snapshot().reels.numbers,[symbol,target,symbol]);assert.equal(target===symbol,win);assert.equal(s.game.holdCount,1);
});
test('linked zoom holds sixfold for one second then returns without pulsing',()=>{
 for(let t=.26;t<=1.26;t+=.01)assert.equal(linkedWinScale(t),6);
 const peak=linkedWinScale(.5);assert.ok(105+(-53+23)*peak<0);assert.ok(105+(53-20)*peak>210);
 for(let t=.18;t<.26;t+=.001)assert.ok(linkedWinScale(t+.001)>=linkedWinScale(t));
 for(let t=1.26;t<1.51;t+=.001)assert.ok(linkedWinScale(t+.001)<=linkedWinScale(t));
 assert.equal(linkedWinScale(0),1);assert.equal(linkedWinScale(1.51),1);assert.equal(linkedWinScale(10),1);
});
