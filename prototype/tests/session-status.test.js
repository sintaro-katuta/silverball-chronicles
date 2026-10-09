import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionStatus,wAcquisitionLabel} from '../src/ui/session-status.js';
test('status follows announced mechanics through RUSH without leaking a pending win',()=>{
 const game={phase:'playing',rush:{remaining:0},w:{},spinActive:true,spinResult:{win:true}};
 assert.deepEqual(sessionStatus(game),{label:'RUSH・チャンス演出中',remaining:0});
 game.spinResult.win=false;assert.equal(sessionStatus(game).label,'RUSH・チャンス演出中');
 game.presentation={win:true};assert.equal(sessionStatus(game).label,'リーチ演出中・結果待ち');
 game.w.electricOpen=true;assert.equal(sessionStatus(game).label,'右打ちを続けて');
 game.w.electricOpen=false;game.w.pendingV=true;assert.equal(sessionStatus(game).label,'右打ちを続けて');
 game.jackpot={charge:false};assert.equal(sessionStatus(game).label,'大当り・獲得中');
 game.jackpot.charge=true;assert.equal(sessionStatus(game).label,'チャージ・獲得中');
 game.phase='result';assert.deepEqual(sessionStatus(game),{label:'遊技終了',remaining:null});
});
test('LCD acquisition guidance uses announced openings and stops at actual bonus',()=>{
 const game={phase:'playing',w:{electricOpen:true},spinResult:{win:true}};
 assert.equal(wAcquisitionLabel(game),'右打ちを続けて');game.w.pendingV=true;
 assert.equal(wAcquisitionLabel(game),'右打ちを続けて');game.jackpot={};assert.equal(wAcquisitionLabel(game),null);
 game.jackpot=null;game.presentation={win:true};assert.equal(wAcquisitionLabel(game),null);
});
test('normal and RUSH idle differ; unresolved records are never read',()=>{
 const game={phase:'playing',w:{}};
 for(const property of ['queues','active'])Object.defineProperty(game.w,property,{get(){throw new Error('unannounced lottery accessed');}});
 Object.defineProperty(game,'spinResult',{get(){throw new Error('win accessed');}});
 assert.deepEqual(sessionStatus(game),{label:'左打ち中・始動口への入賞待ち',remaining:null});
 game.rush={remaining:130};assert.deepEqual(sessionStatus(game),{label:'RUSH',remaining:130});
});

test('normal idle guidance follows launch, pause and empty-stock state',()=>{
 const g={phase:'playing',stock:400,w:{}};
 assert.equal(sessionStatus(g,{feeding:false}).label,'発射停止中・再開できます');
 assert.equal(sessionStatus(g,{paused:true}).label,'一時停止中');
 g.stock=0;assert.equal(sessionStatus(g).label,'玉切れ・残り玉を確認中');
 g.stopTimer=.2;assert.equal(sessionStatus(g).label,'図柄停止・次の変動待ち');
});

 test('stopped launch prompts right launch only after publicly announced acquisition',()=>{
  const game={phase:'playing',w:{},presentation:{win:true}};
  assert.equal(sessionStatus(game,{feeding:false}).label,'リーチ演出中・結果待ち');
  game.jackpot={charge:false};
  assert.equal(sessionStatus(game,{feeding:false}).label,'発射開始を押して右打ち');
  assert.equal(sessionStatus(game,{feeding:true}).label,'大当り・獲得中');
  assert.equal(sessionStatus(game,{feeding:false,paused:true}).label,'一時停止中');
  game.jackpot=null;game.w.pendingV=true;
  assert.equal(sessionStatus(game,{feeding:false}).label,'発射開始を押して右打ち');
 });
