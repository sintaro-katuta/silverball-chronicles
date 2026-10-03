import {test} from 'node:test';
import assert from 'node:assert/strict';
import {YozoraGame,awardFor,drive} from '../src/yozora/model.js';
const seq=(...values)=>()=>{assert.ok(values.length,'unexpected lottery draw');return values.shift();};
test('normal payout branch boundaries preserve 50/48.5/1.5',()=>{
 assert.deepEqual([0,.499999,.5,.984999,.985].map(n=>awardFor('normal',seq(n,0)).next),['normal','normal','rush','rush','wou']);
 assert.equal(awardFor('normal',seq(.99,0)).rounds*150,3000);
});
test('rush branch boundaries and WoU DRIVE',()=>{
 for(const [r,next,pay] of [[.44,'rush',1500],[.45,'rush',1500],[.7799,'rush',1500],[.78,'wou',1500],[.89,'wou',3000]]){const a=awardFor('rush',seq(r,0));assert.equal(a.next,next);assert.equal(a.rounds*150,pay);}
 assert.equal(awardFor('wou',seq(.6,.4)).rounds*150,4500);
});
test('DRIVE handles the published tail and repeat without clipping',()=>{
 assert.equal(drive(seq(.98)).units,6);
 assert.deepEqual(drive(seq(.995,.995,.01)),{units:11,repeats:2});
});
test('result fixed on admission; PUSH and pause cannot redraw or pay',()=>{
 const g=new YozoraGame({rng:seq(0,.6),fxRng:()=>.5});g.start();g.auto=false;g.enter();g.update(.05);const original=g.active.award;
 g.push();g.pause();const before=g.snapshot();g.update(20);assert.deepEqual(g.snapshot(),before);g.resume();g.push();g.resolve();assert.equal(g.bonus.next,original.next);assert.equal(g.total,0);
});
test('bonus pays each count once, completes at 20 and resets ST to 53',()=>{
 const g=new YozoraGame();g.demoScene('bonus');g.auto=false;for(let i=0;i<19;i++)g.countBonus();assert.equal(g.total,285);assert.ok(g.bonus);g.countBonus();assert.equal(g.total,300);assert.equal(g.mode,'rush');assert.equal(g.remaining,53);g.countBonus();assert.equal(g.total,300);
});
test('last ST spin remains available and then returns to normal on miss',()=>{
 const g=new YozoraGame({rng:()=>.99,fxRng:()=>.5});g.demoScene('rush');g.remaining=1;assert.equal(g.enter(),true);assert.equal(g.enter(),false);g.update(.05);g.resolve();assert.equal(g.mode,'normal');assert.equal(g.remaining,0);
});
test('last ST win renews only after payout and has no premature expiry',()=>{
 const g=new YozoraGame({rng:seq(0,.1),fxRng:()=>.5});g.demoScene('rush');g.remaining=1;g.enter();g.update(.05);g.resolve();assert.equal(g.mode,'rush');assert.ok(g.bonus);for(let i=0;i<100;i++)g.countBonus();assert.equal(g.remaining,53);
});
test('FAIR START every fifth launch, two of six slots award entry',()=>{
 const g=new YozoraGame({rng:()=>.9,fxRng:()=>.5});g.start();const shots=Array.from({length:10},()=>g.launch());assert.equal(shots.filter(s=>s.route==='fair').length,2);
 for(let slot=0;slot<6;slot++)g.receive({route:'fair',slot});assert.equal(g.fairHits,2);assert.equal(g.queue.length,2);
});
test('hold limit, reset and empty stock',()=>{
 const g=new YozoraGame({rng:()=>.9,fxRng:()=>.5});g.start();for(let i=0;i<5;i++)g.enter();assert.equal(g.queue.length,4);g.stock=0;assert.equal(g.launch(),null);g.reset();assert.equal(g.queue.length,0);assert.equal(g.stock,2500);assert.equal(g.phase,'ready');
});
