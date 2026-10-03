import {Application,Graphics,Assets} from 'pixi.js';
import {createDenchuFlow} from '../denchu-flow-fixture.js';
import {createPartFlow} from '../part-flow-fixture.js';
import {startFrameLoop} from '../runtime/frame-loop.js';
import {attachRightStartMotion} from './right-start-motion.js';
import {RightStartView} from './right-start-view.js';
import '@fontsource/dotgothic16/japanese-400.css';
import '@fontsource/dotgothic16/latin-400.css';
import './attacker-preview.css';
const el=id=>document.getElementById(id),app=new Application();
const housingTexture=await Assets.load('/assets/denchu/tulip-atlas-v2.png');housingTexture.source.scaleMode='nearest';
await app.init({width:256,height:320,resolution:1,antialias:false,autoStart:false,background:0x060d1a,preference:'webgl'});el('canvas').append(app.canvas);
let flow=createPartFlow(),motion=attachRightStartMotion(flow),view=new RightStartView(flow.physics,housingTexture),demo=false,previous=performance.now();app.stage.addChild(view.root);const guides=new Graphics();app.stage.addChild(guides);
function reset(electric=false){view.dispose();flow=electric?createDenchuFlow():createPartFlow();motion=flow.motion??attachRightStartMotion(flow);view=new RightStartView(flow.physics,housingTexture);app.stage.addChildAt(view.root,0);flow.start();demo=!electric;previous=performance.now();}
el('demo').onclick=()=>reset();el('electric').onclick=()=>reset(true);for(const [id,open]of [['open',true],['close',false]])el(id).onclick=()=>{if(flow.control)reset();demo=false;motion.request(open);};el('feed').onclick=()=>flow.continuous?flow.stop():flow.start();el('pause').onclick=()=>flow.pause(!flow.paused);
function render(){view.render();const m=motion.state(),open=flow.physics.rightChucker.open,t=flow.game.time;
 el('state').textContent=m.moving?(m.target?'OPENING · 開放中':'CLOSING · 閉鎖中'):(open?'OPEN · 取込状態':'CLOSED · 通過状態');el('state').dataset.open=open;
 el('step').textContent=demo?(t<5?'01 閉じた状態':t<15?'02 開放・取込み':t<20?'03 再び閉じる':'04 実演終了'):'手動確認';
 el('explanation').textContent=open?'左右の羽根が玉を中央の穴へ導き、内部へ取り込みます。':m.moving?'左右の銀色の羽根が開閉します。':'羽根は閉鎖中。玉は通路を下へ流れます。';
 el('shots').textContent=flow.physics.metrics.spawned;el('hits').textContent=flow.counts.rush;el('outs').textContent=flow.counts.out;el('pause').textContent=flow.paused?'再開':'一時停止';
 guides.clear();if(el('guides').checked){for(const {a,b}of Object.values(view.pose))guides.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:0xff527f,width:1});const p=view.physics.pockets.find(p=>p.kind==='rush'),a=view.point({x:p.x-p.w/2,y:p.y}),b=view.point({x:p.x+p.w/2,y:p.y});guides.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:0x65ff95,width:1});}
 if(flow.control){const s=flow.snapshot();el('step').textContent='電チュー実演 · RUSH';el('electricStats').textContent=`スルー ${s.passes} / 開放抽選 ${s.draws} / 開放 ${s.openings} / 始動受付 ${s.accepted} / 右保留 ${s.holds} / 消化 ${s.resolved} / 賞球 ${s.prize}`;
  if(s.jackpot)el('explanation').textContent='大当り中：電チューは閉じ、アタッカーへ切り替わります。';
  const g=flow.control.spec.gate,a=view.point({x:g.left,y:g.y}),b=view.point({x:g.right,y:g.y});guides.moveTo(a.x,a.y).lineTo(a.x,a.y-8).lineTo(b.x,a.y-8).lineTo(b.x,b.y).stroke({color:0x89e5ff,width:2});
 }else el('electricStats').textContent='機構確認：抽選・賞球なし';
 app.render();
}
const stop=startFrameLoop(now=>{const dt=(now-previous)/1000;previous=now;if(document.hidden)return;if(demo){motion.request(flow.game.time>=5&&flow.game.time<15);if(flow.game.time>=20)flow.stop();}flow.step(dt);render();});
const visibility=()=>{if(document.hidden)flow.pause(true);};document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',()=>{stop();document.removeEventListener('visibilitychange',visibility);view.dispose();app.destroy(true,{children:true});},{once:true});
window.__rightStart={snapshot:()=>({time:flow.game.time,paused:flow.paused,motion:motion.state(),counts:{...flow.counts},spawned:flow.physics.metrics.spawned,electric:flow.control?flow.snapshot():null,...view.diagnostics()}),assets:()=>view.textures.map(t=>t.source.resource.toDataURL())};render();
