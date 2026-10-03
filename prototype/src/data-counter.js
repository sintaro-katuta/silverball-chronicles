// A session data lamp, separate from the cabinet and from gameplay truth.
export function dataCounterMarkup({practice,endless,sound,debug}){
 return `<div class="machine-dashboard" aria-label="台上データ表示器：今回の遊技">
  <div class="counter-toolbar"><span class="counter-session">今回の遊技${practice?' · 試遊':''}</span><div>
   ${debug?'<button id="debug" class="audio-button">調整</button>':''}
   <button id="specs" class="audio-button">仕様</button><button id="chart" class="audio-button">差玉</button><button id="viewMode" class="audio-button" aria-label="台の表示切り替え">全体</button><button id="sound" class="audio-button">音 ${sound?'ON':'OFF'}</button><button id="pause" class="icon-button" aria-label="一時停止">Ⅱ</button>
  </div></div>
  <div class="counter-face">
   <div class="counter-hits"><span>大当り</span><strong id="counterJackpots">0</strong><small id="counterState">通常</small></div>
   <div class="counter-starts"><span title="大当り後に完了した回転数">スタート</span><strong id="sinceJackpot">0</strong><small>総スタート <b id="counterTotalStarts">0</b></small></div>
   <button id="liveBalance" class="live-balance" aria-label="差玉グラフを拡大"></button>
  </div>
  <div class="counter-game"><span class="stage">STAGE <b id="stage">01</b> / ${endless?'∞':'10'}</span><span>持ち玉 <b id="stock">400</b><small> 玉</small></span><span>突破 <b id="progressText">0</b><small id="target">玉</small></span></div>
  <div class="progress"><i id="progressBar"></i></div>
 </div>`;
}
export function updateDataCounter(root,game){
 const fmt=n=>Math.floor(n).toLocaleString('ja-JP');
 root.querySelector('#counterJackpots').textContent=fmt(game.jackpots);
 root.querySelector('#sinceJackpot').textContent=fmt(game.pityCount);
 root.querySelector('#counterTotalStarts').textContent=fmt(game.draws);
 const state=game.jackpot?'bonus':game.rush?'rush':'normal';
 root.dataset.state=state;
 root.querySelector('#counterState').textContent=state==='bonus'?'大当り中':state==='rush'?'RUSH':'通常';
}
