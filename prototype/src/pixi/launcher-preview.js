import {Application,Sprite,Texture,Container,Graphics} from 'pixi.js';
import {createPartFlow} from '../part-flow-fixture.js';
import {startFrameLoop} from '../runtime/frame-loop.js';
import {createSilverBallTexture} from './silver-ball.js';
import {createPinTexture} from './pin-texture.js';
import {pixelSurface,painter} from './pixel-primitives.js';
import '@fontsource/dotgothic16/japanese-400.css';
import '@fontsource/dotgothic16/latin-400.css';
import './attacker-preview.css';
const el=id=>document.getElementById(id),app=new Application();await app.init({width:384,height:320,resolution:1,antialias:false,autoStart:false,background:0x060d1a,preference:'webgl'});el('canvas').append(app.canvas);
const scale=3,origin={x:60,y:145},windowBounds={left:78,top:157,right:188,bottom:145+320/3},point=p=>({x:Math.round((p.x-origin.x)*scale),y:Math.round((p.y-origin.y)*scale)});
const ballTexture=createSilverBallTexture(),pinTexture=createPinTexture(),board=new Container(),pinLayer=new Container(),ballLayer=new Container();board.addChild(pinLayer,ballLayer);app.stage.addChild(board);
// Fixed cabinet aperture: clip both the rails' hidden route and balls behind the frame.
// No velocity-dependent visibility or trajectory replacement; rebounds remain visible.
const aperture=new Graphics().rect(54,36,330,284).fill(0xffffff);app.stage.addChild(aperture);board.mask=aperture;
const frameTexture=Texture.from(pixelSurface(384,320,c=>{const d=painter(c);d.rect(0,0,384,36,'#142339');d.rect(0,0,54,320,'#142339');d.rect(44,26,340,10,'#805d2b');d.rect(48,30,336,4,'#ecd392');d.rect(44,30,10,290,'#805d2b');d.rect(48,34,4,286,'#ecd392');d.rect(54,36,330,4,'#080e19');d.rect(54,36,4,284,'#080e19');}));frameTexture.source.scaleMode='nearest';app.stage.addChild(new Sprite(frameTexture));
let flow,previous=performance.now(),demo=true,sprites=new Map(),pins=[],entered=new Set();
const overlaps=b=>b.x+b.r>windowBounds.left&&b.x-b.r<windowBounds.right&&b.y+b.r>windowBounds.top&&b.y-b.r<windowBounds.bottom;
function reset(){for(const s of sprites.values())s.destroy();sprites.clear();for(const s of pins)s.destroy();pins=[];entered.clear();flow=createPartFlow('normal',{launchPower:.5});for(const p of flow.physics.pins){const q=point(p);if(q.x<0||q.x>384||q.y<0||q.y>320)continue;const s=new Sprite(pinTexture);s.anchor.set(.5);s.position.set(q.x,q.y);pinLayer.addChild(s);pins.push(s);}flow.start();demo=true;previous=performance.now();}
function render(){const alive=new Set();for(const b of flow.physics.balls){alive.add(b.id);let s=sprites.get(b.id);if(!s){s=new Sprite(ballTexture);s.anchor.set(.5);ballLayer.addChild(s);sprites.set(b.id,s);}const q=point(b);s.position.set(q.x,q.y);s.visible=overlaps(b);if(s.visible)entered.add(b.id);}
 for(const [id,s]of sprites)if(!alive.has(id)){s.destroy();sprites.delete(id);}el('shots').textContent=flow.physics.metrics.spawned;el('escaped').textContent=entered.size;el('pause').textContent=flow.paused?'再開':'一時停止';app.render();}
el('demo').onclick=reset;el('feed').onclick=()=>{demo=false;flow.continuous?flow.stop():flow.start();};el('pause').onclick=()=>flow.pause(!flow.paused);
reset();const stop=startFrameLoop(now=>{const dt=(now-previous)/1000;previous=now;if(document.hidden)return;if(demo&&flow.game.time>=20)flow.stop();flow.step(dt);render();});document.addEventListener('visibilitychange',()=>{if(document.hidden)flow.pause(true);});window.addEventListener('pagehide',()=>{stop();app.destroy(true,{children:true});for(const t of [pinTexture,ballTexture,frameTexture])t.destroy(true);},{once:true});
window.__launcher={snapshot:()=>({time:flow.game.time,paused:flow.paused,spawned:flow.physics.metrics.spawned,entered:[...entered],launcher:structuredClone(flow.physics.launcher),colliders:flow.physics.colliders.filter(c=>c.role.startsWith('launch-')).map(c=>structuredClone(c)),windowBounds,launchMechanismVisible:false,visibleBalls:flow.physics.balls.filter(overlaps).map(b=>({id:b.id,x:b.x,y:b.y,r:b.r,vx:b.vx,vy:b.vy})),hiddenLaunchBalls:flow.physics.balls.filter(b=>b.x<40&&b.y>200).length,counts:{...flow.counts}})};render();
