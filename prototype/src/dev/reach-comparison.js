import {reachSchedule} from '../pixi/reach-ending.js';
import {Application,Assets} from 'pixi.js';
import {createLongReachView} from '../pixi/long-reach-view.js';
import {createThreeReach} from '../legacy/long-reach-three-view.js';
import '@fontsource/dotgothic16/japanese-400.css';
await document.fonts.load('20px DotGothic16');
const atlasUrl='/assets/lcd/long-reach/duel-poses-longhair-v4.png',motionAtlasUrl='/assets/lcd/long-reach/duel-intermediates-longhair-v7.png',landscapeUrl='/assets/lcd/long-reach/moon-bridge-v1.png';
const [atlas,motionAtlas,landscape]=await Promise.all([atlasUrl,motionAtlasUrl,landscapeUrl].map(p=>Assets.load(p)));for(const t of [atlas,motionAtlas])t.source.scaleMode='nearest';
const app=new Application();await app.init({width:840,height:560,resolution:1,autoStart:false,antialias:false,preference:'webgl',background:0x060d1a});document.querySelector('#pixi').append(app.canvas);const view=createLongReachView(atlas,landscape,{motionAtlas});view.root.scale.set(4);app.stage.addChild(view.root);
const three=await createThreeReach(document.querySelector('#three'),{atlasUrl,motionAtlasUrl,landscapeUrl});
let ending='standard',variant='pressure',engine='pixi',time=2,playing=false,previous=performance.now(),lastSample=0;
const samples={pixi:{interval:[],submit:[]},three:{interval:[],submit:[]}},el=id=>document.querySelector('#'+id);
function resetSamples(){samples[engine]={interval:[],submit:[]};previous=performance.now();}
function draw(){const start=performance.now();const p=engine==='pixi'?view.render(time,{variant,ending}):three.render(time,{variant,ending});if(engine==='pixi')app.render();samples[engine].submit.push(performance.now()-start);if(samples[engine].submit.length>600)samples[engine].submit.shift();return p;}
function stats(){return Object.fromEntries(Object.entries(samples).map(([key,s])=>{const percentile=(a,p)=>{const v=a.slice().sort((a,b)=>a-b);return v[Math.floor((v.length-1)*p)]??null;};return [key,{frames:s.interval.length,p50IntervalMs:percentile(s.interval,.5),p95IntervalMs:percentile(s.interval,.95),p95CpuSubmitMs:percentile(s.submit,.95),over33ms:s.interval.filter(v=>v>33.4).length}];}));}
const endTime=()=>reachSchedule({reachEnding:ending}).decisionAt-.1;
function setEnding(value){ending=value;el('time').max=String(endTime());seek(Math.min(time,endTime()));}
function seek(value){time=Math.min(value,endTime());el('time').value=String(time);draw();}
el('engine').onchange=e=>{engine=e.target.value;el('pixi').hidden=engine!=='pixi';el('three').hidden=engine!=='three';resetSamples();draw();};
el('ending').onchange=e=>setEnding(e.target.value);
el('variant').onchange=e=>{variant=e.target.value;draw();};
el('play').onclick=()=>{playing=!playing;el('play').textContent=playing?'一時停止':'再生';previous=performance.now();};el('time').oninput=e=>seek(+e.target.value);
for(const [id,t]of [['restart',2],['battle',5],['upper',17],['final',45]])el(id).onclick=()=>seek(t);
function loop(now){const dt=now-previous;previous=now;if(!document.hidden){if(dt>0&&dt<250){samples[engine].interval.push(dt);if(samples[engine].interval.length>600)samples[engine].interval.shift();}if(playing)time=Math.min(endTime(),time+dt/1000);if(time===endTime())playing=false;const p=draw();el('time').value=String(time);if(now-lastSample>500){lastSample=now;const s=stats()[engine];el('status').textContent=`${engine==='pixi'?'PixiJS':'Three.js'} / ${time.toFixed(1)}秒 / ${p.cut} / フレーム中央値 ${s.p50IntervalMs?.toFixed(2)}ms・95%点 ${s.p95IntervalMs?.toFixed(2)}ms / CPU送信95%点 ${s.p95CpuSubmitMs?.toFixed(2)}ms`;}}requestAnimationFrame(loop);}
window.__reachComparison={seek,stats,setEnding,setVariant:value=>{variant=value;draw();},pose:()=>view.render(time,{variant,ending}),setPlaying:value=>{playing=value;previous=performance.now();},reset:resetSamples};requestAnimationFrame(loop);
window.addEventListener('pagehide',()=>{three.dispose();app.destroy(true,{children:true});view.frames.forEach(t=>t.destroy(false));view.textures.forEach(t=>t.destroy(true));});
