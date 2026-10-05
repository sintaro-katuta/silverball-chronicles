import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProfile} from '../src/domain/game.js';
import {reelState} from '../src/domain/reels.js';
import {REACH_DURATION} from '../src/presentation/cinematic.js';

test('revival silence stops a visible near miss without leaking or mutating the winning draw',()=>{
 for(const rate of [.5,1,2]){
  const g=new Game(freshProfile(),0,()=>.5);g.practice=true;g.beginPresentation(true,true,{pattern:'revival'});g.presentation.rate=rate;
  const outcome=[...g.reelOutcome];assert.deepEqual(outcome,[7,7,7]);
  for(const t of [15.3,16,17,17.799]){
   g.presentation.time=(t+REACH_DURATION)*rate;
   const r=reelState(g);assert.deepEqual(r.numbers,[7,7,6]);assert.deepEqual(r.stopped,[true,true,true]);
   assert.deepEqual(g.reelOutcome,outcome);assert.equal(g.jackpots,0);
  }
  g.pause();const before=reelState(g);g.tick(12);assert.deepEqual(reelState(g),before);g.resume();
  for(const t of [17.8,19,20.3,22.8,23.599]){g.presentation.time=(t+REACH_DURATION)*rate;assert.equal(reelState(g).stopped[2],false);}
  g.presentation.time=(23.6+REACH_DURATION)*rate;assert.deepEqual(reelState(g).numbers,[7,7,7]);assert.equal(reelState(g).stopped[2],true);
 }
});
