import {paintResinGuide} from './resin-guide-art.js';
import {Application,Sprite,Texture,Container} from 'pixi.js';
import {createPartFlow} from '../part-flow-fixture.js';
import {startFrameLoop} from '../runtime/frame-loop.js';
import {createSilverBallTexture} from './silver-ball.js';
import {pixelSurface,painter} from './pixel-primitives.js';
import '@fontsource/dotgothic16/japanese-400.css';
import '@fontsource/dotgothic16/latin-400.css';
import './attacker-preview.css';
const el=id=>document.getElementById(id),app=new Application();await app.init({width:512,height:384,resolution:1,antialias:false,autoStart:false,background:0x060d1a,preference:'webgl'});el('canvas').append(app.canvas);
const flow=createPartFlow('normal',{launchPower:.5}),segments=flow.physics.colliders.filter(s=>s.role==='out-left'||s.role==='out-right'),offsets=[{x:40,y:100},{x:460,y:260}],scale=3;
const point=(p,i)=>({x:Math.round(offsets[i].x+(p.x-segments[i].a.x)*scale),y:Math.round(offsets[i].y+(p.y-segments[i].a.y)*scale)});
const canvas=pixelSurface(512,384,c=>{const d=painter(c);segments.forEach((s,i)=>paintResinGuide(d,point(s.a,i),point(s.b,i)));});const railTexture=Texture.from(canvas);railTexture.source.scaleMode='nearest';app.stage.addChild(new Sprite(railTexture));const ballsLayer=new Container();app.stage.addChild(ballsLayer);const ballTexture=createSilverBallTexture(),sprites=new Map();let previous=performance.now(),demo=false;
function render(){const alive=new Set();if(el('balls').checked)for(let i=0;i<segments.length;i++){const c=segments[i];for(const b of flow.physics.balls){if(b.x<Math.min(c.a.x,c.b.x)-9||b.x>Math.max(c.a.x,c.b.x)+9||b.y<Math.min(c.a.y,c.b.y)-20||b.y>Math.max(c.a.y,c.b.y)+5)continue;const key=i+':'+b.id;alive.add(key);let s=sprites.get(key);if(!s){s=new Sprite(ballTexture);s.anchor.set(.5);ballsLayer.addChild(s);sprites.set(key,s);}const q=point(b,i);s.position.set(q.x,q.y);}}
 for(const [id,s]of sprites)if(!alive.has(id)){s.destroy();sprites.delete(id);}el('pause').textContent=flow.paused?'再開':'一時停止';el('shots').textContent=flow.physics.metrics.spawned;app.render();}
el('demo').onclick=()=>{el('balls').checked=true;flow.pause(false);flow.start();demo=true;};el('pause').onclick=()=>flow.pause(!flow.paused);el('balls').onchange=render;
const stop=startFrameLoop(now=>{const dt=(now-previous)/1000;previous=now;if(document.hidden)return;if(demo&&flow.game.time>=30)flow.stop();flow.step(dt);render();});document.addEventListener('visibilitychange',()=>{if(document.hidden)flow.pause(true);});window.addEventListener('pagehide',()=>{stop();app.destroy(true,{children:true});railTexture.destroy(true);ballTexture.destroy(true);},{once:true});
window.__resin={snapshot:()=>({time:flow.game.time,paused:flow.paused,spawned:flow.physics.metrics.spawned,segments:structuredClone(segments),renderedBalls:sprites.size,outletVisible:false,scale}),asset:()=>canvas.toDataURL()};render();
