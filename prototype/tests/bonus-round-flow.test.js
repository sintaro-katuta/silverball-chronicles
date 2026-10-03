import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
const setup=()=>{const m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow,{win:true,roundModel:m});s.game.pendingGrade=4;s.game.startJackpot();s.game.previewWinAt=0;return {m,s};};
test('real right shots fill 10, pay 150, close completely and open next round',()=>{
 const {m,s}=setup();m.flow.start();let n=0;while(!(s.rounds.snapshot().round===2&&s.rounds.snapshot().count>=1)&&n++<40*120)m.flow.step(1/120);
 const r=s.rounds.snapshot(),first=r.history.filter(e=>e.phase==='admission'&&e.round===1);assert.equal(first.length,10);assert.equal(first.at(-1).payout,150);assert.equal(r.round,2);assert.ok(r.count>=1);
 const close=r.history.find(e=>e.phase==='closing'),gap=r.history.find(e=>e.phase==='gap'),next=r.history.find(e=>e.phase==='opening'&&e.round===2);assert.ok(gap.time-close.time>=.5-1e-8);assert.ok(next.time-gap.time>=.65-1e-8);
 assert.equal(new Set(r.history.filter(e=>e.ballId!==undefined).map(e=>e.ballId)).size,m.flow.counts.bonus);assert.equal(r.payout,m.flow.counts.bonus*15);
 m.flow.pause(true);const state=s.snapshot(),pose=m.attacker.state();m.flow.step(.05);assert.deepEqual(s.snapshot(),state);assert.deepEqual(m.attacker.state(),pose);
 console.log(JSON.stringify({bonus:m.flow.counts.bonus,round:r.round,payout:r.payout,close:close.time,gap:gap.time,next:next.time}));
});
test('empty round closes on 15-second open limit with no payout',()=>{
 const {m,s}=setup();for(let i=0;i<26*120;i++)m.flow.step(1/120);const r=s.rounds.snapshot();assert.equal(r.payout,0);assert.equal(r.round,2);const open=r.history.find(e=>e.phase==='open'),close=r.history.find(e=>e.phase==='closing');assert.ok(close.time-open.time>=15);assert.ok(close.time-open.time<15.02);
});
test('high-rate arrivals never count above 10 in one round or award twice',()=>{
 const m=createBoardFlow({lcd:true,launchInterval:.05}),s=attachNormalSpin(m.flow,{win:true,roundModel:m});s.game.pendingGrade=4;s.game.startJackpot();s.game.previewWinAt=0;m.flow.start();
 for(let i=0;i<18*120;i++)m.flow.step(1/120);
 const r=s.rounds.snapshot(),entries=r.history.filter(e=>e.phase==='admission');assert.ok(entries.length>=10);assert.ok(entries.every(e=>e.count<=10));assert.equal(new Set(entries.map(e=>e.ballId)).size,entries.length);assert.equal(r.payout,entries.length*15);assert.equal(m.flow.counts.bonus,entries.length);
});
test('payout denominator uses awarded rounds and remains after timeout completion',()=>{
 for(const rounds of [4,6,10]){
  const m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow,{win:true,roundModel:m});s.game.pendingGrade=rounds;s.game.startJackpot();s.game.previewWinAt=0;
  assert.equal(s.rounds.snapshot().maxPayout,rounds*150);
  for(let i=0;i<(rounds*18+10)*120;i++)m.flow.step(1/120);
  const r=s.rounds.snapshot();assert.equal(r.phase,'finished');assert.equal(r.payout,0);assert.equal(r.maxPayout,rounds*150);
 }
});
