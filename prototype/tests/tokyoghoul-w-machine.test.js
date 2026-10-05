import test from 'node:test';
import assert from 'node:assert/strict';
import {WMachine} from '../src/domain/tokyoghoul-w-machine.js';
const finishBonus=(m,prefix)=>{while(m.bonus){m.openRound();for(let n=0;n<10;n++)m.admit('attacker',`${prefix}-${m.bonus?.round}-${n}`);}};

test('normal symbol and charge are separate outcomes; entry waits for explicit policy',()=>{
 for(const [roll,outcome,amount] of [[0,'symbol',1500],[1.5/399.9,'charge',300],[.5,'miss',0]]){
  const m=new WMachine({rng:()=>roll});m.admit('start','s');
  assert.equal(m.resolveDraw('tokuzu1').outcome,outcome);
  if(amount){finishBonus(m,'a');assert.equal(m.payout,amount+1);assert.equal(m.pendingEntry,true);assert.equal(m.rush,null);m.setEntryDecision(false);assert.equal(m.pendingEntry,false);}
  else assert.equal(m.bonus,null);
 }
});
test('130 misses consume fuzu draws, not electric admissions; no separate end roll',()=>{
 let calls=0;const m=new WMachine({rng:()=>{calls++;return .5;}});m.startRush();
 for(let n=0;n<130;n++){assert.equal(m.admit('fuzu',n).drawAccepted,true);assert.equal(m.resolveDraw('fuzu').outcome,'miss');if(n<129)assert.equal(m.rush.remaining,129-n);}
 assert.equal(m.rush,null);assert.equal(calls,130);assert.equal(m.payout,130);
});
test('success at draw 130 keeps electric opportunity; V required and 3000 is two bonuses',()=>{
 const m=new WMachine({rng:()=>0});m.startRush();m.rush.remaining=1;
 m.admit('fuzu','f');m.resolveDraw('fuzu');assert.ok(m.rush);m.openElectric();
 m.admit('electric','e1');m.admit('electric','e2');
 assert.equal(m.active.tokuzu2.ballId,'e1');assert.equal(m.queues.tokuzu2.length,1);
 assert.equal(m.admit('electric','e3').drawAccepted,false); // prize still paid
 m.closeElectric();m.resolveDraw('tokuzu2');assert.equal(m.bonus,null);assert.ok(m.pendingV);
 m.confirmV();finishBonus(m,'a');assert.equal(m.rush.remaining,130);
 assert.equal(m.startNextDraw('tokuzu2'),true);m.resolveDraw('tokuzu2');m.confirmV();finishBonus(m,'b');
 const bonuses=m.events.filter(e=>e.type==='bonusEnd');assert.equal(bonuses.length,2);
 assert.deepEqual(bonuses.map(e=>e.payout),[1500,1500]);assert.equal(m.payout,3004);
});
test('physical capture counted once, closed inlets reject, timeout never fills missing balls',()=>{
 const m=new WMachine({rng:()=>0});assert.equal(m.admit('electric','e').captured,false);
 m.admit('start','s');assert.equal(m.admit('ordinary','s').captured,false);m.resolveDraw('tokuzu1');
 m.openRound();m.admit('attacker','a');m.closeRound('time');
 assert.equal(m.payout,16);assert.equal(m.admit('attacker','b').captured,false);
 while(m.bonus){m.openRound();m.closeRound('time');}
 assert.equal(m.payout,16);assert.equal(m.events.find(e=>e.type==='bonusEnd').payout,15);
});
test('tokuzu1 holds are four and full holds do not suppress inlet prize',()=>{
 const m=new WMachine({rng:()=>.5});for(let i=0;i<6;i++)m.admit('start',i);
 assert.equal(m.queues.tokuzu1.length,4);assert.equal(m.payout,6);
 assert.equal(m.events.filter(e=>e.type==='drawAccepted').length,5);
});
test('unknown fuzu storage does not invent capacity; no old pity or boosted prize',()=>{
 const m=new WMachine({rng:()=>.5});m.startRush();m.admit('fuzu','f1');
 assert.equal(m.admit('fuzu','f2').drawAccepted,false);assert.equal(m.payout,2);
 assert.equal(m.events.find(e=>e.type==='drawRejected').reason,'unknown-hold-capacity');
 m.admit('ordinary','o');assert.equal(m.payout,7);assert.equal(m.snapshot().fuzuHoldLimit,null);
 assert.throws(()=>m.setEntryDecision(.51),TypeError);assert.throws(()=>m.confirmV());
});
test('special symbol draws never run simultaneously; tokuzu2 has next-start priority',()=>{
 let rolls=[.5,0,.5];const m=new WMachine({rng:()=>rolls.shift()});m.startRush();
 m.admit('start','s1');m.admit('fuzu','f');m.resolveDraw('fuzu');m.openElectric();m.admit('electric','e');
 assert.equal(m.active.tokuzu2,null);assert.equal(m.queues.tokuzu2.length,1);
 assert.equal(m.startNextDraw('tokuzu2'),false);m.resolveDraw('tokuzu1');
 assert.equal(m.startNextDraw('tokuzu1'),false);assert.equal(m.startNextDraw('tokuzu2'),true);
});
test('an arrival between resolve and next-start never overtakes queued records',()=>{
 const m=new WMachine({rng:()=>.5,fuzuHoldLimit:4});
 for(const kind of ['tokuzu1','fuzu','tokuzu2']){
  if(kind==='fuzu')m.startRush();
  // Exercise the scheduling boundary directly for each distinct hold bank.
  m.enqueue(kind,`${kind}-first`);m.enqueue(kind,`${kind}-second`);
  assert.equal(m.active[kind].ballId,`${kind}-first`);
  if(kind==='tokuzu2')m.active[kind]=null;else m.resolveDraw(kind);
  m.enqueue(kind,`${kind}-third`);
  assert.equal(m.active[kind],null);
  assert.equal(m.queues[kind][0].ballId,`${kind}-second`);
  assert.equal(m.startNextDraw(kind),true);
  assert.equal(m.active[kind].ballId,`${kind}-second`);
  m.active[kind]=null;m.queues[kind]=[];
 }
});
