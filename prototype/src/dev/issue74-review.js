import {Assets} from 'pixi.js';
import {createWaterIdle} from '../pixi/water-idle.js';
const paths=['moon-castle-v1.png','cloud-sky-v1.png','hair-tip-detail-v1.png','character-static-v1.png'].map(n=>'/assets/lcd/'+n);
const [scene,sky,hair,underlay]=await Promise.all(paths.map(p=>Assets.load(p)));
const [hero,bg]=await Promise.all(['normal-hero-layer-v2.png','normal-background-layer-v1.png'].map(n=>Assets.load('/assets/lcd/'+n)));
const clouds=createWaterIdle(scene,sky),full=createWaterIdle(scene,sky,hair,underlay),layered=createWaterIdle(scene,sky,hair,underlay,hero,bg);
const el=id=>document.querySelector('#'+id),base=el('base').getContext('2d');base.imageSmoothingEnabled=true;base.imageSmoothingQuality='high';base.drawImage(scene.source.resource,0,0,630,420);
let time=0,playing=false,last=performance.now();
function render(){for(const [id,v] of [['cloud',clouds],['full',full],['layered',layered]]){v.render(time);const ctx=el(id).getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,630,420);ctx.drawImage(v.texture.source.resource,0,0,630,420)}el('value').textContent=time.toFixed(2);el('time').value=String(time);
 const before=base.getImageData(0,0,630,420).data,after=el('cloud').getContext('2d').getImageData(0,0,630,420).data;
 const positions=[[174,15],[177,25],[176,29],[177,26]];let changes=0,details=[];
 for(const [x,y] of positions){const i=((y*3+1)*630+x*3+1)*4;for(let k=0;k<3;k++)if(before[i+k]!==after[i+k]){changes++;details.push(`${x},${y}: ${[...before.slice(i,i+3)]}→${[...after.slice(i,i+3)]}`);break}}
 el('status').textContent=`月の注目4点: ${changes===0?'元絵と一致':`${changes}点に変化 (${details.join("; ")})`}`}
el('time').addEventListener('input',e=>{time=Number(e.target.value);render()});el('play').addEventListener('click',()=>{playing=!playing;el('play').textContent=playing?'一時停止':'再生';last=performance.now()});
function tick(now){if(playing){time=(time+Math.min(.1,(now-last)/1000))%30;render()}last=now;requestAnimationFrame(tick)}
render();requestAnimationFrame(tick);
