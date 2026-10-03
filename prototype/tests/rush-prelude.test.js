import test from 'node:test';import assert from 'node:assert/strict';
import {RUSH_PRELUDES,beginRushPrelude,preludePose} from '../src/pixi/rush-prelude-motion.js';
test('six preludes reveal existing entry only, without RNG or payout changes',()=>{
 for(const variant of Object.keys(RUSH_PRELUDES)){
  const game={time:10,jackpots:1,reviewEntryVariant:variant,rush:{remaining:100,total:900},lastBonus:{entryEligible:true,fromRush:false,payout:900},rng:()=>{throw Error('must not reroll');}};
  const before=JSON.stringify({rush:game.rush,bonus:game.lastBonus});const s=beginRushPrelude(game);
  assert.equal(s.variant,variant);assert.equal(preludePose(10,s).visible,true);assert.equal(preludePose(10+RUSH_PRELUDES[variant]+.001,s).visible,false);
  assert.equal(JSON.stringify({rush:game.rush,bonus:game.lastBonus}),before);
 }
});
test('loss and repeat RUSH bonuses cannot trigger initial entry preludes',()=>{
 assert.equal(beginRushPrelude({rush:null,lastBonus:{entryEligible:false}}),null);
 assert.equal(beginRushPrelude({rush:{},lastBonus:{entryEligible:true,fromRush:true}}),null);
});
