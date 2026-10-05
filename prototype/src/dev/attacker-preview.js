import {Application,Graphics} from 'pixi.js';
import {attachAttackerMotion} from '../pixi/attacker-motion.js';
import {AttackerView} from '../pixi/attacker-view.js';
import {createPartFlow} from '../physics/ball-flow.js';
import {startFrameLoop} from '../runtime/frame-loop.js';
import '@fontsource/dotgothic16/japanese-400.css';
import '@fontsource/dotgothic16/latin-400.css';
import './attacker-preview.css';
const el=id=>document.getElementById(id),app=new Application();
await app.init({width:256,height:320,resolution:1,antialias:false,autoStart:false,background:0x060d1a,preference:'webgl'});
el('canvas').append(app.canvas);
let flow=createPartFlow(),motion=attachAttackerMotion(flow),view=new AttackerView(flow.physics),demo=false,previous=performance.now(),disposed=false;
app.stage.addChild(view.root);const guides=new Graphics();app.stage.addChild(guides);
function setOpen(open){motion.request(open);}
function reset(){view.dispose();flow=createPartFlow();motion=attachAttackerMotion(flow);view=new AttackerView(flow.physics);app.stage.addChildAt(view.root,0);flow.start();demo=true;previous=performance.now();}
el('demo').onclick=reset;el('open').onclick=()=>{demo=false;setOpen(true);};el('close').onclick=()=>{demo=false;setOpen(false);};el('feed').onclick=()=>{flow.continuous?flow.stop():flow.start();};el('pause').onclick=()=>flow.pause(!flow.paused);
function render(){view.render();const open=flow.physics.gate.open,t=flow.game.time,m=motion.state();
 el('state').textContent=m.moving?(m.target?'OPENING · 開放中':'CLOSING · 閉鎖中'):(open?'OPEN · 取込状態':'CLOSED · 通過状態');el('state').dataset.open=open;
 el('step').textContent=demo?(t<5?'01 閉じた状態':t<15?'02 開放・入賞':t<20?'03 再び閉じる':'04 実演終了'):'手動確認';
 el('explanation').textContent=m.moving?'下辺を軸に、扉が手前へ倒れて受け皿になります。':open?'開いた扉で玉を受け、奥の穴へ送ります。':'閉じている間は取り込まず、玉は下の左下がりの坂を流れて落ちます。';
 el('shots').textContent=flow.physics.metrics.spawned;el('hits').textContent=flow.counts.bonus;el('outs').textContent=flow.counts.out;el('pause').textContent=flow.paused?'再開':'一時停止';
 guides.clear();if(el('guides').checked){const a=view.point(flow.physics.gate.a),b=view.point(flow.physics.gate.b),p=view.pocket,l=view.point({x:p.x-p.w/2,y:p.y}),r=view.point({x:p.x+p.w/2,y:p.y});const region=p.captureRegion;if(region){const q=view.point({x:region.left,y:region.top}),z=view.point({x:region.right,y:region.bottom});guides.rect(q.x,q.y,z.x-q.x,z.y-q.y).stroke({color:0x65ff95,width:1});}else guides.moveTo(l.x,l.y).lineTo(r.x,r.y).stroke({color:0x65ff95,width:1});for(const segment of flow.physics.colliders.filter(s=>s.role==='out-right')){const a=view.point(segment.a),b=view.point(segment.b);guides.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:0xff527f,width:1});}for(const ball of flow.physics.balls){const q=view.point(ball);guides.rect(q.x-1,q.y-1,2,2).fill(0xff527f);}}
 app.render();
}
const stop=startFrameLoop(now=>{const dt=(now-previous)/1000;previous=now;if(!document.hidden){if(demo){setOpen(flow.game.time>=5&&flow.game.time<15);if(flow.game.time>=20)flow.stop();}flow.step(dt);render();}});
const visibility=()=>{if(document.hidden)flow.pause(true);};document.addEventListener('visibilitychange',visibility);
window.addEventListener('pagehide',()=>{if(disposed)return;disposed=true;stop();document.removeEventListener('visibilitychange',visibility);view.dispose();app.destroy(true,{children:true});},{once:true});
window.__attacker={snapshot:()=>({motion:motion.state(),time:flow.game.time,paused:flow.paused,counts:{...flow.counts},spawned:flow.physics.metrics.spawned,balls:flow.physics.balls.map(({id,x,y})=>({id,x,y})),...view.diagnostics()}),assets:()=>view.textures.map(t=>t.source.resource.toDataURL())};render();
