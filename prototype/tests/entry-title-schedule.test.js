import test from 'node:test';import assert from 'node:assert/strict';
import {entryTitleAt,ENTRY_TITLE_SECONDS} from '../src/pixi/entry-title-schedule.js';
import {RUSH_PRELUDES} from '../src/pixi/rush-prelude-motion.js';
import {rushEntryPose} from '../src/pixi/rush-entry-motion.js';
test('each in-scene title retains all four landings and its entire shine',()=>{
 for(const v of ['moon','reflection','mechanism','slash']){
  const at=entryTitleAt(v);assert.ok(Math.abs(RUSH_PRELUDES[v]-at-ENTRY_TITLE_SECONDS)<1e-9);
  for(const t of [.201,.361,.521,.681])assert.ok(at+t<RUSH_PRELUDES[v]);
  assert.ok(rushEntryPose(.81).letters.every(l=>l.landed));assert.ok(rushEntryPose(1.5).shineVisible);
 }
});
test('approved castle, slash and revival timing stays unchanged',()=>{
 assert.equal(RUSH_PRELUDES.castle,8);assert.equal(entryTitleAt('castle'),null);
 assert.equal(RUSH_PRELUDES.slash,4.55);assert.equal(entryTitleAt('slash'),2.15);
 assert.equal(RUSH_PRELUDES.revival,6.6);assert.equal(entryTitleAt('revival'),null);
});
