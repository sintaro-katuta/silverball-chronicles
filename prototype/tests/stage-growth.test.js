import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProfile} from '../src/game.js';

const ball=()=>({gold:false,large:false,extra:false,hits:0,after:false});
const advance=g=>{g.award(g.target-g.stock);g.checkStage();g.selectSkill(g.choices[0]?.id??null);};

test('spending prevents a clear even when cumulative prizes exceed the required gain',()=>{
 const g=new Game(freshProfile(),0,()=>.9);
 for(let i=0;i<100;i++)g.fire();
 g.award(200);g.checkStage();
 assert.equal(g.total,200);assert.equal(g.stock,500);assert.equal(g.progress,100);
 assert.equal(g.phase,'playing');
 g.award(100);g.checkStage();assert.equal(g.phase,'skill');
});

test('stage targets, border, prize multiplier and firing speed rise together',()=>{
 const g=new Game(freshProfile(),0,()=>.9);
 assert.equal(g.target,600);assert.equal(g.lowerBorder,0);
 advance(g);
 assert.equal(g.stage,2);assert.equal(g.stageStartStock,600);assert.equal(g.target,1000);
 assert.equal(g.lowerBorder,200);assert.equal(g.payoutMultiplier,1.5);assert.equal(g.fireRate,160);
 advance(g);
 assert.equal(g.stage,3);assert.equal(g.target,1800);assert.equal(g.lowerBorder,600);
 assert.equal(g.payoutMultiplier,2.25);assert.equal(g.fireRate,256);
 for(let stage=3;stage<10;stage++)advance(g);
 assert.equal(g.stage,10);assert.equal(g.fireRate,6000);
 assert.ok(Math.abs(g.payoutMultiplier-38.443359375)<1e-8);
});

test('upgraded initial stock and stage supplies cannot satisfy the new stage automatically',()=>{
 const p=freshProfile();p.upgrades.stock=10;p.upgrades.supply=10;
 const g=new Game(p,0,()=>.9);
 assert.equal(g.stock,650);assert.equal(g.target,850);assert.equal(g.lowerBorder,0);
 advance(g);
 assert.equal(g.stock,900);assert.equal(g.target,1300);assert.equal(g.lowerBorder,250);
 assert.equal(g.total,200);assert.equal(g.phase,'playing');assert.equal(g.progress,0);
});

test('only bonus prizes scale with course and stage while accounting stays intact',()=>{
 for(const kind of ['normal','start','bonus','rush']){
  const g=new Game(freshProfile(),1,()=>.9);g.stage=3;
  if(kind==='rush')g.startRush();
  const before=g.stock,base=g.machine.prizes[kind];
  g.hit(ball(),kind);
  assert.equal(g.total,Math.floor(base*(kind==='bonus'?2.5*2.25:1)));
  assert.equal(g.ledger.basePrize,base);assert.equal(g.stock-before,g.total);
  assert.equal(g.accounting.reconciled,true);
 }
});

test('below-border grace resets only on recovery to the border, pauses, and expires at three seconds',()=>{
 const g=new Game(freshProfile(),0,()=>.9);advance(g);
 g.setStock(190);g.tick(1);
 g.award(4);assert.equal(g.stock,194);assert.equal(g.zeroTime,1);
 g.tick(1);g.pause();g.tick(30);assert.equal(g.zeroTime,2);
 g.resume();g.award(6);assert.equal(g.stock,200);assert.equal(g.zeroTime,0);
 g.tick(10);assert.equal(g.phase,'playing');assert.equal(g.zeroTime,0);
 g.fire();g.tick(2.99);assert.equal(g.phase,'playing');g.tick(.02);
 assert.equal(g.phase,'result');assert.equal(g.result.reason,'lost');assert.ok(g.stock>0);
});

test('skill selection freezes the clock and the next stage begins above its new border',()=>{
 const g=new Game(freshProfile(),0,()=>.9);g.award(200);g.checkStage();
 g.zeroTime=2;g.tick(99);assert.equal(g.zeroTime,2);
 g.selectSkill(g.choices[0].id);assert.equal(g.zeroTime,0);assert.equal(g.belowBorder,false);
});

test('last-push skill uses the safety margin above the current border',()=>{
 for(const [margin,prize] of [[80,6],[81,4]]){
  const g=new Game(freshProfile(),0,()=>.9);advance(g);g.skills={last:5};
  g.setStock(g.lowerBorder+margin);const before=g.total;g.hit(ball(),'normal');
  assert.equal(g.total-before,prize);
 }
});

test('live ticket milestones pay only the difference and cashout never pays them twice',()=>{
 const p=freshProfile(),g=new Game(p,0,()=>.9);
 g.hit(ball(),'normal');assert.equal(g.phase,'playing');assert.equal(g.claimTickets(p),1);
 assert.equal(g.claimTickets(p),0);g.award(396);assert.equal(g.claimTickets(p),1);
 g.checkStage();assert.equal(g.claimTickets(p),3);assert.equal(p.tickets,5);
 g.finish('retired');g.claimResult(p);assert.equal(p.tickets,5);
 assert.equal(g.result.tickets,5);assert.equal(g.claimTickets(p),0);
});

test('turning on debug keeps previous confirmed tickets but prevents additional rewards',()=>{
 const p=freshProfile(),g=new Game(p);g.award(4);
 g.debug=true;g.award(10000);g.checkStage();
 assert.equal(g.claimTickets(p),1);g.finish('retired');g.claimResult(p);
 assert.equal(p.tickets,1);assert.deepEqual(p.best,[0,0,0]);assert.equal(p.unlocked,1);
});

test('growth remains finite in late endless stages and firing is capped',()=>{
 const g=new Game(freshProfile(),0,()=>.9,{endless:true});g.stage=10000;
 assert.ok(Number.isFinite(g.target));assert.equal(g.fireRate,6000);
 assert.equal(g.payoutMultiplier,1e6);assert.equal(g.requiredGain,1e12);
});
