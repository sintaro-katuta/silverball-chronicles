import {paintResinGuide} from './resin-guide-art.js';
import {Application,Sprite,Texture,Container,Graphics} from 'pixi.js';
import {createPartFlow} from '../part-flow-fixture.js';
import {startFrameLoop} from '../runtime/frame-loop.js';
import {createSilverBallTexture} from './silver-ball.js';
import {pixelSurface,painter} from './pixel-primitives.js';
import '@fontsource/dotgothic16/japanese-400.css';
import '@fontsource/dotgothic16/latin-400.css';
import './attacker-preview.css';
const el=id=>document.getElementById(id),app=new Application();
await app.init({width:256,height:320,resolution:1,antialias:false,autoStart:false,background:0x060d1a,preference:'webgl'});el('canvas').append(app.canvas);
const scale=3,origin={x:210-128/scale,y:610},point=p=>({x:Math.round((p.x-origin.x)*scale),y:Math.round((p.y-origin.y)*scale)}),mouth=point({x:176,y:668}),width=68*scale;
const texture=paint=>{const t=Texture.from(pixelSurface(256,320,c=>paint(painter(c))));t.source.scaleMode='nearest';return t;};
const backTexture=texture(d=>{d.rect(mouth.x-8,mouth.y-7,width+16,55,'#152134');d.rect(mouth.x-5,mouth.y-4,width+10,49,'#52687b');d.rect(mouth.x,mouth.y,width,35,'#02050c');d.rect(mouth.x+5,mouth.y+5,width-10,27,'#080e19');d.rect(mouth.x+9,mouth.y+10,width-18,20,'#02050c');});
const frontTexture=texture(d=>{d.rect(0,mouth.y+34,256,320-mouth.y-34,'#060d1a');d.rect(mouth.x-8,mouth.y+25,width+16,18,'#17263b');d.rect(mouth.x-8,mouth.y+25,width+16,5,'#9fb6ca');d.rect(mouth.x-4,mouth.y+30,width+8,5,'#456079');d.rect(mouth.x-4,mouth.y+39,width+8,4,'#0d1727');for(const x of [mouth.x-7,mouth.x+width+2]){d.rect(x,mouth.y-5,5,30,'#9fb6ca');d.rect(x+2,mouth.y,3,25,'#355675');}});
app.stage.addChild(new Sprite(backTexture));const ballsLayer=new Container();app.stage.addChild(ballsLayer);const front=new Sprite(frontTexture);app.stage.addChild(front);const guides=new Graphics();app.stage.addChild(guides);const ballTexture=createSilverBallTexture();
let flow,railTexture,rails,sprites=new Map(),ghosts=new Map(),receipts=[],previous=performance.now(),demo=true;
function paintRails(){railTexture=texture(d=>{for(const c of flow.physics.colliders.filter(s=>s.role==='out-left'||s.role==='out-right'))paintResinGuide(d,point(c.a),point(c.b));});rails=new Sprite(railTexture);app.stage.addChildAt(rails,1);}
function reset(){for(const s of [...sprites.values(),...ghosts.values()])s.destroy();sprites.clear();ghosts.clear();if(rails){rails.destroy();railTexture.destroy(true);}receipts=[];flow=createPartFlow('normal',{launchPower:.5});const lose=flow.game.lose.bind(flow.game);flow.game.lose=b=>{receipts.push({id:b.id,x:b.x,y:b.y,time:flow.physics.time});lose(b);};paintRails();flow.start();demo=true;previous=performance.now();}
function render(){const alive=new Set();for(const b of flow.physics.balls){alive.add(b.id);let s=sprites.get(b.id);if(!s){s=new Sprite(ballTexture);s.anchor.set(.5);ballsLayer.addChild(s);sprites.set(b.id,s);}const q=point(b);s.position.set(q.x,q.y);s.visible=q.x>-15&&q.x<271&&q.y>-15&&q.y<335;}
 for(const [id,s]of sprites)if(!alive.has(id)){s.destroy();sprites.delete(id);}
 const active=new Set();for(const r of receipts){const t=(flow.physics.time-r.time)/.18;if(t<0||t>=1)continue;active.add(r.id);let s=ghosts.get(r.id);if(!s){s=new Sprite(ballTexture);s.anchor.set(.5);ballsLayer.addChild(s);ghosts.set(r.id,s);}const q=point({x:r.x,y:r.y+12*t});s.position.set(q.x,q.y);s.alpha=1-t;s.scale.set(1-.3*t);}
 for(const [id,s]of ghosts)if(!active.has(id)){s.destroy();ghosts.delete(id);}
 guides.clear();if(el('guides').checked){for(const c of flow.physics.colliders.filter(s=>s.role==='out-left'||s.role==='out-right')){const a=point(c.a),b=point(c.b);guides.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:0x65ff95,width:1});}const y=point({x:210,y:675}).y;guides.moveTo(0,y).lineTo(256,y).stroke({color:0xefb478,width:1});}
 el('shots').textContent=flow.physics.metrics.spawned;el('outs').textContent=flow.counts.out;el('prizes').textContent=flow.counts.normal+flow.counts.start;el('pause').textContent=flow.paused?'再開':'一時停止';el('step').textContent=demo?(flow.game.time<30?'樹脂ガイドから回収口へ':'発射終了・残った玉を排出'):'手動確認';app.render();}
el('demo').onclick=reset;el('feed').onclick=()=>{demo=false;flow.continuous?flow.stop():flow.start();};el('pause').onclick=()=>flow.pause(!flow.paused);
reset();const stop=startFrameLoop(now=>{const dt=(now-previous)/1000;previous=now;if(document.hidden)return;if(demo&&flow.game.time>=30)flow.stop();flow.step(dt);render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)flow.pause(true);});window.addEventListener('pagehide',()=>{stop();app.destroy(true,{children:true});for(const t of [backTexture,frontTexture,railTexture,ballTexture])t.destroy(true);},{once:true});
window.__outlet={snapshot:()=>({time:flow.game.time,paused:flow.paused,spawned:flow.physics.metrics.spawned,counts:{...flow.counts},outlet:{...flow.physics.outlet},colliders:flow.physics.colliders.filter(s=>s.role==='out-left'||s.role==='out-right').map(s=>structuredClone(s)),receipts:[...receipts]})};render();
