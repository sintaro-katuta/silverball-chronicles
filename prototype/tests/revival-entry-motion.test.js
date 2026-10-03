import test from 'node:test';import assert from 'node:assert/strict';
import {revivalPhase,revivalReels} from '../src/pixi/revival-entry-motion.js';
test('fake normal return changes only display reels and ends at the blackout',()=>{
 const state={numbers:[7,7,7],stopped:[true,true,true]},game={time:13,entryPrelude:{variant:'revival',startedAt:10}};
 assert.deepEqual(revivalReels(game,state).numbers,[2,4,6]);assert.deepEqual(state.numbers,[7,7,7]);
 game.time=14.4;assert.equal(revivalPhase(4.4),'blackout');assert.equal(revivalReels(game,state),state);
 game.time=16.6;assert.equal(revivalPhase(6.6),'rush');assert.equal(revivalReels(game,state),state);
 game.entryPrelude.variant='slash';game.time=13;assert.equal(revivalReels(game,state),state);
});
