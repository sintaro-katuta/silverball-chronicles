import '@fontsource/dotgothic16/japanese-400.css';
import '@fontsource/dotgothic16/latin-400.css';
import '../ui/pixi-session.css';
import {mountStartingWager} from '../ui/starting-wager.js';
import {SessionTicketWallet} from '../domain/session-ticket-wallet.js';
import {SessionGame} from '../domain/session-game.js';

const root=document.querySelector('#app'),fmt=n=>n.toLocaleString('ja-JP');
let wallet,generation=0;
function shell(content){
 root.innerHTML=`<main class="detail-page"><section class="detail-specs"><h1>開始玉・チケットの確認用</h1><p class="review-label">確認専用 · 通常プレイのチケットには反映されません</p><p class="hint">実プレイを待たずに、50枚を使って開始玉の抽選と獲得表示を確認できます。払い出しの確認は指定値の見本です。</p><button id="preview-reset">50枚に戻してやり直す</button> <a href="/">本編へ</a>${content}</section></main>`;
 root.querySelector('#preview-reset').onclick=reset;
}
async function showWager(){
 const version=++generation;
 shell('<section id="starting-wager" aria-label="開始玉チャレンジ"></section><button id="playMachine" class="primary" disabled>開始状態を確認</button>');
 await mountStartingWager(root,{wallet,isCancelled:()=>version!==generation,playLabel:balls=>`${fmt(balls)}玉の開始状態を確認`,onPlay:async active=>{
  await wallet.start(active.id);if(version!==generation)return;
  const game=new SessionGame(Math.random,{startingBalls:active.balls});
  shell(`<h2>開始玉 ${fmt(game.stock)}玉</h2><p>使ったチケット ${active.stake}枚</p><form id="payout-example"><label for="preview-payout">確認用の累計払い出し（玉）</label><input id="preview-payout" type="number" min="0" step="1" value="400" required><p class="hint">0玉→0枚、1〜399玉→1枚、400〜899玉→2枚。発射消費は差し引きません。</p><button id="preview-settle" class="primary">指定した払い出しで獲得表示を確認</button></form><p id="preview-result" role="status"></p><button id="preview-again" hidden>この残高でもう一度試す</button>`);
  root.querySelector('#payout-example').onsubmit=async event=>{
   event.preventDefault();const payout=Number(root.querySelector('#preview-payout').value);
   if(!Number.isSafeInteger(payout)||payout<0)return;
   root.querySelector('#preview-settle').disabled=true;
   game.award(payout,{basePrize:payout,source:'preview-fixture'});game.finish('retired');
   const reward=await wallet.finish(active.id,game.total);if(version!==generation)return;
   root.querySelector('#preview-result').textContent=`確認用の払い出し ${fmt(payout)}玉 → 獲得チケット ${fmt(reward.earned)}枚 · 所持 ${fmt(reward.balance)}枚`;
   root.querySelector('#preview-again').hidden=false;root.querySelector('#preview-again').onclick=showWager;
  };
 }});
}
function reset(){
 let value=JSON.stringify({version:1,tickets:50,serial:0,active:null,lastResult:null});
 wallet=new SessionTicketWallet({read:async()=>value,write:async next=>{value=next;}});
 void showWager();
}
reset();
