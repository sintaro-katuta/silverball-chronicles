import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
test('actual bonus admissions lead to 100 entry-driven rush draws then automatic normal return',()=>{
 const m=createBoardFlow({lcd:true,normalPower:.24}),s=attachNormalSpin(m.flow,{reach:true,win:true,roundModel:m,lifecycle:true});m.setMode('normal');m.flow.start();let sawRush=false;
 // The diagnostic event list retains only the latest 100 admissions. Count
 // accepted real-entry calls over the whole lifecycle, including rejected
 // admissions and normal entries that can evict earlier RUSH records.
 let acceptedRush=0;const enqueue=s.game.enqueueDraw.bind(s.game);
 s.game.enqueueDraw=(count,source,mode,origin)=>{const accepted=enqueue(count,source,mode,origin);if(source==='rush'&&mode==='rush')acceptedRush+=accepted;return accepted;};
 for(let i=0;i<600*120;i++){m.flow.step(1/120);if(s.game.rush&&!s.game.jackpot&&s.game.previewWinAt===undefined){sawRush=true;assert.equal(m.getMode(),'rush');}if(s.game.lastRush&&!s.game.rush&&m.getMode()==='normal')break;}
 assert.equal(sawRush,true);assert.equal(s.game.lastRush?.consumed,100);assert.equal(m.getMode(),'normal');assert.equal(m.tulip.state().target,0);assert.equal(s.game.lastBonus.payout,m.flow.counts.bonus*15);assert.equal(s.game.lastBonus.payout,900);assert.equal(acceptedRush,100);assert.ok(s.events.length<=100);assert.equal(s.game.previewWinAt,undefined);
 console.log(JSON.stringify({time:s.game.time,bonus:m.flow.counts.bonus,rushEntries:m.flow.counts.rush,draws:s.game.lastRush.consumed,acceptedRush,retainedRush:s.events.filter(e=>e.mode==='rush'&&e.accepted).length}));
});
test('non-RUSH bonus returns to normal only after the door closes',()=>{
 const m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow,{reach:true,win:true,roundModel:m,lifecycle:true});s.game.pendingGrade=4;s.game.startJackpot();s.game.jackpot.entryEligible=false;s.game.previewWinAt=0;
 for(let i=0;i<90*120;i++)m.flow.step(1/120);
 assert.equal(s.game.rush,null);assert.equal(m.getMode(),'normal');assert.equal(m.attacker.state().progress,0);assert.equal(s.game.previewWinAt,undefined);
});
test('RUSH win pays from real attacker entries and resumes at 100 with remaining holds',()=>{
 const m=createBoardFlow({lcd:true,normalPower:.24}),s=attachNormalSpin(m.flow,{reach:true,win:true,rushWin:true,roundModel:m,lifecycle:true});m.setMode('normal');m.flow.start();let winning=false,held=0,bonusBefore=0,selectedPayout=0;
 for(let i=0;i<600*120;i++){
  m.flow.step(1/120);
  if(!winning&&s.game.previewRushWin){winning=true;selectedPayout=s.game.jackpot.payoutAmount;held=s.game.rushHolds.length;bonusBefore=m.flow.counts.bonus;assert.equal(s.game.jackpot.fromRush,true);assert.equal(m.getMode(),'right-closed');}
  if(winning&&s.game.previewWinAt===undefined&&m.getMode()==='rush')break;
 }
 assert.ok(winning);assert.equal(s.game.lastBonus.fromRush,true);assert.ok([500,1500,3000].includes(selectedPayout));assert.equal(s.game.lastBonus.payout,selectedPayout);assert.equal(s.game.rush.chain,2);assert.equal(s.game.rush.remaining,100);
 assert.equal(s.game.lastBonus.payout,(m.flow.counts.bonus-bonusBefore)*s.game.lastBonus.awardPerBall);assert.equal(s.game.rushHolds.length,held);assert.equal(s.game.previewWinAt,undefined);
 console.log(JSON.stringify({time:s.game.time,payout:s.game.lastBonus.payout,bonus:m.flow.counts.bonus,held}));
});

test('ending holds normal draws through result and pauses on the shared clock',()=>{
 const m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow,{roundModel:m,lifecycle:true});
 s.game.startRush();s.game.enqueueDraw(1,'start','normal');const held=s.game.normalHolds[0];
 s.game.rush.remaining=0;s.game.resolveDraw(false,[7,6,6]);
 for(let i=0;i<2*120;i++)m.flow.step(1/120);
 assert.equal(s.game.spinActive,false);assert.equal(s.game.normalHolds[0],held);
 const before=s.game.time;m.flow.pause(true);m.flow.step(2);assert.equal(s.game.time,before);m.flow.pause(false);
 for(let i=0;i<2*120;i++)m.flow.step(1/120);
 assert.equal(s.game.spinActive,false);assert.equal(s.game.normalHolds[0],held);
 for(let i=0;i<6*120;i++)m.flow.step(1/120);
 assert.equal(s.game.normalHolds.length,0);assert.equal((s.game.activeDraw??s.game.lastResolvedDraw).id,held.id);
});

test('normal holds during RUSH do not close the electric chucker',()=>{
 const m=createBoardFlow({lcd:true}),s=attachNormalSpin(m.flow,{roundModel:m,lifecycle:true});
 s.game.startRush();m.setMode('rush');
 for(let i=0;i<s.game.machine.holdLimit;i++)s.game.enqueueDraw(1,'start','normal');
 m.gate.snapshot=()=>({lastPass:m.flow.physics.time});
 m.flow.step(1/120);assert.equal(m.tulip.state().target,1);
});
