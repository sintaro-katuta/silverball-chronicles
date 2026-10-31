import {startingBallDistribution,MAX_WAGER_TICKETS} from '../domain/starting-ball-wager.js';
import './starting-wager.css';

const fmt=n=>n.toLocaleString('ja-JP');
export async function mountStartingWager(root,{wallet,onPlay,isCancelled=()=>false,playLabel=balls=>`${fmt(balls)}玉でプレイ開始`}){
 const state=await wallet.snapshot();if(isCancelled())return;
 const host=root.querySelector('#starting-wager'),play=root.querySelector('#playMachine');
 const max=Math.min(MAX_WAGER_TICKETS,state.tickets),pending=state.active?.phase==='ready'?state.active:null;
 host.innerHTML=`<div class="wager-heading"><h3>開始玉チャレンジ</h3><p>所持チケット <strong id="ticket-balance">${fmt(state.tickets)}</strong>枚</p></div><p class="hint">チケットを使って開始玉の上乗せに挑戦。増玉なしでも400玉で遊べます。</p><div id="wager-choice" ${pending?'hidden':''}><label for="wager-count">賭けるチケット <output id="wager-count-label">1</output>枚</label><input id="wager-count" type="range" min="1" max="${Math.max(1,max)}" value="1" step="1" ${max===0?'disabled':''}><div id="wager-probabilities" class="wager-probabilities" aria-label="開始玉と確率"></div><p class="hint">使ったチケットは、抽選結果にかかわらず消費します。1プレイにつき1回。</p><button id="wager-draw" type="button" ${max===0?'disabled':''}>1枚使って抽選する</button>${max===0?'<p class="hint">遊技で払い出しを得るとチケットを獲得できます。</p>':''}</div><p id="wager-result" class="wager-result" role="status" tabindex="-1" ${pending?'':'hidden'}></p><p id="wager-error" role="alert" class="hint" hidden></p>`;
 const input=host.querySelector('#wager-count'),draw=host.querySelector('#wager-draw'),error=host.querySelector('#wager-error');
 const renderDistribution=()=>{
  const count=Number(input.value);host.querySelector('#wager-count-label').textContent=count;
  draw.textContent=`${count}枚使って抽選する`;
  host.querySelector('#wager-probabilities').innerHTML=startingBallDistribution(count).map(outcome=>`<span><b>${fmt(outcome.balls)}玉</b><small>${(outcome.probability*100).toLocaleString('ja-JP',{maximumFractionDigits:2})}%</small></span>`).join('');
 };
 const showPending=a=>{
  host.querySelector('#wager-choice').hidden=true;
  const result=host.querySelector('#wager-result');result.hidden=false;
  result.textContent=a.stake===0?'開始玉は400玉です。':`${a.stake}枚使用 · ${a.balls===400?'増玉なし · ':''}開始玉 ${fmt(a.balls)}玉`;
  play.textContent=playLabel(a.balls);
 };
 const fail=e=>{console.error(e);error.hidden=false;error.textContent='チケットを保存できませんでした。もう一度お試しください。';};
 input.oninput=renderDistribution;renderDistribution();play.textContent=playLabel(400);if(pending)showPending(pending);
 let busy=false;
 draw.onclick=async()=>{
  if(busy)return;busy=true;draw.disabled=true;play.disabled=true;input.disabled=true;error.hidden=true;
  try{
   const active=await wallet.begin(Number(input.value));
   const saved=await wallet.snapshot();if(isCancelled())return;
   host.querySelector('#ticket-balance').textContent=fmt(saved.tickets);showPending(active);host.querySelector('#wager-result').focus();
  }catch(e){if(!isCancelled()){fail(e);draw.disabled=max===0;input.disabled=max===0;}}
  finally{busy=false;if(!isCancelled())play.disabled=false;}
 };
 play.onclick=async()=>{
  if(busy)return;busy=true;play.disabled=true;draw.disabled=true;input.disabled=true;error.hidden=true;
  try{const active=await wallet.begin(0);if(!isCancelled())await onPlay(active);}
  catch(e){if(!isCancelled()){fail(e);play.disabled=false;busy=false;}}
 };
 play.disabled=false;
}
