import {createPinTexture} from '../pixi/pin-texture.js';
import {Application,Sprite,Texture,Graphics} from 'pixi.js';
import {createPartFlow} from '../physics/ball-flow.js';
import {startFrameLoop} from '../runtime/frame-loop.js';
import {createSilverBallTexture} from '../pixi/silver-ball.js';
import {pixelSurface,painter} from '../pixi/pixel-primitives.js';
import '@fontsource/dotgothic16/japanese-400.css';
import '@fontsource/dotgothic16/latin-400.css';
import './attacker-preview.css';
const el=id=>document.getElementById(id),app=new Application();
await app.init({width:256,height:320,resolution:1,antialias:false,autoStart:false,background:0x060d1a,preference:'webgl'});el('canvas').append(app.canvas);
const scale=3,origin={x:75-128/scale,y:330},point=p=>({x:Math.round((p.x-origin.x)*scale),y:Math.round((p.y-origin.y)*scale)});
const ballTexture=createSilverBallTexture();
const pinTexture=createPinTexture();
// Rasterize the live physics arms onto the same fixed pixel grid as the silver ball.
const rotorCanvas=pixelSurface(116,116,()=>{}),rotorTexture=Texture.from(rotorCanvas);rotorTexture.source.scaleMode='nearest';
const rotor=new Sprite(rotorTexture);rotor.anchor.set(.5);app.stage.addChild(rotor);
const guides=new Graphics();let flow,previous=performance.now(),demo=true,sprites=new Map(),pinSprites=[],localContacts=0;
function reset(){for(const s of [...sprites.values(),...pinSprites])s.destroy();sprites.clear();pinSprites=[];flow=createPartFlow('normal',{launchPower:.5});localContacts=0;
 const emit=flow.game.emit.bind(flow.game);flow.game.emit=(type,data)=>{if(type==='mechanism'&&flow.physics.mechanisms[0].lastHit===flow.game.time)localContacts++;emit(type,data);};
 for(const p of flow.physics.pins){const q=point(p);if(q.x<0||q.x>256||q.y<0||q.y>320)continue;const s=new Sprite(pinTexture);s.anchor.set(.5);s.position.set(q.x,q.y);app.stage.addChild(s);pinSprites.push(s);}
 app.stage.addChild(rotor,guides);flow.start();demo=true;previous=performance.now();}
function paintRotor(m){const c=rotorCanvas.getContext('2d');c.clearRect(0,0,116,116);const d=painter(c),r=m.radius*scale;
 for(let i=0;i<4;i++){const a=m.angle+i*Math.PI/2,cs=Math.cos(a),sn=Math.sin(a),at=(u,v)=>[58+cs*u-sn*v,58+sn*u+cs*v];
  const shape=(pts,color)=>d.poly(pts.map(([u,v])=>at(u,v)),color);
  // Width follows the existing physical arm radius; no decorative outer ring.
  shape([[0,-4],[r-4,-4],[r,0],[r-4,4],[0,4]],'#80591e');
  shape([[5,-3],[r-4,-3],[r-1,0],[r-4,3],[5,3]],'#f5d783');
  shape([[18,-1],[r-7,-1],[r-4,0],[r-7,2],[18,2]],'#276dd3');
  const a0=at(8,-2),a1=at(r-6,-2);d.line(...a0,...a1,'#fff1bd',2);
 }
 d.diamond(58,58,8,'#80591e');d.diamond(58,58,6,'#f5d783');d.diamond(58,58,3,'#96bad1');d.rect(56,55,3,3,'#f3f8ff');rotorTexture.source.update();const q=point(m);rotor.position.set(q.x,q.y);
}
function render(){const m=flow.physics.mechanisms[0];paintRotor(m);const alive=new Set();for(const b of flow.physics.balls){alive.add(b.id);let s=sprites.get(b.id);if(!s){s=new Sprite(ballTexture);s.anchor.set(.5);app.stage.addChild(s);sprites.set(b.id,s);}const q=point(b);s.position.set(q.x,q.y);s.visible=q.x>-15&&q.x<271&&q.y>-15&&q.y<335;}
 for(const [id,s]of sprites)if(!alive.has(id)){s.destroy();sprites.delete(id);}
 guides.clear();if(el('guides').checked){const q=point(m);for(let i=0;i<4;i++){const a=m.angle+i*Math.PI/2,b=point({x:m.x+Math.cos(a)*m.radius,y:m.y+Math.sin(a)*m.radius});guides.moveTo(q.x,q.y).lineTo(b.x,b.y).stroke({color:0x65ff95,width:1});}}
 el('shots').textContent=flow.physics.metrics.spawned;el('hits').textContent=localContacts;el('speed').textContent=m.omega.toFixed(2);el('pause').textContent=flow.paused?'再開':'一時停止';el('step').textContent=demo?(flow.game.time<30?'玉の接触で回転':'発射終了・残った玉を排出'):'手動確認';app.render();}
el('demo').onclick=reset;el('feed').onclick=()=>{demo=false;flow.continuous?flow.stop():flow.start();};el('pause').onclick=()=>flow.pause(!flow.paused);
reset();const stop=startFrameLoop(now=>{const dt=(now-previous)/1000;previous=now;if(document.hidden)return;if(demo&&flow.game.time>=30)flow.stop();flow.step(dt);render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)flow.pause(true);});window.addEventListener('pagehide',()=>{stop();app.destroy(true,{children:true});for(const t of [ballTexture,pinTexture,rotorTexture])t.destroy(true);},{once:true});
window.__windmill={snapshot:()=>({time:flow.game.time,paused:flow.paused,spawned:flow.physics.metrics.spawned,contacts:localContacts,mechanism:{...flow.physics.mechanisms[0]},counts:{...flow.counts}})};render();
