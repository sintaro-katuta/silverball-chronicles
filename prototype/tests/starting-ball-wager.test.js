import test from 'node:test';
import assert from 'node:assert/strict';
import {startingBallDistribution,drawStartingBalls,payoutTickets} from '../src/domain/starting-ball-wager.js';
import {SessionGame} from '../src/domain/session-game.js';
import {SessionTicketWallet} from '../src/domain/session-ticket-wallet.js';

function storage(initial=null){let value=initial;return {read:async()=>value,write:async next=>{value=next;},raw:()=>value};}
function funded(tickets){return JSON.stringify({version:1,tickets,serial:0,active:null,lastResult:null});}

test('all stakes keep exact totals, ordered upper prizes, and improve every paid outcome',()=>{
 let previous=null;
 for(let stake=1;stake<=50;stake++){
  const rows=startingBallDistribution(stake),weights=rows.map(r=>r.weight);
  assert.equal(weights.reduce((sum,n)=>sum+n,0),4900);
  assert.ok(weights.every(n=>Number.isInteger(n)&&n>0));
  assert.ok(weights[1]>weights[2]&&weights[2]>weights[3]&&weights[3]>weights[4]);
  if(previous){assert.ok(weights[0]<previous[0]);for(let i=1;i<5;i++)assert.ok(weights[i]>previous[i]);}
  previous=weights;
 }
 assert.deepEqual(startingBallDistribution(1).map(r=>r.probability),[.5,.25,.15,.07,.03]);
 assert.deepEqual(startingBallDistribution(50).map(r=>r.probability),[.1,.3,.25,.2,.15]);
});

test('draw intervals include each lower boundary and exclude the upper boundary',()=>{
 assert.equal(drawStartingBalls(0,()=>{throw new Error('No roll for a free start');}),400);
 for(let stake=1;stake<=50;stake++){
  let weight=0;
  for(const row of startingBallDistribution(stake)){
   assert.equal(drawStartingBalls(stake,()=>weight/4900),row.balls);
   assert.equal(drawStartingBalls(stake,()=>(weight+row.weight-.001)/4900),row.balls);
   weight+=row.weight;
  }
 }
 for(const n of [-1,.5,51,NaN,Infinity,'1'])assert.throws(()=>drawStartingBalls(n),RangeError);
 for(const roll of [-.1,1,NaN,Infinity])assert.throws(()=>drawStartingBalls(1,()=>roll),RangeError);
});

test('ticket thresholds include one paid ball; no cap, stage, upgrade or consumed-ball deduction',()=>{
 for(const [payout,expected] of [[0,0],[1,1],[399,1],[400,2],[899,2],[900,3],[1599,3],[1600,4],[10000,10],[250000,50],[1000000,100]])assert.equal(payoutTickets(payout),expected);
 const g=new SessionGame(()=>.9,{startingBalls:1000});
 assert.equal(g.initial,1000);assert.equal(g.total,0);assert.equal(g.ticketEstimate,0);
 g.cleared=10;g.profile.upgrades.tickets=99;g.award(400,{basePrize:400});
 for(let i=0;i<200;i++)g.fire();
 assert.equal(g.ticketEstimate,2);assert.equal(g.accounting.reconciled,true);
 assert.deepEqual(g.confirmedReward,{payout:2,stages:0,upgrade:0,tickets:2});
 for(const practice of [true,false]){const next=new SessionGame();next.practice=practice;next.addStock(500,'supply');assert.equal(next.ticketEstimate,0);next.award(1);assert.equal(next.ticketEstimate,practice?0:1);}
 assert.throws(()=>new SessionGame(Math.random,{startingBalls:999}),RangeError);
});

test('prepared results persist through reopen, duplicate clicks and different requested stakes',async()=>{
 const saved=storage(funded(50)),first=new SessionTicketWallet(saved);
 const [a,b]=await Promise.all([first.begin(10,()=>.999),first.begin(10,()=>{throw new Error('Second roll');})]);
 assert.equal(a.balls,1000);assert.deepEqual(a,b);assert.equal((await first.snapshot()).tickets,40);
 const reopened=new SessionTicketWallet(saved);
 assert.deepEqual(await reopened.begin(0,()=>{throw new Error('No reload roll');}),a);
 assert.equal((await reopened.snapshot()).tickets,40);
 await reopened.start(a.id);
 await assert.rejects(reopened.start(a.id));await assert.rejects(reopened.begin(1));
});

test('finished prizes are banked once; reload credits recorded prizes without restoring a paid start',async()=>{
 const saved=storage(),wallet=new SessionTicketWallet(saved),a=await wallet.begin(0);
 await wallet.start(a.id);await wallet.record(a.id,400);
 const reopened=new SessionTicketWallet(saved),recovered=await reopened.recover();
 assert.deepEqual(recovered,{id:a.id,payout:400,earned:2,balance:2});
 assert.equal(await reopened.recover(),null);
 assert.equal((await reopened.finish(a.id,400)).balance,2);
 const next=await reopened.begin(1,()=>0);assert.equal(next.balls,400);
 assert.equal((await reopened.snapshot()).tickets,1);
 await reopened.start(next.id);await reopened.record(next.id,1);
 const [one,two]=await Promise.all([reopened.finish(next.id,900),reopened.finish(next.id,900)]);
 assert.equal(one.balance,4);assert.deepEqual(one,two);
 await assert.rejects(reopened.record(next.id,1000));
 assert.equal((await reopened.snapshot()).tickets,4);
});

test('invalid stakes, unavailable storage and corrupt saves never silently grant or erase tickets',async()=>{
 const saved=storage(funded(2)),wallet=new SessionTicketWallet(saved),before=saved.raw();
 for(const stake of [-1,3,51,1.1,'1',Infinity])await assert.rejects(wallet.begin(stake));
 assert.equal(saved.raw(),before);
 const failing=new SessionTicketWallet({read:saved.read,write:async()=>{throw new Error('Storage full');}});
 await assert.rejects(failing.begin(1,()=>.999));assert.equal(saved.raw(),before);
 const active=await wallet.begin(1,()=>.999);await wallet.start(active.id);await wallet.record(active.id,400);
 await assert.rejects(wallet.record(active.id,399));
 await assert.rejects(failing.finish(active.id,900));assert.equal((await wallet.snapshot()).tickets,1);
 assert.equal((await wallet.finish(active.id,900)).balance,4);
 for(const raw of ['broken','{}',JSON.stringify({version:1,tickets:-1,serial:0}),JSON.stringify({version:1,tickets:1,serial:1,active:{id:1,stake:1,balls:777,phase:'ready',payout:0}})]){
  const bad=storage(raw);await assert.rejects(new SessionTicketWallet(bad).snapshot());assert.equal(bad.raw(),raw);
 }
});
