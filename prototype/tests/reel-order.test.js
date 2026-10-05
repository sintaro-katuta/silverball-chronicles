import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProfile} from '../src/domain/game.js';
import {reelState} from '../src/domain/reels.js';
test('all courses stop left, then middle, then right, with time between each stop',()=>{
 for(let c=0;c<3;c++){
  const g=new Game(freshProfile(),c,()=>.8);g.enqueueDraw();
  const gap=g.machine.reels.stopGap;
  assert.deepEqual(reelState(g).stopped,[false,false,false]);
  g.tick(g.course.tempo+.01);const left=reelState(g);
  assert.deepEqual(left.stopped,[true,false,false]);assert.equal(g.draws,0);
  g.tick(gap);const middle=reelState(g);
  assert.deepEqual(middle.stopped,[true,true,false]);assert.equal(middle.numbers[0],left.numbers[0]);
  assert.equal(g.draws,0);g.tick(gap);const right=reelState(g);
  assert.deepEqual(right.stopped,[true,true,true]);assert.equal(right.numbers[0],left.numbers[0]);assert.equal(right.numbers[1],middle.numbers[1]);assert.equal(g.draws,1);
 }
});
test('reach begins only after left and middle have stopped matching, with right unresolved',()=>{
 const g=new Game(freshProfile(),0,()=>.001);g.enqueueDraw();
 g.tick(g.course.tempo+.01);assert.equal(g.presentation,null);assert.deepEqual(reelState(g).stopped,[true,false,false]);
 g.tick(g.machine.reels.stopGap);assert.ok(g.presentation);const r=reelState(g);
 assert.deepEqual(r.stopped,[true,true,false]);assert.equal(r.numbers[0],r.numbers[1]);assert.equal(g.draws,1);
 g.pause();const held=reelState(g);g.tick(10);assert.deepEqual(reelState(g),held);
});
