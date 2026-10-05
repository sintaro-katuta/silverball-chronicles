import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile,readFile} from 'node:fs/promises';

// Capture live application frames. Review fixtures are explicitly labelled;
// normal play and RUSH payout continue to use the running physics engine.
const dir='reference-review/improvements-2026-10-05';
const base=process.env.REVIEW_URL??'http://127.0.0.1:5184';
const browser=await chromium.launch({channel:'chrome',headless:true});
const selection=process.env.RECORD_SCENARIOS?.split(',');
const report=selection?JSON.parse(await readFile(dir+'/check.json','utf8')):{clips:[],errors:[],speed:'1x',audio:false};
report.complete=false;
async function caption(page,title,note='等速・無音／ローカル実装の動作確認'){
 await page.evaluate(({title,note})=>{
  let el=document.querySelector('#record-caption');
  if(!el){el=document.createElement('div');el.id='record-caption';Object.assign(el.style,{position:'fixed',left:'16px',bottom:'12px',zIndex:'10000',pointerEvents:'none',background:'#070e1bef',color:'#f1e8d3',padding:'10px 16px',fontFamily:'DotGothic16, sans-serif',fontSize:'19px',borderLeft:'3px solid #d4b77d',maxWidth:'650px'});document.body.append(el);}
  el.replaceChildren();const t=document.createElement('div');t.textContent=title;const n=document.createElement('div');n.textContent=note;n.style.cssText='font-size:13px;color:#bccddd;margin-top:5px';el.append(t,n);
 },{title,note});
}
async function start(name,scenario=''){
 const context=await browser.newContext({viewport:{width:1280,height:900},recordVideo:{dir:dir+'/raw',size:{width:1280,height:900}}});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push({name,error:String(e)}));
 const started=Date.now();await page.goto(base+(scenario?'/?review=session&scenario='+scenario:'/'));
 await page.locator('[data-unit="0"]').click();
 return {context,page,name,started};
}
async function play(c){
 await c.page.locator('#playMachine').click();await c.page.locator('#intro-skip').waitFor({timeout:60000});await c.page.locator('#intro-skip').click();
 await c.page.waitForFunction(()=>window.__session?.snapshot()&&!__session.snapshot().intro.active);
}
async function finish(c,from,checks){
 const until=(Date.now()-c.started)/1000;const video=c.page.video();await c.context.close();
 const clip={name:c.name,raw:await video.path(),from,until,checks},index=report.clips.findIndex(v=>v.name===c.name);if(index<0)report.clips.push(clip);else report.clips[index]=clip;
 await writeFile(dir+'/check.json',JSON.stringify(report,null,2));console.log(c.name,JSON.stringify(checks));
}
async function fixtureBall(page,kind='start'){
 await page.evaluate(kind=>{
  const g=__sessionReview.game(),m=__sessionReview.model(),p=m.flow.physics.pockets.find(p=>p.kind===kind),tray=p.captureTray;
  const shot=g.fire();if(!shot)throw Error('No paid shot available');
  const b=m.flow.physics.spawn(shot,0);Object.assign(b,{x:tray?(tray.left+tray.right)/2:p.x,y:tray?tray.y-tray.radius-b.r-1:p.y-4,vx:0,vy:80,leftLaunchPlane:true});
 },kind);
}
try{
 if(!selection||selection.includes('natural-only')){
  const c=await start('01-natural-play');await play(c);const from=(Date.now()-c.started)/1000;
  await caption(c.page,'① 通常遊技：自然発射・実入賞・状態進行');await c.page.waitForTimeout(10000);
  const s=await c.page.evaluate(()=>__session.snapshot());assert.ok(s.spawned>5);assert.equal(s.session.accounting.reconciled,true);
  await finish(c,from,{spawned:s.spawned,spent:s.session.accounting.spent,reconciled:true});
  report.clips=report.clips.filter(c=>c.name!=='01-guidance-and-natural-play');report.clips.sort((a,b)=>a.name==='01-natural-play'?-1:b.name==='01-natural-play'?1:0);
 }
 for(const scenario of ['reach-loss','development-loss','development-win']){
  if(selection&&!selection.includes(scenario))continue;
  const c=await start(scenario,scenario);const {page}=c;await play(c);await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();
  await page.locator('[data-view=lcd]').click();const from=(Date.now()-c.started)/1000;
  await caption(page,scenario==='reach-loss'?'⑤ リーチ止まり → 外れ':scenario==='development-loss'?'⑥ 発展 → 外れ → 通常復帰':'⑦ 発展 → 当たり → 役物・図柄停止','確認用：結果／演出を指定、ヘソ直上へ有料の実球を配置');
  await page.waitForTimeout(1200);await fixtureBall(page);
  if(scenario==='development-win'){await page.waitForFunction(()=>__sessionReview.game().draws>=1&&!__sessionReview.game().spinActive);await page.waitForTimeout(600);await fixtureBall(page);}
  await page.waitForFunction(()=>!!__session.snapshot().spin?.reach,{timeout:20000});
  const reach=await page.evaluate(()=>__session.snapshot().spin.reach);assert.equal(reach.developed,scenario!=='reach-loss');
  await page.waitForTimeout(scenario==='reach-loss'?600:2200);await page.screenshot({path:dir+'/'+scenario+'-stage.png'});
  await page.waitForFunction(()=>!__session.snapshot().spin?.reach,{timeout:15000});
  const outcome=await page.evaluate(()=>({snap:__session.snapshot(),draw:__sessionReview.game().lastDraw}));assert.equal(outcome.draw,scenario==='development-win');
  await page.screenshot({path:dir+'/'+scenario+'-result.png'});await page.waitForTimeout(1600);
  if(scenario==='development-win'){await page.locator('[data-view=whole]').click();await caption(page,'当たり後の筐体連動・右打ちの払出へ','確認用：当選指定／抽選の再判定なし');await page.waitForTimeout(5000);await page.screenshot({path:dir+'/win-whole.png'});}
  await finish(c,from,{developed:reach.developed,reachDuration:reach.duration,won:outcome.draw,draws:outcome.snap.spin.draws});
 }
 if(!selection||selection.includes('rush-natural-payout')){
 const r=await start('rush-natural-payout','rush');await play(r);const rushFrom=(Date.now()-r.started)/1000;
 await r.page.locator('#controls-toggle').click();await caption(r.page,'⑧ RUSH：普図 → 電チュー → V入賞待ち → 払出','確認用：初期RUSH・初回当選のみ固定／玉は自然発射・実入賞');
 const phases=new Set(),samples=[];let paid=false;
 for(let i=0;i<600;i++){
  await r.page.waitForTimeout(100);const s=await r.page.evaluate(()=>({snapshot:__session.snapshot(),label:document.querySelector('#session-state').textContent}));samples.push(s);phases.add(s.label);
  if(s.snapshot.w?.pendingV&&!phases.has('v-shot')){await r.page.screenshot({path:dir+'/rush-v-wait.png'});phases.add('v-shot');}
  if(s.snapshot.w?.bonus&&s.snapshot.session.total>100){paid=true;await r.page.screenshot({path:dir+'/rush-payout.png'});await r.page.waitForTimeout(4500);break;}
 }
 assert.ok(paid,'Natural RUSH admissions did not reach payout');assert.ok([...phases].includes('右打ち・V入賞待ち'));
 await finish(r,rushFrom,{naturalPayout:true,phases:[...phases],last:samples.at(-1).snapshot});
 await writeFile(dir+'/rush-samples.json',JSON.stringify(samples,null,2));
 const mobile=await browser.newPage({viewport:{width:390,height:844}});await mobile.goto(base);await mobile.locator('[data-unit="0"]').click();await mobile.locator('#playMachine').click();await mobile.locator('#intro-skip').waitFor({timeout:60000});await mobile.locator('#intro-skip').click();await mobile.locator('#controls-toggle').click();
 await mobile.screenshot({path:dir+'/controls-mobile.png'});assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth),390);await mobile.close();
 }
 for(const scenario of ['charge','v-expiry','rush-end']){
  if(selection&&!selection.includes(scenario))continue;
  const c=await start(scenario,scenario==='charge'?'charge':'rush');await play(c);const {page}=c;
  await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();
  await page.locator('[data-view=lcd]').click();const from=(Date.now()-c.started)/1000;
  if(scenario==='charge'){
   await caption(page,'⑨ CHARGE：777とは分けて300個の払出へ','確認用：チャージ指定、ヘソ直上へ有料の実球2玉を配置');
   await fixtureBall(page);await page.waitForFunction(()=>__sessionReview.game().draws>=1&&!__sessionReview.game().spinActive);await page.waitForTimeout(400);await fixtureBall(page);
   await page.waitForFunction(()=>__sessionReview.game().jackpot?.charge);await page.screenshot({path:dir+'/charge-banner.png'});await page.waitForTimeout(1600);
   await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await caption(page,'CHARGE：実入賞で払出 → 通常へ復帰','確認用：当選固定／ここから玉は自然発射・実入賞');
   await page.waitForFunction(()=>__sessionReview.game().lastBonus?.charge,{timeout:60000});
   const g=await page.evaluate(()=>({payout:__sessionReview.game().lastBonus.payout,rush:__sessionReview.game().rush,reconciled:__sessionReview.game().accounting.reconciled}));
   assert.equal(g.payout,300);assert.equal(g.rush,null);assert.equal(g.reconciled,true);await page.waitForTimeout(2500);await page.screenshot({path:dir+'/charge-return.png'});await finish(c,from,g);
  }else if(scenario==='v-expiry'){
   await caption(page,'⑩ V未入賞：待機 → 時間切れ／払出成立なし','確認用：当選指定、普図口・電チューへ有料の実球を配置／発射停止');
   await fixtureBall(page,'fuzu');await page.waitForFunction(()=>__sessionReview.game().w.electricOpen);await page.waitForTimeout(300);await fixtureBall(page,'rush');await page.waitForTimeout(300);await fixtureBall(page,'rush');
   await page.waitForFunction(()=>__sessionReview.game().w.pendingV);await page.screenshot({path:dir+'/v-expiry-wait.png'});await page.waitForFunction(()=>!__sessionReview.game().w.pendingV);
   const g=await page.evaluate(()=>({vMissed:__sessionReview.game().w.events.some(e=>e.type==='vMissed'),jackpots:__sessionReview.game().jackpots,bonus:__sessionReview.game().w.bonus}));
   assert.equal(g.vMissed,true);assert.equal(g.jackpots,0);assert.equal(g.bonus,null);await page.waitForTimeout(2000);await page.screenshot({path:dir+'/v-expiry-return.png'});await finish(c,from,g);
  }else{
   await page.evaluate(()=>{const g=__sessionReview.game();g.w.rush.remaining=1;g.w.rng=()=>.9;g.syncW();});
   await caption(page,'⑪ RUSH残り1回 → 外れ → 通常へ復帰','境界確認用：残1回・外れ指定、普図口へ有料の実球1玉を配置');
   await fixtureBall(page,'fuzu');await page.waitForFunction(()=>__sessionReview.game().rush===null);await page.waitForTimeout(1000);await page.screenshot({path:dir+'/rush-end.png'});await page.waitForTimeout(6500);
   const g=await page.evaluate(()=>({remaining:__sessionReview.game().lastRush.remaining,mode:__session.snapshot().mode,reconciled:__sessionReview.game().accounting.reconciled}));assert.equal(g.remaining,0);assert.equal(g.mode,'normal');await finish(c,from,g);
  }
 }
 assert.deepEqual(report.errors,[]);report.complete=true;await writeFile(dir+'/check.json',JSON.stringify(report,null,2));
}finally{await browser.close();}
