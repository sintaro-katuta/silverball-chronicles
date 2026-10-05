import test from 'node:test';
import assert from 'node:assert/strict';
import {SessionGame} from '../src/pixi/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {queuedHoldPrediction} from '../src/pixi/hold-prediction.js';

const bonus=(g,prefix)=>{let id=0;while(g.jackpot){g.jackpot.gap=0;g.openWRound();for(let n=10-g.jackpot.count;n>0;n--)g.hit({id:`${prefix}-${id++}`},'bonus');}};
function rig(){
 const game=new SessionGame(()=>.9),model=createBoardFlow({lcd:true});
 attachNormalSpin(model.flow,{sessionGame:game,roundModel:model,lifecycle:true,presentationPatterns:true});
 const stepUntil=predicate=>{for(let n=0;n<20000&&!predicate();n++)model.flow.step(.05);assert.ok(predicate(),'state not reached');};
 return {game,model,stepUntil};
}
test('existing RUSH misses keep admission odds, cue and FIFO through guaranteed transition',()=>{
 const {game:g,stepUntil}=rig();g.startRush();
 g.w.rng=()=>0;g.hit({id:'winning'},'fuzu');
 g.w.rng=()=>.9;for(let n=0;n<4;n++)g.hit({id:`old-${n}`},'fuzu');
 const old=[...g.w.queues.fuzu],cues=old.map(r=>queuedHoldPrediction(r,g));
 assert.ok(old.every(r=>r.odds===95.3&&!r.guaranteed));
 stepUntil(()=>g.w.electricOpen);
 g.w.rng=()=>0;g.hit({id:'electric-1'},'rush');g.hit({id:'electric-2'},'rush');
 for(let n=0;n<2;n++){stepUntil(()=>g.w.pendingV);g.hit({id:`v-${n}`},'bonus');bonus(g,`bonus-${n}`);}
 assert.equal(g.w.rush.guaranteed,true);assert.equal(g.w.rush.remaining,5);
 assert.deepEqual(g.w.queues.fuzu,old);assert.deepEqual(old.map(r=>queuedHoldPrediction(r,g)),cues);
 stepUntil(()=>g.spinResult?.drawId===old[0].id);
 assert.equal(g.spinResult.win,false);assert.notEqual(g.spinResult.presentationPlan.route,'flash');
 // One newly admitted guaranteed draw waits behind all four old holds.
 g.w.rng=()=>.9;g.hit({id:'new-guaranteed'},'fuzu');const guaranteed=g.w.queues.fuzu.at(-1);
 assert.equal(guaranteed.odds,1);assert.equal(guaranteed.guaranteed,true);assert.equal(queuedHoldPrediction(guaranteed,g),'none');
 stepUntil(()=>g.w.electricOpen);
 const resolved=g.w.events.filter(e=>e.type==='drawResolved'&&e.kind==='fuzu');
 assert.deepEqual(resolved.slice(1,5).map(r=>[r.id,r.outcome,r.odds]),old.map(r=>[r.id,'miss',95.3]));
 assert.equal(resolved.at(-1).id,guaranteed.id);assert.equal(resolved.at(-1).outcome,'electric-open');
 assert.equal(g.w.queues.fuzu.length,0);assert.equal(g.wBatch.maxPayout,6000);assert.equal(g.wBatch.payout,3000);
 assert.equal(g.accounting.reconciled,true);
});
test('guaranteed admission stays winning after a later normal RUSH reset',()=>{
 const {game:g,stepUntil}=rig();g.startRush();g.w.rush.odds=1;g.w.rush.guaranteed=true;g.w.rng=()=>.9;
 g.hit({id:'saved-guarantee'},'fuzu');const record=g.w.active.fuzu;
 g.w.startRush();g.syncW();assert.equal(g.w.rush.odds,undefined);
 stepUntil(()=>g.spinResult);assert.equal(g.spinResult.win,true);assert.equal(g.spinResult.presentationPlan.route,'flash');
 stepUntil(()=>g.w.electricOpen);assert.equal(g.w.events.find(e=>e.type==='drawResolved'&&e.id===record.id).outcome,'electric-open');
});
