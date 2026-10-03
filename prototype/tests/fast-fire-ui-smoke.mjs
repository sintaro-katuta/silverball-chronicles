import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const rate=Number(process.env.TEST_FIRE_RATE||600);
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 async function setup(){
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await page.addInitScript(()=>Math.random=()=>.8);
  await page.clock.install({time:new Date('2026-09-23T00:00:00Z')});await page.clock.pauseAt(new Date('2026-09-23T00:00:01Z'));
  await page.goto('http://localhost:5173');await page.locator('#start').click();await page.locator('#auto').click();await page.locator('#debug').click();
  for(const [name,value] of Object.entries({fireRate:rate,stock:5000,targetBase:10000000,odds:100000,rushOdds:100000,rushSpins:3,rushEntryRate:0}))await page.locator(`[name=${name}]`).fill(String(value));
  await page.getByRole('button',{name:'適用して再開'}).click();
  return {page,errors,snapshot:()=>page.evaluate(()=>window.__pachinko.snapshot())};
 }
 {
  const {page,errors,snapshot}=await setup();await page.locator('#debug').click();await page.locator('#debugRush').click();await page.locator('#auto').click();
  let state,paidAtLastEntry=null,outcomesAtLastEntry=null,peakHolds=0;
  for(let i=0;i<600;i++){
   await page.clock.runFor(25);state=await snapshot();peakHolds=Math.max(peakHolds,state.rushHolds);assert.ok(state.draws<=3);assert.ok(state.physics.rush<=3,`too many right entries: ${state.physics.rush}`);
   if(state.physics.rush===3&&state.rush&&!paidAtLastEntry){paidAtLastEntry=state.accounting.spent;outcomesAtLastEntry=state.physics.rush+state.physics.out+state.physics.returned;}
   if(state.lastRush)break;
  }
  await page.locator('#auto').click();assert.equal(state.fireRate,rate);assert.equal(state.rush,null);assert.equal(state.lastRush.consumed,3);assert.equal(state.lastRush.remaining,0);assert.equal(state.draws,3);assert.equal(state.physics.rush,3);assert.equal(state.rushHolds,0);assert.equal(state.total,3);assert.equal(state.accounting.basePrize,3);assert.equal(paidAtLastEntry,outcomesAtLastEntry,'all paid right shots must resolve to one of the three entries or an actual exit');assert.equal(paidAtLastEntry,3,'assisted right play has no physical losses');assert.ok(state.accounting.reconciled);assert.deepEqual(errors,[]);
  console.log(`${rate}/min RUSH boundary: ${paidAtLastEntry} paid right shots / 3 physical entries / 3 draws, ${peakHolds} peak holds, no extra draw.`);await page.close();
 }
 {
  const {page,errors,snapshot}=await setup();await page.locator('#debug').click();await page.locator('[data-rounds="4"]').click();let state;
  for(let i=0;i<35;i++){await page.clock.runFor(1000);state=await snapshot();if(state.jackpot)break;}
  assert.ok(state.jackpot);assert.equal(state.jackpot.rounds,4);assert.equal(state.total,0);await page.locator('#auto').click();
  const roundEntries=[0,0,0,0];let previousHits=0,highestSpentDuringBonus=0;
  for(let i=0;i<2000;i++){
   await page.clock.runFor(25);state=await snapshot();
   const gained=state.physics.bonus-previousHits;if(gained>0){const round=Math.max(1,Math.ceil(state.physics.bonus/10));roundEntries[round-1]+=gained;previousHits=state.physics.bonus;}
   if(state.jackpot){assert.ok(state.jackpot.count<=10);highestSpentDuringBonus=Math.max(highestSpentDuringBonus,state.accounting.spent);}else break;
  }
  await page.locator('#auto').click();assert.equal(state.jackpot,null);assert.equal(state.rush,null);assert.equal(state.physics.bonus,40);assert.deepEqual(roundEntries,[10,10,10,10]);assert.equal(state.total,600);assert.equal(state.accounting.basePrize,600);assert.equal(state.accounting.payout,600);assert.equal(highestSpentDuringBonus,40,'automatic spacing and gap waiting prevent losses and excess paid bonus shots');assert.ok(state.accounting.reconciled);assert.deepEqual(errors,[]);
  console.log(`${rate}/min 4R bonus: ${highestSpentDuringBonus} paid bonus shots / exactly 40 attacker entries / 600 base payout; all round caps and ledger reconcile.`);await page.close();
 }
}finally{await browser.close();}
