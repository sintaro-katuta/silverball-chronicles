import {Application,Assets,Sprite} from 'pixi.js';
import {createSpecialRouteView} from './pixi/special-route-view.js';
import {createLongReachView} from './pixi/long-reach-view.js';
import '@fontsource/dotgothic16/japanese-400.css';
await document.fonts.load('46px DotGothic16');
const background=await Assets.load('/assets/lcd/long-reach/moon-bridge-v1.png');
const atlas=await Assets.load('/assets/lcd/long-reach/duel-poses-v1.png');atlas.source.scaleMode='nearest';
const app=new Application();await app.init({width:840,height:560,autoStart:false,antialias:false,preference:'webgl',background:0x061024});
document.querySelector('#screen').append(app.canvas);
const landscape=new Sprite(background);landscape.width=840;landscape.height=560;app.stage.addChild(landscape);
const battle=createLongReachView(atlas,background);battle.root.scale.set(4);app.stage.addChild(battle.root);
const view=createSpecialRouteView();view.root.scale.set(4);app.stage.addChild(view.root);
const el=id=>document.querySelector('#'+id);
let time=0,battleAt=27,playing=false,previous=performance.now(),pose=null,frames=[],disposed=false;
function input(){const premium=['moon','sword'].includes(el('route').value)?el('route').value:null;return {route:premium?'battle':el('route').value,premium,premiumAt:0,mode:el('mode').value,win:el('win').checked,time,reducedEffects:el('reduced').checked};}
function draw(){const i=input();let battlePose=null;if(i.route==='battle'){battlePose=battle.render(battleAt+time,{variant:'pressure',win:true,reducedEffects:i.reducedEffects});}else battle.root.visible=false;pose=view.render({...i,battlePose});app.render();el('time').max=String(pose.seconds??3.4);el('time').value=String(time);el('status').textContent=`${time.toFixed(2)}秒 / ${pose.phase} / ${pose.result??'未決着'}`;return pose;}
function set(values={}){for(const id of ['route','mode'])if(values[id]!==undefined)el(id).value=values[id];for(const id of ['win','reduced'])if(values[id]!==undefined)el(id).checked=values[id];if(el('route').value!=='basic'){el('win').checked=true;el('win').disabled=true;}else el('win').disabled=false;time=values.time??0;battleAt=values.battleAt??27;playing=false;draw();}
for(const id of ['route','mode','win','reduced'])el(id).onchange=()=>set();
el('time').oninput=e=>{time=+e.target.value;draw();};el('restart').onclick=()=>set();el('play').onclick=()=>{playing=!playing;previous=performance.now();el('play').textContent=playing?'一時停止':'再生';};
function loop(now){if(disposed)return;const dt=(now-previous)/1000;previous=now;if(!document.hidden){if(playing&&dt<.25){time=Math.min(+(el('time').max),time+dt);if(time>=+(el('time').max)){playing=false;el('play').textContent='再生';}}if(dt>0&&dt<.25){frames.push(dt*1000);if(frames.length>600)frames.shift();}draw();}requestAnimationFrame(loop);}
window.__specialRoutes={set,seek:t=>{time=t;return draw();},pose:()=>pose,inspectReels:()=>view.inspectReels(),play:value=>{playing=value;previous=performance.now();},stats:()=>{const sorted=frames.slice().sort((a,b)=>a-b);return {frames:sorted.length,p95IntervalMs:sorted[Math.floor(sorted.length*.95)]??null};},compareWithProduction:async()=>{
 const {createNormalSpinView}=await import('./pixi/normal-spin-view.js');
 const production=createNormalSpinView(),checks=[];
 for(let i=0;i<18;i++){const a=view.textures[i].source.resource.getContext('2d').getImageData(0,0,120,150).data,b=production.textures[i].source.resource.getContext('2d').getImageData(0,0,120,150).data;let different=0;for(let j=0;j<a.length;j++)if(a[j]!==b[j])different++;checks.push({mode:i<9?'normal':'rush',digit:i%9+1,differentChannels:different});}
 production.root.destroy({children:true});production.textures.forEach(t=>t.destroy(true));return checks;
},destroy:()=>{disposed=true;view.destroy();}};
draw();requestAnimationFrame(loop);
window.addEventListener('pagehide',()=>{disposed=true;view.destroy();app.destroy(true,{children:true});battle.frames.forEach(t=>t.destroy(false));battle.textures.forEach(t=>t.destroy(true));});
