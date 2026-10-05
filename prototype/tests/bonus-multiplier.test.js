import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProfile} from '../src/domain/game.js';

const ball=()=>({gold:false,large:false,extra:false,hits:0,after:false});
function choose(g){
 if(g.phase==='skill')g.selectSkill(g.choices.find(s=>s.id!=='bonus').id);
}

test('one 10R bonus retains its starting multiplier through real stage clears and round changes',()=>{
 const g=new Game(freshProfile(),0,()=>.9);g.pendingGrade=10;g.startJackpot();
 const bonus=g.jackpot;let entries=0;
 while(g.jackpot&&entries<100){
  if(g.jackpot.gap>0)g.tick(g.jackpot.gap);
  const before=g.total;g.fire();g.hit(ball(),'bonus');entries++;
  assert.equal(g.total-before,15);
  if(g.phase==='skill'){
   const snapshot=structuredClone(g.jackpot);g.tick(10);assert.deepEqual(g.jackpot,snapshot);
   choose(g);assert.equal(g.jackpot,bonus);assert.equal(g.jackpot.payoutMultiplier,1);
  }
  g.tick(.01);
 }
 assert.equal(entries,100);assert.equal(g.jackpot,null);
 assert.equal(g.lastBonus.payout,1500);assert.equal(g.total,1500);
 assert.equal(g.stock,1800);assert.equal(g.stage,3);assert.equal(g.cleared,2);
 assert.equal(g.rush.total,1500);assert.equal(g.accounting.reconciled,true);
});

test('ordinary entries stay at base prizes while the ongoing bonus stays fixed',()=>{
 const g=new Game(freshProfile(),0,()=>.9);g.startJackpot();
 g.award(g.target-g.stock);g.checkStage();choose(g);
 assert.equal(g.stage,2);assert.equal(g.payoutMultiplier,1.5);
 let before=g.total;g.hit(ball(),'normal');assert.equal(g.total-before,4);
 before=g.total;g.hit(ball(),'start');assert.equal(g.total-before,2);
 before=g.total;g.hit(ball(),'bonus');assert.equal(g.total-before,15);
 g.pause();g.tick(100);g.resume();
 assert.equal(g.jackpot.payoutMultiplier,1);
});

test('the next bonus in the same RUSH captures the current multiplier afresh',()=>{
 const g=new Game(freshProfile(),0,()=>.9);g.startRush();g.pendingGrade=4;g.startJackpot();
 const first=g.jackpot;
 g.award(g.target-g.stock);g.checkStage();choose(g);
 g.finishBonus(first);assert.equal(g.lastBonus.payoutMultiplier,1);
 g.pendingGrade=4;g.startJackpot();assert.equal(g.jackpot.fromRush,true);
 assert.equal(g.jackpot.payoutMultiplier,1.5);
 const before=g.total;g.hit(ball(),'bonus');g.hit(ball(),'bonus');
 assert.equal(g.total-before,45);assert.equal(g.jackpot.payout,45);
});

test('course, permanent upgrades and bonus skills still apply alongside the captured stage multiplier',()=>{
 const p=freshProfile();p.upgrades.bonus=2;
 const g=new Game(p,1,()=>.9);g.stage=3;g.skills.bonus=1;g.startJackpot();
 assert.equal(g.jackpot.payoutMultiplier,2.25);
 g.stage=4;
 const before=g.total;
 for(let i=0;i<4;i++)g.hit(ball(),'bonus');
 assert.equal(g.total-before,405); // 15 × (1 + .10 + .10) × 2.5 × 2.25 × 4
 assert.equal(g.ledger.basePrize,60);assert.equal(g.accounting.reconciled,true);
});

test('ordinary prizes keep upgrades and ball skills without stage or course amplification',()=>{
 for(const course of [0,1,2])for(const stage of [1,6,10])for(const kind of ['normal','start','rush']){
  const profile=freshProfile();profile.upgrades.normal=2;profile.upgrades.start=2;
  const g=new Game(profile,course,()=>.99);g.stage=stage;g.rules.targetBase=1e9;
  g.skills={pocket:1,large:1};if(kind==='rush')g.startRush();
  for(let n=0;n<10;n++)g.hit({...ball(),gold:true,large:true},kind);
  assert.equal(g.total,{normal:188,start:142,rush:121}[kind],`${course}/${stage}/${kind}`);
  assert.equal(g.accounting.reconciled,true);
 }
});
