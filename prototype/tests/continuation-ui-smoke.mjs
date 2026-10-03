import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const success of [true,false]){
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date('2026-09-23T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-09-23T00:00:01Z'));
  await page.goto('http://localhost:5173');await page.locator('#start').click();
  await page.locator('#auto').click();
  await page.locator('#debug').click();
  for(const [name,value] of Object.entries({targetBase:10000000,stock:5000,rushEntryRate:success?100:0,rushOdds:100000,weight4:100,weight6:0,weight10:0}))await page.locator(`[name=${name}]`).fill(String(value));
  await page.getByRole('button',{name:'適用して再開'}).click();
  await page.locator('#debug').click();await page.locator('[data-rounds="4"]').click();
  const snapshot=()=>page.evaluate(()=>window.__pachinko.snapshot());
  let state;
  for(let n=0;n<35;n++){await page.clock.runFor(1000);state=await snapshot();if(state.jackpot)break;}
  assert.ok(state.jackpot,'forced initial 4R enters payout');assert.equal(state.jackpot.rounds,4);assert.equal(state.jackpot.fromRush,false);assert.equal(state.total,0);
  await page.locator('#auto').click();
  for(let n=0;n<300;n++){await page.clock.runFor(250);state=await snapshot();if(state.jackpot?.challenge)break;}
  assert.ok(state.jackpot?.challenge,'challenge appears during fourth-round payout');assert.equal(state.jackpot.challenge.win,null);
  const panel=page.locator('.rush-screen');assert.equal(await panel.getAttribute('data-verdict'),'pending');
  await page.locator('#pause').click();const frozen=await snapshot();await page.clock.runFor(2000);const afterPause=await snapshot();
  assert.equal(afterPause.phase,'paused');assert.deepEqual(afterPause.jackpot,frozen.jackpot);assert.equal(afterPause.total,frozen.total);
  await page.locator('#resume').click();
  for(let n=0;n<20;n++){await page.clock.runFor(100);state=await snapshot();if(state.jackpot?.challenge?.win!==null)break;}
  assert.ok(state.jackpot,'challenge result is shown before payout ends');assert.equal(state.jackpot.challenge.win,success);assert.equal(state.jackpot.rounds,4);
  await page.clock.runFor(100);assert.match(await panel.innerText(),success?/RUSH 突入/:/挑戦終了/);
  await page.screenshot({path:`screenshots/rush-entry-${success?'success':'failure'}.png`});
  for(let n=0;n<100;n++){await page.clock.runFor(100);state=await snapshot();if(!state.jackpot)break;}
  assert.equal(state.jackpot,null);assert.equal(state.physics.bonus,40,'all 40 physical attacker entries are paid');assert.equal(state.accounting.basePrize,600,'4R base payout is 600 balls');assert.equal(state.total,600);assert.equal(state.rightPlay,success);
  if(success){assert.ok(state.rush);assert.equal(state.rush.remaining,100);assert.equal(state.rush.total,600);assert.equal(state.rush.chain,1);}
  else{assert.equal(state.rush,null);await page.clock.runFor(100);assert.match(await panel.innerText(),/挑戦終了/);assert.match(await panel.innerText(),/左打ち/);}
  assert.deepEqual(errors,[]);console.log(`Initial 4R ${success?'success → RUSH':'failure → normal'}: frozen challenge pause, 40 physical entries / 600 payout verified.`);
  await page.close();
 }
}finally{await browser.close();}
