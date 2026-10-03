import test from 'node:test';import assert from 'node:assert/strict';import {Game,freshProfile} from '../src/game.js';
const ball={gold:false,large:false,hits:0};
test('100 independent spins give 66% aggregate; normal odds and payouts are unchanged',()=>{
 const g=new Game(freshProfile(),0,()=>.5),p=1/g.machine.rightDraw.odds;
 assert.ok(Math.abs(1-(1-p)**100-.66)<1e-12);assert.equal(g.machine.normal.odds,199);assert.deepEqual(g.machine.normal.weights,[45,35,20]);
 for(const [roll,win]of [[p-1e-10,true],[p,false],[p+1e-10,false]]){const seq=[roll,.5];g.rng=()=>seq.shift();assert.equal(g.createDraw('rush','rush').baseWin,win);}
});
test('each selected payout is earned exactly by admissions and retained independently of later RNG',()=>{
 for(const [roll,amount]of [[.1,500],[.5,1500],[.9,3000]]){
  const g=new Game(freshProfile(),0,()=>roll);g.rules.targetBase=1e9;g.startRush();
  const record=g.createDraw('rush','rush');assert.equal(record.payoutAmount,amount);
  g.pendingGrade=record.grade;g.pendingPayout=record.payoutAmount;g.rng=()=>.99;g.startJackpot();
  const plan=g.jackpot;assert.equal(plan.payoutAmount,amount);let admissions=0;
  for(let r=0;r<20&&g.jackpot;r++){g.jackpot.gap=0;for(let c=0;c<10;c++){g.hit(ball,'bonus',5);admissions++;}g.tick(.01);}
  assert.equal(g.jackpot,null);assert.equal(g.lastBonus.payout,amount);assert.equal(g.total,amount);assert.equal(g.rush.total,amount);assert.equal(g.rush.remaining,100);assert.ok(g.accounting.reconciled);
  assert.equal(admissions,amount===500?50:amount===3000?200:100);
 }
});
test('missing admissions do not get an automatic payout top-up',()=>{
 const g=new Game(freshProfile(),0,()=>.1);g.rules.targetBase=1e9;g.startRush();g.startJackpot();g.hit(ball,'bonus',5);
 for(let i=0;i<10&&g.jackpot;i++){g.jackpot.gap=0;g.tick(16);}
 assert.equal(g.lastBonus.payout,10);assert.ok(g.accounting.reconciled);
});
