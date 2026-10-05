import test from 'node:test';
import assert from 'node:assert/strict';
import {moonMechanismState as state} from '../src/playcanvas/moon-mechanism-state.mjs';
import {beatAt,beatsFor} from '../src/presentation/cinematic.js';
const pose=(t,win=true,pattern='awakening')=>state({}, {t,win,pattern},beatAt(t,pattern));
test('moon motion before resolve never reads hidden win',()=>{
 for(const pattern of ['awakening','victory','defeat','feint','revival'])for(let t=0;t<26;t+=.1){const b=beatAt(t,pattern);if(b.id!=='resolve')assert.deepEqual(pose(t,true,pattern),pose(t,false,pattern));}
});
test('judgment closes; win opens; miss darkens and clears; normal resets',()=>{
 const beats=beatsFor(),judgment=beats.find(b=>b.id==='judgment'),resolve=beats.find(b=>b.id==='resolve'),early=resolve.from+(resolve.to-resolve.from)*.1;
 assert.equal(pose((judgment.from+judgment.to)/2).closure,1);assert.ok(pose(early).opening>0);assert.equal(pose(early,false).opening,0);assert.ok(pose(resolve.to-.001,false).closure<.01);assert.equal(state({},null,null).closure,0);
});
test('reactor can only expose announced rounds, independent of hidden award',()=>{
 for(const shown of [4,6,10])assert.deepEqual(state({jackpot:{displayRounds:shown,rounds:10}},null,null),state({jackpot:{displayRounds:shown,rounds:4}},null,null));
 assert.ok(state({jackpot:{displayRounds:10}},null,null).bonusOpen>state({jackpot:{displayRounds:4}},null,null).bonusOpen);
});
test('same paused clock produces identical mechanism pose',()=>assert.deepEqual(pose(14.2),pose(14.2)));
