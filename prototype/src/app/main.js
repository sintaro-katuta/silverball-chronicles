import {createPresentationSound} from '../pixi/se/presentation-sound.js';
import {prefetchBoardAssets} from '../pixi/board-asset-loader.js';
import {sessionStatus} from "../ui/session-status.js";
import {wSpecRows} from "../ui/w-spec-display.js";
import {swipeDirection,pageAfter} from "../ui/floor-paging.js";
import "@fontsource/dotgothic16/japanese-400.css";
import "@fontsource/dotgothic16/latin-400.css";
import "../ui/floor.css";
import "../ui/pixi-session.css";
import "../ui/arcade-room.css";
import {FLOOR_ONE} from "../ui/floor-catalog.js";
import {mountFloorArt} from "../ui/floor-art.js";
import {mountBoard} from "../pixi/board-runtime.js";
import {SessionGame} from "../domain/session-game.js";
const root=document.querySelector('#app'),fmt=n=>Math.floor(n).toLocaleString('ja-JP');
let experience=null;
let art=null,board=null,sessionSound=null,game=null,selected=FLOOR_ONE[0],generation=0,finishing=false,feeding=true,reviewModel=null;
const review=import.meta.env.DEV&&new URLSearchParams(location.search).get('review')==='session';
const reviewLabel=()=>{if(!review)return '';const scenario=new URLSearchParams(location.search).get('scenario'),labels={'predictions':'予告確認用：当落・経路を指定','development-loss':'確認用：発展外れ（演出指定）','development-win':'確認用：発展当たり（当選指定）','reach-loss':'確認用：リーチ止まり・外れ（演出指定）'};return `<div class="review-label">${labels[scenario]??'接続確認用・当選を指定'}</div>`;};
function cleanup(){generation++;art?.destroy();art=null;board?.dispose();board=null;sessionSound?.dispose();sessionSound=null;game=null;reviewModel=null;finishing=false;}
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
async function details(){cleanup();void prefetchBoardAssets();
 root.innerHTML=`<main class="detail-page"><button id="back">← 台選択</button><header class="session-header"><h1>${selected.name}</h1><span>${selected.unit}番台</span></header><section class="detail-specs"><h2>蒼月の起動</h2><dl>${wSpecRows().map(([name,value])=>`<div><dt>${name}</dt><dd>${value}</dd></div>`).join('')}</dl><p class="hint">台の全体と液晶は、プレイ開始後にご覧いただけます。</p><p class="hint" id="shared-pin-layout">${selected.note}</p><button id="playMachine" class="primary">プレイ開始</button><div class="experience-entry"><h3>演出を体験する</h3><p class="hint">本遊技の持ち玉を使わず、指定した演出を再生します。本遊技の抽選・結果とは別です。</p><button data-experience="battle">戦闘・PUSH</button><button data-experience="bonus">大当り・払い出し</button><button data-experience="rush">RUSH</button></div></section>${reviewLabel()}</main>`;
 root.querySelector('#back').onclick=floor;root.querySelector('#playMachine').onclick=()=>play();root.querySelectorAll('[data-experience]').forEach(b=>b.onclick=()=>play(b.dataset.experience));
}
function reviewSetup({game:g,model}){
 reviewModel=model;
 // Dev-only fixture exercises real admissions and presentation; never imported by release play.
 if(g.isWMachine){const scenario=new URLSearchParams(location.search).get('scenario');let draws=0;g.rng=()=>.9;g.w.rng=()=>++draws===(scenario==='rush'?1:2)?(scenario==='charge'?.75/199.9:0):.9;if(scenario==='rush'){g.startRush();model.setMode('rush');}}
 else {let normal=0;const create=g.createDraw.bind(g);g.createDraw=(...args)=>{const saved=g.rng;let calls=0;g.rng=()=>++calls===1?(args[1]==='normal'&&++normal===2?0:.9):.6;try{return create(...args);}finally{g.rng=saved;}};}
 const scenario=new URLSearchParams(location.search).get('scenario');
 if(['development-loss','reach-loss'].includes(scenario)){g.w.rng=()=>.9;g.reviewPresentationRoute=scenario==='development-loss'?'battle':'basic';g.reviewDevelopment=scenario==='development-loss';}
 if(scenario==='development-win')g.reviewPresentationRoute='battle';
 g.reviewEntryVariant='slash';
}
function experienceSetup({game:g,model}){
 // This isolated session never writes a profile or changes a real session's rolls.
 g.practice=true;g.w.rng=()=>0;g.reviewPresentationRoute=experience==='bonus'?'direct':experience==='rush'?'flash':'battle';
 g.reviewReachVariant='pressure';g.reviewEntryVariant='slash';
 if(experience==='rush'){g.startRush();model.setMode('rush');g.w.enqueue('fuzu',0);}
 else g.w.enqueue('tokuzu1',0);
 const hit=g.hit.bind(g);g.hit=(ball,kind,id)=>{if(kind!=='start')hit(ball,kind,id);};
 if(experience==='battle')model.flow.stop();
}
async function play(demoScenario=null){cleanup();experience=demoScenario;const sound=sessionSound=createPresentationSound();void sound.unlock();const version=generation;game=new SessionGame();game.reducedEffects=matchMedia('(prefers-reduced-motion: reduce)').matches;feeding=experience!=='battle';
 root.innerHTML=`<main class="play-page focus-view"><button id="controls-toggle" class="controls-toggle" aria-controls="play-controls" aria-expanded="false" hidden>操作・情報</button><div id="machine-loading" class="machine-loading"><div><p role="status">台を準備中…</p><button id="loading-back">詳細に戻る</button></div></div><button id="intro-menu" class="controls-toggle" hidden>メニュー</button><button id="intro-skip" class="intro-skip" hidden disabled>演出をスキップ</button><nav class="view-switch" aria-label="台の表示範囲" hidden><button type="button" data-view="whole" aria-pressed="false">全体</button><button type="button" data-view="board" aria-pressed="true">盤面</button><button type="button" data-view="lcd" aria-pressed="false">液晶</button></nav><div class="play-layout"><section class="board-frame"><div id="canvas" aria-label="パチンコ盤面"></div></section><aside id="play-controls" class="session-panel" aria-label="操作・遊技情報" hidden><header class="session-header"><b>月影機関 <small>${selected.unit}番台</small></b><button id="menu">メニュー</button></header><div class="stock"><span>${experience?'体験用玉':'持ち玉'}</span><strong id="stock">400</strong></div><dl><div><dt>累計獲得玉数</dt><dd id="total">0</dd></div><div><dt>消化回数（通常＋RUSH）</dt><dd id="draws">0回</dd></div><div><dt>大当り</dt><dd id="wins">0</dd></div></dl><p class="hint">通常とRUSHで消化した抽選の合計（演出中を含む）</p><div class="session-state" role="status"><span id="session-state">始動口への入賞待ち</span><span id="session-remaining" hidden></span></div><label class="effect-control"><input id="effects-reduced" type="checkbox" ${game.reducedEffects?'checked':''}>演出を控えめに</label><label class="effect-control"><input id="sound-enabled" type="checkbox" checked>効果音</label><p class="hint">右打ちは案内に合わせて自動で切り替わります。</p>${reviewLabel()}</aside></div><section class="play-dock" aria-label="発射操作" hidden><div class="dock-summary"><span>${experience?'体験用玉':'持ち玉'} <strong id="dock-stock">400</strong></span><span id="feed-state" role="status">発射中</span><button id="quick-pause">一時停止</button></div><div id="dock-guidance">始動口への入賞待ち</div><div class="dock-actions"><button id="feed-toggle" class="primary">発射停止</button><label><span id="power-caption">左打ちの強さ</span> <output id="power-label">0.20</output><input id="power-control" type="range" min="0.18" max="0.30" step="0.01" value="0.20"></label></div></section><div id="dialog-host"></div></main>`;
 const toggle=root.querySelector('#controls-toggle'),panel=root.querySelector('#play-controls'),page=root.querySelector('.play-page');
 toggle.onclick=()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'閉じる':'操作・情報';page.classList.toggle('controls-open',open);if(!open)toggle.focus();};
 const introState=state=>{if(version!==generation)return;toggle.hidden=state.active;root.querySelector('#intro-skip').hidden=!state.active;root.querySelector('#intro-menu').hidden=!state.active;page.classList.toggle('intro-active',state.active);page.classList.toggle('view-ready',!state.active);root.querySelector('.view-switch').hidden=state.active;root.querySelector('.play-dock').hidden=state.active;};
 root.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{if(!board)return;board.setView(button.dataset.view);const view=board.snapshot().view;root.querySelectorAll('[data-view]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.view===view)));});
 root.querySelector('#loading-back').onclick=details;
 root.querySelector('#intro-menu').onclick=menu;
 root.querySelector('#intro-skip').onclick=()=>board?.skipIntro();
 root.querySelector('#menu').onclick=menu;root.querySelector('#quick-pause').onclick=menu;
 root.querySelector('#feed-toggle').onclick=()=>{feeding=!feeding;board?.feed(feeding);update(board?.snapshot()??{});};
 root.querySelector('#sound-enabled').onchange=e=>board?.setSound(e.target.checked);
 root.querySelector('#effects-reduced').onchange=e=>{game.reducedEffects=e.target.checked;};
 root.querySelector('#power-control').oninput=e=>{board?.power(+e.target.value);root.querySelector('#power-label').textContent=Number(e.target.value).toFixed(2);};
 try{const mounted=await mountBoard(root,{production:true,sound,sessionGame:game,unit:selected,intro:true,onIntroState:introState,isCancelled:()=>version!==generation,onLoadProgress:progress=>{if(version!==generation)return;const status=root.querySelector('#machine-loading [role=status]');if(status)status.textContent=`台を準備中… ${Math.round(progress*100)}%`;},reviewHook:experience?experienceSetup:review?reviewSetup:null,onUpdate:update});if(version!==generation){mounted.dispose();return;}board=mounted;board.feed(feeding);update(board.snapshot());root.querySelector('#machine-loading').remove();root.querySelector('#intro-skip').disabled=false;introState(mounted.snapshot().intro??{active:false});if(document.hidden)menu();}catch(error){sound.dispose();console.error(error);if(version===generation){root.innerHTML='<main><h1>盤面を読み込めませんでした</h1><p>再度台を選んでお試しください。</p><button id=back>台選択へ</button></main>';root.querySelector('#back').onclick=floor;}}
}
function update(s){if(!game)return;if(s.view)root.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===s.view)));game.pendingBalls=s.inFlight;game.events.length=0;
 for(const [id,value]of [['stock',game.stock],['total',game.total],['draws',game.draws],['wins',game.jackpots]]){const el=root.querySelector('#'+id);if(el)el.textContent=fmt(value)+(id==='draws'?'回':'');}
 const status=sessionStatus(game,{feeding,paused:s.paused}),state=root.querySelector('#session-state'),remaining=root.querySelector('#session-remaining');if(state)state.textContent=status.label;if(remaining){remaining.hidden=status.remaining===null;remaining.textContent=status.remaining===null?'':`RUSH 残り ${status.remaining} 回`;}
 const dockStock=root.querySelector('#dock-stock');if(dockStock)dockStock.textContent=fmt(game.stock);
 const feedState=root.querySelector('#feed-state');if(feedState)feedState.textContent=s.paused?'一時停止中':game.stock<=0?'玉切れ・残り演出を消化中':feeding?'発射中':'発射停止中';
 const feedButton=root.querySelector('#feed-toggle');if(feedButton){feedButton.textContent=feeding?'発射停止':'発射開始';feedButton.setAttribute('aria-pressed',String(feeding));feedButton.disabled=game.stock<=0||!!s.paused;}
 const guidance=root.querySelector('#dock-guidance');if(guidance)guidance.textContent=`${experience?'演出体験中 · ':''}${status.label}${status.remaining===null?'':` · 残り ${status.remaining} 回`}`;
 const right=s.mode!==undefined&&s.mode!=='normal',power=root.querySelector('#power-control');if(power){power.disabled=right;power.hidden=right;}
 const caption=root.querySelector('#power-caption');if(caption)caption.textContent=right?'右打ち・自動調整中':'左打ちの強さ';
 const powerLabel=root.querySelector('#power-label');if(powerLabel)powerLabel.hidden=right;
 if(game.phase==='result'&&!finishing){finishing=true;result();}
}
function dialogBackground(inert){for(const child of root.querySelector('main')?.children??[])if(child.id!=='dialog-host')child.inert=inert;}
function menu(){if(!board||finishing)return;const trigger=document.activeElement.closest('[role=dialog]')?(root.querySelector('#intro-menu:not([hidden])')??root.querySelector('#menu')):document.activeElement;board.pause(true);update(board.snapshot());dialogBackground(true);root.querySelector('#dialog-host').innerHTML=`<div class="modal-backdrop"><section role="dialog" aria-modal="true" aria-label="遊技メニュー"><h2>一時停止</h2><button id="resume" class="primary">遊技に戻る</button><button id="leave">${experience?'演出体験を終了':'遊技を終了'}</button></section></div>`;root.querySelector('#resume').onclick=()=>{root.querySelector('#dialog-host').innerHTML='';dialogBackground(false);board.pause(false);if(trigger?.isConnected)trigger.focus();};root.querySelector('#leave').onclick=()=>{if(experience){details();return;}game.finish('retired');finishing=true;result();};root.querySelector('#resume').focus();}
function result(){board?.pause(true);dialogBackground(true);const a=game.accounting;root.querySelector('#dialog-host').innerHTML=`<div class="modal-backdrop"><section role="dialog" aria-modal="true" aria-label="遊技結果"><h2>RESULT</h2><div class="result-total">${fmt(game.total)}<small>累計獲得玉数</small></div><dl><div><dt>最終持ち玉</dt><dd>${fmt(game.stock)}</dd></div><div><dt>発射数</dt><dd>${fmt(a.spent)}</dd></div><div><dt>消化回数 / 大当り</dt><dd>${fmt(game.draws)}回 / ${game.jackpots}</dd></div></dl><p class="hint">累計獲得玉数は発射消費を差し引く前の玉数です。最終持ち玉は現在使える玉。通常とRUSHで消化した抽選の合計（演出中を含む）です。</p><button id="floor" class="primary">台選択へ</button></section></div>`;root.querySelector('#floor').onclick=floor;root.querySelector('#floor').focus();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)menu();});document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(root.querySelector('#resume')){e.preventDefault();root.querySelector('#resume').click();}else if(!root.querySelector('[role=dialog]'))menu();}const dialog=root.querySelector('[role=dialog]');if(e.key==='Tab'&&dialog){const buttons=[...dialog.querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});window.addEventListener('pagehide',cleanup);window.addEventListener('pageshow',e=>{if(e.persisted)floor();});
window.__session={snapshot:()=>board?.snapshot()??null};
if(review)window.__sessionReview={game:()=>game,board:()=>board,model:()=>reviewModel};
floor();
