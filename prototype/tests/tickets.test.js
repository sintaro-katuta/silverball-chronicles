import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProfile,ticketReward,ticketBreakdown} from '../src/domain/game.js';

const ball=()=>({gold:false,large:false,extra:false,hits:0,after:false});

test('any paid prize earns at least one ticket without clearing a stage',()=>{
 for(const total of [1,2,4,15,99,100,399])assert.equal(ticketReward(total,0),1);
 assert.equal(ticketReward(400,0),2);
 for(const kind of ['normal','start','bonus']){
  const g=new Game(freshProfile(),0,()=>.9);
  g.hit(ball(),kind);
  assert.equal(g.cleared,0);
  assert.equal(g.ticketEstimate,1);
  g.setStock(0);g.tick(3);
  assert.equal(g.result.reason,'lost');
  assert.equal(g.result.tickets,1);
 }
});

test('tickets preserve stage bonuses and upgrade rounding with an exact breakdown',()=>{
 assert.deepEqual(ticketBreakdown(10000,2,10),{payout:10,stages:6,upgrade:8,tickets:24});
 const g=new Game(freshProfile());
 g.profile.upgrades.tickets=10;
 g.award(g.target-g.stock);g.checkStage();
 assert.equal(g.ticketEstimate,6);
 g.finish('lost');
 assert.equal(g.result.tickets,6);
 assert.equal(g.result.reward.stages,3);
});

test('zero prizes, supply and returns never earn tickets; cashing out preserves earnings',()=>{
 assert.equal(ticketReward(0,10,10),0);
 const g=new Game(freshProfile());
 g.addStock(500);g.addStock(10,'returned');
 assert.equal(g.ticketEstimate,0);
 g.award(99);
 assert.equal(g.ticketEstimate,1);
 g.finish('retired');
 assert.equal(g.ticketEstimate,1);
 assert.equal(g.result.tickets,1);
});

test('practice, endless and debug runs cannot grant progression',()=>{
 for(const mode of ['practice','endless','debug']){
  const profile=freshProfile(),before=structuredClone(profile);
  const g=new Game(profile,2,()=>.5,{endless:mode==='endless'});
  g[mode]=true;g.award(10000);g.cleared=10;
  assert.equal(g.ticketEstimate,0);
  g.finish('clear');
  assert.equal(g.result.tickets,0);
  assert.equal(g.claimResult(profile),false);
  assert.deepEqual(profile,before);
 }
});

test('finished rewards can be claimed exactly once and use the played course',()=>{
 const profile=freshProfile(),g=new Game(profile,1);
 assert.equal(g.claimResult(profile),false);
 g.award(10000);g.cleared=10;g.finish('clear');
 assert.equal(g.claimResult(profile),true);
 assert.equal(profile.tickets,40);
 assert.equal(profile.unlocked,3);
 assert.deepEqual(profile.best,[0,10,0]);
 g.finish('lost');
 assert.equal(g.claimResult(profile),false);
 assert.equal(profile.tickets,40);
 assert.equal(g.events.filter(e=>e.type==='finish').length,1);
});
