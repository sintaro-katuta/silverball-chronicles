import {createPinTexture} from './pin-texture.js';
import {Application,Assets,Sprite,Texture,Rectangle,Container,Graphics} from 'pixi.js';
import {createPartFlow} from '../part-flow-fixture.js';
import {startFrameLoop} from '../runtime/frame-loop.js';
import {createSilverBallTexture} from './silver-ball.js';
import '@fontsource/dotgothic16/japanese-400.css';
import '@fontsource/dotgothic16/latin-400.css';
import './attacker-preview.css';
const el=id=>document.getElementById(id),app=new Application(),asset=await Assets.load('/assets/normal-pocket/normal-pocket-v1.png');asset.source.scaleMode='nearest';
await app.init({width:256,height:320,resolution:1,antialias:false,autoStart:false,background:0x060d1a,preference:'webgl'});el('canvas').append(app.canvas);
const scale=3,origin={x:67-128/scale,y:562},point=p=>({x:(p.x-origin.x)*scale,y:(p.y-origin.y)*scale});
const rear=new Sprite(asset);rear.position.set(80,129);rear.width=96;rear.height=96;app.stage.addChild(rear);
const ballsLayer=new Container(),insideLayer=new Container();app.stage.addChild(insideLayer);
const cut=Math.round(asset.height*.49),frontTexture=new Texture({source:asset.source,frame:new Rectangle(0,cut,asset.width,asset.height-cut)}),front=new Sprite(frontTexture);front.position.set(rear.x,rear.y+96*cut/asset.height);front.width=96;front.height=96*(asset.height-cut)/asset.height;app.stage.addChild(front,ballsLayer);
const pins=new Graphics(),guides=new Graphics();app.stage.addChild(pins,guides);
const ballTexture=createSilverBallTexture();
const pinTexture=createPinTexture();
const pinSprites=[];

let flow,sprites=new Map(),ghosts=new Map(),receipts=[],previous=performance.now(),demo=false;
function reset(){for(const s of [...sprites.values(),...ghosts.values()])s.destroy();sprites.clear();ghosts.clear();receipts=[];flow=createPartFlow('normal',{launchPower:.5});const hit=flow.game.hit.bind(flow.game);flow.game.hit=(b,kind,...args)=>{if(kind==='normal'&&Math.abs(b.x-67)<10)receipts.push({id:b.id,x:b.x,y:b.y,time:flow.physics.time});hit(b,kind,...args);};pins.clear();for(const s of pinSprites)s.destroy();pinSprites.length=0;
 for(const p of flow.physics.pins){const q=point(p);if(q.x<0||q.x>256||q.y<0||q.y>320)continue;const s=new Sprite(pinTexture);s.anchor.set(.5);s.position.set(Math.round(q.x),Math.round(q.y));app.stage.addChild(s);pinSprites.push(s);}
 flow.start();demo=true;previous=performance.now();}
function render(){const alive=new Set();for(const b of flow.physics.balls){alive.add(b.id);let s=sprites.get(b.id);if(!s){s=new Sprite(ballTexture);s.anchor.set(.5);ballsLayer.addChild(s);sprites.set(b.id,s);}const q=point(b);s.position.set(q.x,q.y);s.visible=q.x>-15&&q.x<271&&q.y>-15&&q.y<335;}
 for(const [id,s]of sprites)if(!alive.has(id)){s.destroy();sprites.delete(id);}
 const active=new Set();for(const r of receipts){const t=(flow.physics.time-r.time)/.26;if(t<0||t>=1)continue;active.add(r.id);let s=ghosts.get(r.id);if(!s){s=new Sprite(ballTexture);s.anchor.set(.5);insideLayer.addChild(s);ghosts.set(r.id,s);}const q=point({x:r.x+(67-r.x)*.3*t,y:617+3*t});s.position.set(q.x,q.y);s.scale.set(1-.7*t);s.alpha=1-t*t;}
 for(const [id,s]of ghosts)if(!active.has(id)){s.destroy();ghosts.delete(id);}
 el('shots').textContent=flow.physics.metrics.spawned;el('hits').textContent=receipts.length;el('outs').textContent=flow.counts.out;el('pause').textContent=flow.paused?'再開':'一時停止';el('step').textContent=demo?(flow.game.time<30?'実発射で確認中':'発射終了・残った玉を排出'):'手動確認';
 guides.clear();if(el('guides').checked){const p=flow.physics.pockets.find(p=>p.kind==='normal'&&p.id===0),a=point({x:p.x-p.w/2,y:p.y}),b=point({x:p.x+p.w/2,y:p.y});guides.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:0x65ff95,width:1});}app.render();}
el('demo').onclick=reset;el('feed').onclick=()=>{demo=false;flow.continuous?flow.stop():flow.start();};el('pause').onclick=()=>flow.pause(!flow.paused);
reset();const stop=startFrameLoop(now=>{const dt=(now-previous)/1000;previous=now;if(document.hidden)return;if(demo&&flow.game.time>=30)flow.stop();flow.step(dt);render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)flow.pause(true);});window.addEventListener('pagehide',()=>{stop();app.destroy(true,{children:true});frontTexture.destroy(false);ballTexture.destroy(true);pinTexture.destroy(true);},{once:true});
window.__normalPocket={snapshot:()=>({time:flow.game.time,paused:flow.paused,counts:{...flow.counts},spawned:flow.physics.metrics.spawned,inFlight:flow.physics.balls.length,pocket:{...flow.physics.pockets.find(p=>p.kind==='normal'&&p.id===0)},receipts:[...receipts]})};render();
