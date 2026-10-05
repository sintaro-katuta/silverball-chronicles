import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProfile} from '../src/domain/game.js';
import {MACHINE_SPECS,presentationMetrics} from '../src/domain/machine-spec.js';
const ball=()=>({gold:false,large:false,hits:0,after:false});

test('accepted holds retain their draw and grade despite later RNG, odds and weight changes',()=>{
 let roll=.001;const g=new Game(freshProfile(),0,()=>roll);g.rules.targetBase=1e8;
 g.enqueueDraw(2);const first=g.activeDraw,held=g.acceptedDraws[0];
 assert.ok(Object.isFrozen(first));assert.ok(first.baseWin);assert.equal(first.grade,4);
 roll=.99;g.course.odds=100000;g.rules.weights=[0,0,100];g.tick(4);
 assert.equal(g.lastResolvedDraw.id,first.id);assert.equal(g.presentation.win,true);assert.equal(g.presentation.grade,4);
 // A bonus resets the consumed-spin pity counter, but never rerolls a hold.
 g.startJackpot();g.jackpot=null;g.tick(4);
 assert.equal(g.lastResolvedDraw.id,held.id);assert.equal(g.presentation.grade,4);assert.equal(g.presentation.win,true);
});

test('hold overflow pays start prizes without consuming draw RNG or creating hidden draws',()=>{
 let calls=0;const g=new Game(freshProfile(),0,()=>{calls++;return .99;});
 assert.equal(g.enqueueDraw(6),6);const before=calls;
 assert.equal(g.enqueueDraw(10),0);assert.equal(calls,before);assert.equal(g.queue,5);
 g.hit(ball(),'start');assert.equal(g.ledger.basePrize,2);assert.equal(g.total,2);assert.equal(g.queue,5);assert.equal(g.drawSerial,6);
});

test('queued losing samples receive pity only on consumption and reset after jackpot',()=>{
 const g=new Game(freshProfile(),0,()=>.99);g.rules.pityLimit=2;g.enqueueDraw(3);
 assert.equal(g.pityCount,0);assert.equal(g.activeDraw.baseWin,false);
 g.tick(4);g.tick(1);g.tick(4);assert.equal(g.lastResolvedDraw.pity,true);assert.equal(g.lastResolvedDraw.spin,2);
 g.startJackpot();g.jackpot=null;g.tick(4);
 assert.equal(g.lastResolvedDraw.pity,false);assert.equal(g.lastResolvedDraw.win,false);assert.equal(g.pityCount,1);
});

test('accounting reconciles prizes, fractional game modifiers, consumption, returns and supply',()=>{
 const profile=freshProfile();profile.upgrades.normal=1;const g=new Game(profile,1,()=>.99);g.rules.targetBase=1e8;
 for(let i=0;i<5;i++){g.fire();g.hit(ball(),'normal',0);}
 // Five physical 4-ball entries with +5% generate 21, without course scaling.
 assert.equal(g.accounting.basePrize,20);assert.equal(g.accounting.payout,21);assert.equal(g.accounting.gamePrize,1);
 assert.ok(Math.abs(g.payoutRemainder)<1e-8);
 g.addStock(7);g.addStock(1,'returned');g.award(3);g.fire(true);g.setStock(g.stock+10);
 assert.equal(g.accounting.spent,5);assert.equal(g.accounting.extraBalls,1);
 assert.equal(g.accounting.supply,7);assert.equal(g.accounting.returned,1);assert.equal(g.accounting.debugAdjustment,10);
 assert.equal(g.accounting.machineNet,15);assert.equal(g.accounting.playNet,19);assert.equal(g.accounting.balance,37);assert.ok(g.accounting.reconciled);
 g.finish('lost');assert.deepEqual(g.result.accounting,g.accounting);
});

test('machine definitions expose RUSH draws and separate reliability from jackpot share',()=>{
 for(let i=0;i<MACHINE_SPECS.length;i++){
  const g=new Game(freshProfile(),i,()=>.5),m=g.machine;
  if(i===0)assert.ok(Math.abs(1-(1-1/m.rightDraw.odds)**100-.66)<1e-12);else assert.equal(m.rightDraw.odds,66);assert.equal(m.rightDraw.spins,100);assert.equal(m.holdLimit,5);assert.deepEqual(m.normal.rounds,[4,6,10]);assert.equal(m.countLimit,10);
  const metrics=presentationMetrics(m);assert.ok(metrics.redFrequency<.02);assert.ok(metrics.redReliability<metrics.redJackpotShare);assert.equal(metrics.redJackpotShare,.7);
  g.course.odds=333;assert.equal(g.machine.normal.odds,333);assert.equal(MACHINE_SPECS[i].normal.odds,[199,229,259][i]);
 }
});

test('debug edits update runtime specifications and stock accounting without rerolling accepted holds',()=>{
 const g=new Game(freshProfile(),0,()=>.99);g.enqueueDraw(2);const active=g.activeDraw,held=g.acceptedDraws[0];
 g.debug=true;g.setStock(1234,'debug');g.course.odds=333;g.course.scale=2;g.rules.weights=[0,0,100];g.rules.rushEntryRate=.75;g.rules.pityLimit=999;
 assert.equal(g.machine.normal.odds,333);assert.deepEqual(g.machine.normal.weights,[0,0,100]);assert.equal(g.machine.gameRules.payoutScale,2);assert.equal(g.machine.rushEntry.fourRoundRate,.75);assert.equal(g.machine.gameRules.pityLimit,999);
 assert.equal(g.activeDraw,active);assert.equal(g.acceptedDraws[0],held);assert.equal(held.odds,199);assert.equal(g.accounting.debugAdjustment,834);assert.ok(g.accounting.reconciled);
});

test('wind boost is fixed at entry while queued pity remains a consumption rule',()=>{
 const g=new Game(freshProfile(),0,()=>.0052);g.skills.wind=5;g.misses=0;g.enqueueDraw(2);
 assert.equal(g.acceptedDraws[0].boost,0);assert.equal(g.acceptedDraws[0].baseWin,false);
 g.misses=50;g.enqueueDraw();assert.equal(g.acceptedDraws[1].boost,.25);assert.equal(g.acceptedDraws[1].baseWin,true);
 assert.equal(g.acceptedDraws[0].baseWin,false);
});

test('practice shortcut cannot discard an accepted active draw',()=>{
 const g=new Game(freshProfile(),0,()=>.99);g.practice=true;g.enqueueDraw();const active=g.activeDraw;
 assert.equal(g.beginPresentation(true,true),false);assert.equal(g.activeDraw,active);assert.ok(g.spinActive);
});
