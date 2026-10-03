import test from 'node:test';import assert from 'node:assert/strict';
import {createRushEntryMotion,rushEntryPose} from '../src/pixi/rush-entry-motion.js';
test('four separate downward arrivals precede the single shine',()=>{
 for(let i=0;i<4;i++){
  const before=rushEntryPose(.1+i*.16+.04);assert.ok(before.letters[i].y<0);assert.equal(before.letters[i].landed,false);
  const impact=rushEntryPose(.1+i*.16+.101);assert.equal(impact.letters[i].landed,true);assert.ok(impact.letters[i].burst>0);
  assert.equal(impact.letters.filter(v=>v.landed).length,i+1);assert.equal(impact.shineVisible,false);
 }
 assert.ok(rushEntryPose(.81).letters.every(v=>v.landed));assert.equal(rushEntryPose(.81).shineVisible,true);assert.equal(rushEntryPose(2.4).shineVisible,false);
});
test('entry plays once, pauses with the clock, exits and resets cleanly',()=>{
 const m=createRushEntryMotion();assert.equal(m.update(0,false).visible,false);assert.equal(m.update(10,true).visible,true);
 const p=m.update(10.4,true);assert.deepEqual(m.update(10.4,true),p);assert.equal(m.update(13,true).visible,false);
 m.update(14,false);assert.equal(m.update(15,true).visible,true);assert.equal(m.update(15.2,false).visible,false);
 assert.equal(m.update(0,true).visible,false);
});
test('result split hands off directly to landed letters and the rainbow sweep',()=>{
 const m=createRushEntryMotion();m.update(0,false);
 const p=m.update(2.85,true,1.01);
 assert.ok(p.letters.every(v=>v.landed));assert.equal(p.shineVisible,true);assert.ok(p.shine>=21&&p.shine<30);
 assert.deepEqual(m.update(2.85,true,0),p);assert.equal(m.update(4.25,true).visible,false);
 m.update(5,false);assert.equal(m.update(6,true).letters[0].visible,false);
});
