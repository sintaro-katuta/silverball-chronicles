import test from 'node:test';
import assert from 'node:assert/strict';
import {TOKYOGHOUL_W as W,wRushHitProbability,wBonusSequence} from '../src/domain/tokyoghoul-w-spec.js';

test('W continuation uses independent fuzu draws, not a separate termination lottery',()=>{
  assert.equal(wRushHitProbability(0),0);
  assert.ok(Math.abs(wRushHitProbability(1)-1/95.3)<1e-14);
  assert.ok(wRushHitProbability(130)>.74&&wRushHitProbability(130)<.75);
  assert.ok(Math.abs(1-wRushHitProbability(130)-(1-wRushHitProbability(65))**2)<1e-14);
  assert.throws(()=>wRushHitProbability(-1),RangeError);
});
test('announced awards preserve separate 10R bonuses and per-entry accounting',()=>{
  for(const payout of [300,1500,3000,6000]){
    const bonuses=wBonusSequence(payout);
    assert.equal(bonuses.reduce((sum,b)=>sum+b.rounds*b.countLimit*b.awardPerBall,0),payout);
    assert.ok(bonuses.every(b=>b.rounds<=10));
  }
  assert.equal(wBonusSequence(3000).length,2);
  assert.equal(wBonusSequence(6000).length,4);
  assert.throws(()=>wBonusSequence(500),RangeError);
});
test('unknown timings stay explicit and published reference data is immutable',()=>{
  assert.equal(W.attacker.openSeconds,null);
  assert.equal(W.holds.fuzu,null);
  assert.throws(()=>{W.rush.draws=100;},TypeError);
});
