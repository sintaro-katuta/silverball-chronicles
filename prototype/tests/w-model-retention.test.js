import test from 'node:test';
import assert from 'node:assert/strict';
import {W_NORMAL_MODEL,wPublishedNormalOutcome,wNormalSymbolProbability,wPresentationWinProbability} from '../src/domain/tokyoghoul-w-spec.js';
import {WMachine} from '../src/domain/tokyoghoul-w-machine.js';
import {SessionGame} from '../src/domain/session-game.js';

test('normal model matches public symbol and charge odds with conditional entry separate',()=>{
 const d=W_NORMAL_MODEL.combinedOdds;
 assert.ok(Math.abs(d-199.95)<1e-10);assert.equal(W_NORMAL_MODEL.branches.reduce((n,b)=>n+b.share,0),1);
 assert.ok(Math.abs(wNormalSymbolProbability()-1/399.9)<1e-15);
 const charge=W_NORMAL_MODEL.branches.filter(b=>b.outcome==='charge').reduce((n,b)=>n+b.share,0)/d;
 assert.ok(Math.abs(charge-1/399.9)<1e-15);
 const probes=[[0,'symbol',true],[.252/d,'charge',true],[.3/d,'symbol',false],[.8/d,'charge',false],[1/d,'miss',false]];
 for(const [roll,outcome,entry] of probes)assert.deepEqual(wPublishedNormalOutcome(roll),{outcome,entry});
 assert.ok(Math.abs(wPresentationWinProbability('tokuzu1')-1/399.9)<1e-15);
 assert.equal(wPresentationWinProbability('fuzu'),1/95.3);
 assert.equal(wPresentationWinProbability('fuzu',1),1);
});

test('consumed W diagnostics are bounded without losing payout or replaying events',()=>{
 const g=new SessionGame(()=>.9);
 for(let id=1;id<=10000;id++){g.hit({id},'normal');g.retireBallIds([],id+1);}
 assert.equal(g.total,50000);assert.equal(g.stock,50400);assert.equal(g.accounting.reconciled,true);
 assert.equal(g.w.events.length,2048);assert.equal(g.w.eventSequence,20000);assert.equal(g.wEventCursor,20000);
 assert.equal(g.w.seen.size,0);assert.equal(g.w.retiredBallIdBefore,10001);
 g.syncW();g.hit({id:1},'normal');g.hit({id:9999},'normal');
 assert.equal(g.total,50000);assert.equal(g.w.eventSequence,20000);
 g.hit({id:10001},'normal');assert.equal(g.total,50005);assert.equal(g.w.eventSequence,20002);
});

test('pruning consumed history never drops unconsumed events or resets sequence',()=>{
 const m=new WMachine();for(let n=0;n<20;n++)m.emit('fixture');
 m.pruneConsumedEvents(5,4);
 assert.deepEqual(m.events.map(e=>e.sequence),Array.from({length:15},(_,n)=>n+6));
 assert.equal(m.eventsSince(10).length,10);
 m.pruneConsumedEvents(20,4);m.emit('next');
 assert.equal(m.events.at(-1).sequence,21);assert.deepEqual(m.eventsSince(20).map(e=>e.sequence),[21]);
});

test('live older balls constrain retirement, and stale V callbacks cannot grant another bonus',()=>{
 const g=new SessionGame(()=>.9);g.hit({id:5},'normal');g.hit({id:10},'normal');
 g.retireBallIds([{id:5},{id:7}],11);assert.equal(g.w.retiredBallIdBefore,5);assert.ok(g.w.seen.has(5));
 g.hit({id:5},'normal');assert.equal(g.total,10);
 g.retireBallIds([{id:7}],11);assert.equal(g.w.retiredBallIdBefore,7);assert.equal(g.w.seen.has(5),false);
 g.retireBallIds([{id:3}],11);assert.equal(g.w.retiredBallIdBefore,7);
 g.w.pendingV={drawId:1,followupRoll:.9};g.hit({id:5},'bonus');assert.ok(g.w.pendingV);assert.equal(g.w.bonus,null);assert.equal(g.total,10);
 g.hit({id:7},'bonus');assert.equal(g.w.pendingV,null);assert.equal(g.w.bonus.count,1);assert.equal(g.total,25);
});
