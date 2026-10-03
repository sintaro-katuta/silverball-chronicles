import {wSpecRows} from './w-spec-display.js';
import {swipeDirection,pageAfter} from './floor-paging.js';
import '@fontsource/dotgothic16/japanese-400.css';
import '@fontsource/dotgothic16/latin-400.css';
import './floor.css';
import './pixi-session.css';
import './arcade-room.css';
import {FLOOR_ONE} from './floor-catalog.js';
import {mountFloorArt,mountCabinetArt} from './floor-art.js';
import {mountBoard} from './pixi/board-runtime.js';
import {SessionGame} from './pixi/session-game.js';
const root=document.querySelector('#app'),fmt=n=>Math.floor(n).toLocaleString('ja-JP');
let art=null,board=null,game=null,selected=FLOOR_ONE[0],generation=0,finishing=false,feeding=true,reviewModel=null;
const review=import.meta.env.DEV&&new URLSearchParams(location.search).get('review')==='session';
const reviewLabel=()=>review?'<div class="review-label">接続確認用・当選を指定</div>':'';
function cleanup(){generation++;art?.destroy();art=null;board?.dispose();board=null;game=null;reviewModel=null;finishing=false;}
const mobileFloor=matchMedia('(max-width:700px)');let floorState={page:0,level:1};
mobileFloor.addEventListener('change',()=>{if(root.querySelector('.arcade-room'))floor();});
async function floor(){cleanup();const version=generation,mobile=mobileFloor.matches,level=mobile?floorState.level:1;
 const items=level===1?(mobile?FLOOR_ONE.slice(floorState.page*4,floorState.page*4+4):FLOOR_ONE):[];
 root.innerHTML=`<main class="floor-shell arcade-room ${mobile?'paged-floor':''}" aria-label="台選択"><section class="arcade-floor"><div class="floor-grid-wrap"><div class="floor-art-host" id="floorArt"></div><div class="floor-grid">${items.map(u=>`<button class="floor-machine" data-unit="${FLOOR_ONE.indexOf(u)}" data-kind="${u.kind}" aria-label="${u.unit}番台・${u.kind==='main'?'稼働中、選択できます':'調整中'}" ${u.kind==='dummy'?'disabled':''}><span class="floor-machine-art"></span><span class="machine-number">${String(u.unit).padStart(2,'0')}</span></button>`).join('')}</div>${level===2?'<div class="floor-coming"><strong>2F</strong><span>準備中</span><small>下へスワイプで1Fへ</small></div>':''}${mobile?`<nav class="room-paging" aria-label="フロア移動"><button data-move="previous" aria-label="前のページ" ${level!==1||floorState.page===0?'disabled':''}>‹</button><span aria-live="polite">${level}F · ${level===1?`${floorState.page+1} / 5`:'準備中'}</span><button data-move="next" aria-label="次のページ" ${level!==1||floorState.page===4?'disabled':''}>›</button><button data-move="${level===1?'up':'down'}" aria-label="${level===1?'2階へ':'1階へ'}">${level===1?'↑':'↓'}</button></nav>`:''}</div></section></main>`;
 const change=direction=>{const next=pageAfter(floorState,direction);if(next.page!==floorState.page||next.level!==floorState.level){floorState=next;floor();}};
 root.querySelectorAll('[data-kind="main"]').forEach(b=>b.onclick=()=>{selected=FLOOR_ONE[Number(b.dataset.unit)];details();});
 root.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>change(b.dataset.move));
 if(mobile){const area=root.querySelector('.floor-grid-wrap');let start=null,suppressUntil=0;
 area.addEventListener('pointerdown',e=>{if(e.isPrimary)start={x:e.clientX,y:e.clientY};});
 area.addEventListener('pointercancel',()=>{start=null;});
 area.addEventListener('pointerup',e=>{if(!start)return;const direction=swipeDirection(e.clientX-start.x,e.clientY-start.y);start=null;if(direction){e.preventDefault();suppressUntil=performance.now()+400;change(direction);}});
 area.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 }
 const mounted=await mountFloorArt(root.querySelector('#floorArt'));if(version!==generation){mounted.destroy();return;}art=mounted;
}
async function details(){cleanup();const version=generation;
 root.innerHTML=`<main class="detail-page"><button id="back">← 台選択</button><header class="session-header"><h1>${selected.name}</h1><span>${selected.unit}番台</span></header><section class="detail-grid"><div id="detailArt"></div><div><h2>蒼月の起動</h2><dl>${wSpecRows().map(([name,value])=>`<div><dt>${name}</dt><dd>${value}</dd></div>`).join('')}</dl><button id="playMachine" class="primary">プレイ開始</button></div></section>${reviewLabel()}</main>`;
 root.querySelector('#back').onclick=floor;root.querySelector('#playMachine').onclick=play;const mounted=await mountCabinetArt(root.querySelector('#detailArt'),selected.unit-1,'main');if(version!==generation){mounted.destroy();return;}art=mounted;
}
function reviewSetup({game:g,model}){
 reviewModel=model;
 // Dev-only fixture exercises real admissions and presentation; never imported by release play.
 if(g.isWMachine){const scenario=new URLSearchParams(location.search).get('scenario');let draws=0;g.rng=()=>.9;g.w.rng=()=>++draws===(scenario==='rush'?1:2)?(scenario==='charge'?.75/199.9:0):.9;if(scenario==='rush'){g.startRush();model.setMode('rush');}}
 else {let normal=0;const create=g.createDraw.bind(g);g.createDraw=(...args)=>{const saved=g.rng;let calls=0;g.rng=()=>++calls===1?(args[1]==='normal'&&++normal===2?0:.9):.6;try{return create(...args);}finally{g.rng=saved;}};}
 g.reviewEntryVariant='slash';
}
async function play(){cleanup();const version=generation;game=new SessionGame();feeding=true;
 root.innerHTML=`<main class="play-page focus-view"><button id="controls-toggle" class="controls-toggle" aria-controls="play-controls" aria-expanded="false">操作・情報</button><div class="play-layout"><section class="board-frame"><div id="canvas" aria-label="パチンコ盤面"></div></section><aside id="play-controls" class="session-panel" aria-label="操作・遊技情報" hidden><header class="session-header"><b>月影機関 <small>${selected.unit}番台</small></b><button id="menu">メニュー</button></header><div class="stock"><span>持ち玉</span><strong id="stock">400</strong></div><dl><div><dt>累計払出</dt><dd id="total">0</dd></div><div><dt>回転数</dt><dd id="draws">0</dd></div><div><dt>大当り</dt><dd id="wins">0</dd></div></dl><button id="feed-toggle" class="primary">発射停止</button><label>左打ちの強さ <output id="power-label">0.24</output><input id="power-control" type="range" min="0.18" max="0.30" step="0.01" value="0.24"></label><p class="hint">右打ちは案内に合わせて自動で切り替わります。</p>${reviewLabel()}</aside></div><div id="dialog-host"></div></main>`;
 const toggle=root.querySelector('#controls-toggle'),panel=root.querySelector('#play-controls'),page=root.querySelector('.play-page');
 toggle.onclick=()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'閉じる':'操作・情報';page.classList.toggle('controls-open',open);if(!open)toggle.focus();};
 root.querySelector('#menu').onclick=menu;
 root.querySelector('#feed-toggle').onclick=()=>{feeding=!feeding;board?.feed(feeding);root.querySelector('#feed-toggle').textContent=feeding?'発射停止':'発射開始';};
 root.querySelector('#power-control').oninput=e=>{board?.power(+e.target.value);root.querySelector('#power-label').textContent=Number(e.target.value).toFixed(2);};
 try{const mounted=await mountBoard(root,{production:true,sessionGame:game,unit:selected,reviewHook:review?reviewSetup:null,onUpdate:update});if(version!==generation){mounted.dispose();return;}board=mounted;}catch(error){console.error(error);if(version===generation){root.innerHTML='<main><h1>盤面を読み込めませんでした</h1><p>再度台を選んでお試しください。</p><button id=back>台選択へ</button></main>';root.querySelector('#back').onclick=floor;}}
}
function update(s){if(!game)return;game.pendingBalls=s.inFlight;game.events.length=0;
 for(const [id,value]of [['stock',game.stock],['total',game.total],['draws',game.draws],['wins',game.jackpots]]){const el=root.querySelector('#'+id);if(el)el.textContent=fmt(value);}
 if(game.phase==='result'&&!finishing){finishing=true;result();}
}
function menu(){if(!board||finishing)return;board.pause(true);root.querySelector('#dialog-host').innerHTML=`<div class="modal-backdrop"><section role="dialog" aria-modal="true" aria-label="遊技メニュー"><h2>一時停止</h2><button id="resume" class="primary">遊技に戻る</button><button id="leave">遊技を終了</button></section></div>`;root.querySelector('#resume').onclick=()=>{root.querySelector('#dialog-host').innerHTML='';board.pause(false);};root.querySelector('#leave').onclick=()=>{game.finish('retired');finishing=true;result();};root.querySelector('#resume').focus();}
function result(){board?.pause(true);const a=game.accounting;root.querySelector('#dialog-host').innerHTML=`<div class="modal-backdrop"><section role="dialog" aria-modal="true" aria-label="遊技結果"><h2>RESULT</h2><div class="result-total">${fmt(game.total)}<small>累計払出</small></div><dl><div><dt>最終持ち玉</dt><dd>${fmt(game.stock)}</dd></div><div><dt>発射数</dt><dd>${fmt(a.spent)}</dd></div><div><dt>回転数 / 大当り</dt><dd>${game.draws} / ${game.jackpots}</dd></div></dl><button id="floor" class="primary">台選択へ</button></section></div>`;root.querySelector('#floor').onclick=floor;root.querySelector('#floor').focus();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)menu();});document.addEventListener('keydown',e=>{if(e.key==='Escape')menu();const dialog=root.querySelector('[role=dialog]');if(e.key==='Tab'&&dialog){const buttons=[...dialog.querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});window.addEventListener('pagehide',cleanup);window.addEventListener('pageshow',e=>{if(e.persisted)floor();});
window.__session={snapshot:()=>board?.snapshot()??null};
if(review)window.__sessionReview={game:()=>game,board:()=>board,model:()=>reviewModel};
floor();
