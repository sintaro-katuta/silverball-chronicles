import test from 'node:test';
import assert from 'node:assert/strict';
import {SessionGame} from '../src/domain/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {reachSeconds,mechanismTime} from '../src/pixi/win-sequence.js';

function fixture({mode='normal',win=false,route,ending,premium,patterns=true,id=1,charge=false,guaranteed=false}={}){
 let calls=0,seed=Math.imul(id,0x9e3779b1)>>>0;
 const rng=()=>{calls++;if(calls===1)return charge?.003:win?0:.9;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const game=new SessionGame(rng),model=createBoardFlow({lcd:true,fire:()=>null});
 game.reviewPresentationRoute=route;game.reviewReachEnding=ending;game.reviewPremium=premium;
 const spin=attachNormalSpin(model.flow,{sessionGame:game,roundModel:model,lifecycle:true,presentationPatterns:patterns});
 if(mode==='rush'){game.startRush();model.setMode('rush');if(guaranteed){game.w.rush.odds=1;game.w.rush.guaranteed=true;}}
 game.w.serial=id-1;game.hit({id:1},mode==='rush'?'fuzu':'start');
 const stepToDraw=()=>{for(let n=0;n<8000&&(game.draws<1||game.presentation);n++)model.flow.step(.01);assert.equal(game.draws,1);assert.equal(game.presentation,null);};
 return {game,model,spin,calls:()=>calls,stepToDraw};
}

test('short, direct, battle, revival, flash and premiums retain FIFO, result, pause and physical acquisition',()=>{
 for(const mode of ['normal','rush'])for(const route of ['basic','direct','battle','flash'])for(const win of [false,true]){
  if(!win&&['direct','flash'].includes(route)||mode==='normal'&&route==='flash')continue;
  const f=fixture({mode,route,win}),{game:g,model:m}=f;
  g.hit({id:2},mode==='rush'?'fuzu':'start');
  for(let n=0;n<1500&&!g.presentation;n++)m.flow.step(.01);
  assert.equal(g.presentation.displayRoute,route);assert.equal(g.presentation.win,win);
  const next=g.w.queues[mode==='rush'?'fuzu':'tokuzu1'][0],rolls=f.calls();
  m.flow.pause(true);const snapshot=f.spin.snapshot();m.flow.step(1);assert.deepEqual(f.spin.snapshot(),snapshot);m.flow.pause(false);
  assert.equal(g.previewWinAt,undefined);
  if(route==='basic'||route==='direct'){assert.equal(g.presentation.moonCue,null);assert.equal(mechanismTime(g),-1);assert.ok(reachSeconds(g.presentation,mode==='rush')<=7);}
  f.stepToDraw();assert.equal(g.lastDraw,win);assert.equal(f.calls(),rolls);assert.equal(g.w.queues[mode==='rush'?'fuzu':'tokuzu1'][0],next);
  if(route==='basic'&&!win)assert.deepEqual(g.stoppedReels,[7,7,8]);
  assert.equal(g.accounting.reconciled,true);
  if(mode==='rush'){assert.equal(g.w.electricOpen,win);assert.equal(g.jackpot,null);}
 }
 for(const [ending,premium]of [['revival',null],['standard','moon'],['standard','sword']]){
  const f=fixture({win:true,route:'battle',ending:ending==='revival'?ending:undefined,premium});
  for(let i=0;i<1500&&!f.game.presentation;i++)f.model.flow.step(.01);
  assert.equal(f.game.presentation.reachEnding,ending);assert.equal(f.game.presentation.premium,premium);
  f.stepToDraw();assert.equal(f.game.lastDraw,true);assert.equal(f.game.jackpot.charge,false);
 }
});

test('display reclassification preserves legacy RNG consumption on wins and both losing-reach transitions',()=>{
 let added=false,removed=false;
 for(const win of [false,true])for(let id=1;id<=160;id++){
  const old=fixture({win,id,patterns:false}),current=fixture({win,id});
  // Start both from exactly the same admitted record and RNG sequence.
  old.model.flow.step(.01);current.model.flow.step(.01);
  const oldReach=old.game.spinResult.reach,plan=current.game.spinResult.presentationPlan;
  if(!win&&oldReach&&plan.route==='ordinary')removed=true;
  if(!win&&!oldReach&&plan.route!=='ordinary')added=true;
  old.stepToDraw();current.stepToDraw();
  assert.equal(current.calls(),old.calls(),`${id}/${win}: legacy RNG calls`);
  assert.equal(current.game.lastDraw,old.game.lastDraw);
  assert.deepEqual(current.game.w.queues,old.game.w.queues);
  assert.equal(current.game.w.payout,old.game.w.payout);
  assert.equal(current.game.jackpot?.entryEligible,old.game.jackpot?.entryEligible);
 }
 assert.equal(added,true);assert.equal(removed,true);
});

test('charge bypasses symbol presentation; guaranteed fuzu excludes ordinary moon reliability',()=>{
 const charge=fixture({charge:true});charge.stepToDraw();assert.equal(charge.game.jackpot.charge,true);assert.equal(charge.game.presentation,null);
 const f=fixture({mode:'rush',win:true,guaranteed:true});
 for(let n=0;n<1500&&!f.game.presentation;n++)f.model.flow.step(.01);
 assert.equal(f.game.presentation.displayRoute,'flash');assert.equal(f.game.presentation.moonCue,null);f.stepToDraw();assert.equal(f.game.w.electricOpen,true);assert.equal(f.game.jackpot,null);
});
