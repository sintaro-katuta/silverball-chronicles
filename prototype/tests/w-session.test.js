import test from 'node:test';import assert from 'node:assert/strict';
import {SessionGame} from '../src/pixi/session-game.js';
import {W_RUNTIME_POLICY,wPublishedNormalOutcome} from '../src/pixi/w-runtime-policy.js';
const ball=(id)=>({id,x:200,y:500,hits:0});
const settle=g=>{for(let n=0;n<2000;n++){g.tick(.01);if(g.presentation){const win=g.presentation.win;g.presentation=null;g.resolveDraw(win);}if(g.jackpot||g.w.electricOpen||g.w.pendingV)return;}};
const bonus=(g,prefix)=>{let id=0;while(g.jackpot){g.jackpot.gap=0;g.openWRound();const left=10-g.jackpot.count;for(let n=0;n<left;n++)g.hit(ball(`${prefix}-${id++}`),'bonus');}};
test('production SessionGame uses W control and actual prizes, no stage/gold multipliers',()=>{
 const g=new SessionGame(()=>0);g.profile.upgrades.bonus=99;g.stage=10;g.hit(ball('start'),'start');settle(g);
 assert.equal(g.jackpot.rounds,10);assert.equal(g.jackpot.charge,false);bonus(g,'n');
 assert.equal(g.total,1501);assert.equal(g.rush.remaining,130);assert.equal(g.lastBonus.entryEligible,true);assert.equal(g.lastBonus.entryRevealed,true);assert.equal(g.accounting.reconciled,true);
});
test('RUSH hit needs actual electric and V admissions before 1500 x 2',()=>{
 const g=new SessionGame(()=>.9,{policy:{...W_RUNTIME_POLICY,nextGuaranteedFuzuRate:0}});g.startRush();g.w.rng=()=>0;
 g.hit(ball('f'),'fuzu');settle(g);assert.equal(g.jackpot,null);assert.equal(g.w.electricOpen,true);
 g.hit(ball('e1'),'rush');g.hit(ball('e2'),'rush');assert.equal(g.w.electricOpen,false);
 settle(g);assert.ok(g.w.pendingV);assert.equal(g.jackpot,null);g.hit(ball('v1'),'bonus');assert.ok(g.jackpot);bonus(g,'a');assert.equal(g.hasPendingWBonus,true);
 settle(g);assert.ok(g.w.pendingV);g.hit(ball('v2'),'bonus');bonus(g,'b');
 assert.equal(g.wBatch.payout,3000);assert.equal(g.wBatch.maxPayout,3000);assert.equal(g.total,3003);assert.equal(g.rush.remaining,130);
 assert.equal(g.hasPendingWBonus,false);assert.equal(g.lastBonus.individualPayout,1500);assert.equal(g.lastBonus.displayMaxPayout,3000);assert.equal(g.w.events.filter(e=>e.type==='bonusEnd').length,2);assert.equal(g.accounting.reconciled,true);
});
test('charge is distinct from aligned symbols, fourth branch does not enter RUSH',()=>{
 const g=new SessionGame(()=>.9);g.w.rng=()=>.75/199.9;g.hit(ball('s'),'start');settle(g);
 assert.equal(g.jackpot.rounds,2);assert.equal(g.jackpot.charge,true);bonus(g,'c');assert.equal(g.rush,null);assert.equal(g.total,301);
 assert.deepEqual(wPublishedNormalOutcome(.252/199.9),{outcome:'charge',entry:true});
});
test('6000 plus alpha uses further fuzu and captured electric/V balls; no grant at reset',()=>{
 const g=new SessionGame(()=>0);g.startRush();g.w.rng=()=>0;
 const group=(tag)=>{g.hit(ball(`f${tag}`),'fuzu');settle(g);g.hit(ball(`e${tag}1`),'rush');g.hit(ball(`e${tag}2`),'rush');settle(g);g.hit(ball(`v${tag}1`),'bonus');bonus(g,`${tag}a`);assert.equal(g.w.rush.guaranteed,undefined);settle(g);g.hit(ball(`v${tag}2`),'bonus');bonus(g,`${tag}b`);};
 group('a');assert.equal(g.w.rush.guaranteed,true);assert.equal(g.wBatch.payout,3000);const before=g.total;
 group('b');assert.equal(g.wBatch.maxPayout,6000);assert.equal(g.wBatch.payout,6000);assert.equal(g.total-before,3003);
});
test('electric followup result is fixed at admission, not rolled after payout',()=>{
 const g=new SessionGame(()=>.9);g.startRush();g.w.rng=()=>0;g.hit(ball('f'),'fuzu');settle(g);
 g.hit(ball('e1'),'rush');g.hit(ball('e2'),'rush');g.w.rng=()=>.99;g.rng=()=>.99;
 settle(g);g.hit(ball('v1'),'bonus');bonus(g,'a');settle(g);g.hit(ball('v2'),'bonus');bonus(g,'b');
 assert.equal(g.w.rush.guaranteed,true);
});
test('production RUSH expires only after 130 resolved fuzu misses',()=>{
 const g=new SessionGame(()=>.9);g.startRush();
 for(let n=0;n<130;n++){
  g.hit(ball(`f-${n}`),'fuzu');for(let step=0;step<300&&g.draws<n+1;step++)g.tick(.01);
  assert.equal(g.draws,n+1);if(n<129)assert.equal(g.rush.remaining,129-n);
 }
 assert.equal(g.rush,null);assert.equal(g.lastRush.consumed,130);assert.equal(g.w.events.filter(e=>e.type==='electricOpen').length,0);
});
