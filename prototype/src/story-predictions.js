import {Application,Assets,Graphics} from 'pixi.js';
import {createStoryPredictionView} from './pixi/story-prediction-view.js';
import {STORY_PREDICTION_ASSETS} from './pixi/story-prediction-assets.js';
const sheets={};
for(const [kind,url] of Object.entries(STORY_PREDICTION_ASSETS)){
 const response=await fetch(url,{method:'HEAD'});
 if(response.ok&&response.headers.get('content-type')?.includes('image')){sheets[kind]=await Assets.load(url);sheets[kind].source.scaleMode='nearest';}
}
const app=new Application();await app.init({width:840,height:560,autoStart:false,antialias:false,preference:'webgl',background:0x061024});
document.querySelector('#screen').append(app.canvas);
const view=createStoryPredictionView({sheets});view.root.scale.set(4);app.stage.addChild(view.root);
const arrow=new Graphics();arrow.scale.set(4);app.stage.addChild(arrow);
const el=id=>document.querySelector('#'+id);let time=0,playing=false,previous=performance.now(),disposed=false,pose;
function draw(){const duration=+el('window').value;pose=view.update({family:el('family').value,time,duration,mode:duration===2?'rush':'normal',reducedEffects:el('reduced').checked,upperAttention:el('upper').checked});arrow.clear();if(el('upper').checked&&pose.visible){const y=7+(el('reduced').checked?0:Math.abs(Math.sin(time*6))*3);arrow.poly([101,y+9,101,y+5,98,y+5,105,y,112,y+5,109,y+5,109,y+9]).fill(0xffe4a0);}app.render();el('time').max=duration;el('time').value=time;el('status').textContent=`${time.toFixed(2)}秒 / ${pose.event??'素材なし'}`;return pose;}
function set(values={}){for(const id of ['family','window'])if(values[id]!==undefined)el(id).value=String(values[id]);for(const id of ['reduced','upper'])if(values[id]!==undefined)el(id).checked=values[id];time=values.time??0;playing=false;return draw();}
for(const id of ['family','window','reduced','upper'])el(id).onchange=()=>set();el('time').oninput=e=>{time=+e.target.value;draw();};el('restart').onclick=()=>set();el('play').onclick=()=>{playing=!playing;previous=performance.now();};
function loop(now){if(disposed)return;const dt=(now-previous)/1000;previous=now;if(!document.hidden){if(playing&&dt<.25){time=Math.min(+el('window').value,time+dt);if(time>=+el('window').value)playing=false;}draw();}requestAnimationFrame(loop);}
window.__storyPredictions={set,seek:t=>{time=t;return draw();},probe:input=>view.update(input),pose:()=>pose,available:view.available,hasFamily:view.hasFamily,play:value=>{playing=value;previous=performance.now();},destroy:()=>{disposed=true;view.destroy();},sourcesAlive:()=>Object.values(sheets).every(t=>!t.source.destroyed)};
draw();requestAnimationFrame(loop);
window.addEventListener('pagehide',()=>{disposed=true;view.destroy();app.destroy(true,{children:true});});
