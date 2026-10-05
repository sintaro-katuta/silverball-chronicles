import {Application,Sprite,Graphics,Container} from 'pixi.js';
import {createPartFlow} from '../physics/ball-flow.js';
import {startFrameLoop} from '../runtime/frame-loop.js';
import {createSilverBallTexture} from '../pixi/silver-ball.js';
import {createPinTexture} from '../pixi/pin-texture.js';
import '@fontsource/dotgothic16/japanese-400.css';
import '@fontsource/dotgothic16/latin-400.css';
import './attacker-preview.css';
const el=id=>document.getElementById(id),app=new Application();
await app.init({width:256,height:320,resolution:1,antialias:false,autoStart:false,background:0x060d1a,preference:'webgl'});el('canvas').append(app.canvas);
const scale=3,zones=[{name:'振り分け釘',role:'spread',x:85,y:130},{name:'寄り釘',role:'yori',x:75,y:258},{name:'道釘',role:'michi',x:156,y:408}],pinTexture=createPinTexture(),ballTexture=createSilverBallTexture(),pinsLayer=new Container(),ballsLayer=new Container(),guides=new Graphics();app.stage.addChild(pinsLayer,ballsLayer,guides);
let flow,zone=0,demo=true,previous=performance.now(),sprites=new Map(),pinSprites=[];
const point=p=>({x:Math.round((p.x-zones[zone].x)*scale+128),y:Math.round((p.y-zones[zone].y)*scale)});
function selectZone(n){zone=n;for(const {sprite} of pinSprites)sprite.destroy();pinSprites=[];for(const p of flow.physics.pins){const q=point(p);if(q.x<7||q.x>249||q.y<7||q.y>313)continue;const sprite=new Sprite(pinTexture);sprite.anchor.set(.5);sprite.position.set(q.x,q.y);pinsLayer.addChild(sprite);pinSprites.push({pin:p,sprite});}el('state').textContent=zones[zone].name;}
function reset(){for(const s of sprites.values())s.destroy();sprites.clear();flow=createPartFlow('normal',{launchPower:.5});selectZone(0);demo=true;flow.start();previous=performance.now();}
function render(){const alive=new Set();for(const b of flow.physics.balls){alive.add(b.id);let s=sprites.get(b.id);if(!s){s=new Sprite(ballTexture);s.anchor.set(.5);ballsLayer.addChild(s);sprites.set(b.id,s);}const q=point(b);s.position.set(q.x,q.y);s.visible=q.x>-15&&q.x<271&&q.y>-15&&q.y<335;}
 for(const [id,s]of sprites)if(!alive.has(id)){s.destroy();sprites.delete(id);}
 guides.clear();if(el('guides').checked)for(const {pin}of pinSprites){const q=point(pin);guides.circle(q.x,q.y,pin.r*scale).stroke({color:0x65ff95,width:1});}
 el('shots').textContent=flow.physics.metrics.spawned;el('hits').textContent=flow.physics.roleFlow[zones[zone].role].balls;el('pinCount').textContent=pinSprites.length;el('pause').textContent=flow.paused?'再開':'一時停止';el('step').textContent=zones[zone].name+'の流れ';app.render();}
el('demo').onclick=reset;for(let i=0;i<zones.length;i++)el('zone'+i).onclick=()=>{demo=false;selectZone(i);};el('feed').onclick=()=>{demo=false;flow.continuous?flow.stop():flow.start();};el('pause').onclick=()=>flow.pause(!flow.paused);
reset();const stop=startFrameLoop(now=>{const dt=(now-previous)/1000;previous=now;if(document.hidden)return;if(demo){const next=Math.min(2,Math.floor(flow.game.time/12));if(next!==zone)selectZone(next);if(flow.game.time>=36)flow.stop();}flow.step(dt);render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)flow.pause(true);});window.addEventListener('pagehide',()=>{stop();app.destroy(true,{children:true});pinTexture.destroy(true);ballTexture.destroy(true);},{once:true});
window.__pins={snapshot:()=>({time:flow.game.time,paused:flow.paused,zone,spawned:flow.physics.metrics.spawned,roleFlow:structuredClone(flow.physics.roleFlow),pins:flow.physics.pins.map(p=>({...p})),displayed:pinSprites.map(({pin,sprite})=>({id:pin.id,x:sprite.x,y:sprite.y,r:pin.r})),origin:{x:zones[zone].x-128/scale,y:zones[zone].y},scale}),asset:()=>pinTexture.source.resource.toDataURL()};render();
