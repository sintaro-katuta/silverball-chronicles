import test from 'node:test';
import assert from 'node:assert/strict';
import {reelState} from '../src/reels.js';
test('300 charge never masquerades as a triple-seven symbol hit',()=>{
 const charge=reelState({time:0,presentation:null,jackpot:{charge:true}});
 assert.equal(charge.numbers.every(n=>n===charge.numbers[0]),false);
 assert.deepEqual(reelState({time:0,presentation:null,jackpot:{charge:false}}).numbers,[7,7,7]);
});
