import test from 'node:test';
import assert from 'node:assert/strict';
import {symbolForDraw,presentationReels} from '../src/presentation/reel-symbols.js';
import {SessionGame} from '../src/domain/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {reelState} from '../src/domain/reels.js';
import {specialRoutePose,specialReelStrip} from '../src/pixi/special-route-motion.js';

test('all digits can win or lose; seven has greater relative expectation, with stable cosmetic selection',()=>{
 for(const mode of ['normal','rush']){
  const counts=[Array(10).fill(0),Array(10).fill(0)];
  for(let id=1;id<=20000;id++)for(const win of [false,true]){
   const n=symbolForDraw(id,mode,win);counts[+win][n]++;
   assert.equal(symbolForDraw(id,mode,win),n);
   assert.deepEqual(presentationReels({drawId:id,mode,win},'basic'),[n,n,win?n:n%9+1]);
   if(!win){const r=presentationReels({drawId:id,mode,win},'ordinary');assert.notEqual(r[0],r[1]);assert.equal(r[0],n);}
  }
  for(let n=1;n<=9;n++)assert.ok(counts[0][n]>0&&counts[1][n]>0);
  for(let n=1;n<=9;n++)if(n!==7)assert.ok(counts[1][7]/counts[0][7]>counts[1][n]/counts[0][n]);
 }
});
test('normal/RUSH basic and direct routes land each digit, with continuous losing 9→1 wrap',()=>{
 for(const mode of ['normal','rush'])for(let symbol=1;symbol<=9;symbol++){
  for(const route of ['basic','direct']){
   const input={symbol,mode,route,win:true},decision=specialRoutePose(input).decisionAt;
   const p=specialRoutePose({...input,time:decision+.7});assert.deepEqual(p.digits,[symbol,symbol,symbol]);
   for(let i=0;i<3;i++)assert.equal(specialReelStrip(p.positions[i])[1].digit,symbol);
  }
  const input={symbol,mode,route:'basic',win:false},decision=specialRoutePose(input).decisionAt;
  assert.deepEqual(specialRoutePose({...input,time:decision-.01}).positions,specialRoutePose({...input,win:true,time:decision-.01}).positions);
  let previous=symbol;
  for(let t=0;t<=.65;t+=.01){const p=specialRoutePose({...input,time:decision+t});assert.ok(p.positions[1]>=previous-1e-9);previous=p.positions[1];}
  const p=specialRoutePose({...input,time:decision+.7});assert.deepEqual(p.digits,[symbol,symbol%9+1,symbol]);assert.equal(specialReelStrip(p.positions[1])[1].digit,symbol%9+1);
 }
});
test('all nine survive real admitted normal/RUSH short, battle, revival, flash and bonus handoff',()=>{
 for(const mode of ['normal','rush'])for(const win of [false,true])for(const route of win?['basic','direct','battle','flash']:['basic','battle'])for(let n=1;n<=9;n++){
  if(mode==='normal'&&route==='flash')continue;
  let id=1;while(symbolForDraw(id,mode,win)!==n)id++;
  const g=new SessionGame(()=>win?0:.9),m=createBoardFlow({lcd:true,fire:()=>null});
  attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true,presentationPatterns:true});
  if(mode==='rush'){g.startRush();m.setMode('rush');}
  g.reviewPresentationRoute=route;g.reviewPremium=null;
  if(route==='battle'&&win&&mode==='normal')g.reviewReachEnding='revival';
  g.w.serial=id-1;g.hit({id:1},mode==='rush'?'fuzu':'start');
  for(let k=0;k<1000&&!g.presentation;k++)m.flow.step(.01);
  assert.equal(g.presentation.win,win);assert.equal(g.reelOutcome[0],n);assert.equal(reelState(g).numbers[0],n);
  const outcome=[...g.reelOutcome];
  for(let k=0;k<1200&&g.presentation;k++)m.flow.step(.05);
  assert.equal(g.presentation,null);assert.deepEqual(g.stoppedReels,outcome);assert.equal(g.lastDraw,win);assert.equal(g.accounting.reconciled,true);
  if(g.jackpot)assert.deepEqual(reelState(g).numbers,outcome);
 }
});
test('fullrotation keeps the special 777 result',()=>{
 assert.deepEqual(presentationReels({drawId:1,mode:'normal',win:true},'battle',{fullRotation:true}),[7,7,7]);
});
