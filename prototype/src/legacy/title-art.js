import {Entity,Texture,Color,ADDRESS_CLAMP_TO_EDGE} from 'playcanvas';
import {studio,loadContainer,cloneMaterials} from '../playcanvas/runtime.js';
import metrics from '../playcanvas/title-metrics.json';
export class TitleSculpture {
 static async create(host,data){const title=new TitleSculpture(host);try{title.asset=await loadContainer(title.studio.app,'/models/title-glyphs.glb',data);title.prefab=title.asset.resource.instantiateRenderEntity();title.materials=cloneMaterials(title.prefab);return title;}catch(e){title.dispose();throw e;}}
 constructor(host){this.host=host;this.studio=studio(host,{width:500,height:170});this.group=new Entity('Title');this.studio.app.root.addChild(this.group);this.materials=[];this.width=500;}
 mount(host){this.host=host;host.replaceChildren(this.studio.canvas);host._sculpture=this;}
 set(label,tone){
  for(const child of [...this.group.children])child.destroy();this.host.setAttribute('aria-label',label);
  const palette=tone==='normal'?['#51677b','#dcefff','#ffffff']:tone==='ice'?['#063f81','#80e4ff','#e7ffff']:tone==='red'?['#700320','#f53231','#fff0a5']:tone==='rainbow'?['#ff783e','#ffe75b','#68e7ed','#a650df']:['#63330b','#eabb54','#fff4c6'];
  const canvas=document.createElement('canvas');canvas.width=4;canvas.height=128;const ctx=canvas.getContext('2d'),gradient=ctx.createLinearGradient(0,128,0,0);palette.forEach((color,i)=>gradient.addColorStop(i/(palette.length-1),color));ctx.fillStyle=gradient;ctx.fillRect(0,0,4,128);
  this.gradient??=new Texture(this.studio.app.graphicsDevice,{name:'Title gradient',width:4,height:128,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE});this.gradient.setSource(canvas);
  for(const m of this.materials)if(m.name==='title-face'){m.diffuse=new Color(1,1,1);m.diffuseVertexColor=false;m.diffuseMap=this.gradient;m.update();}
  let x=0;for(const char of label){const glyph=metrics[char],advance=glyph?.advance??45,node=glyph&&this.prefab.findByName(glyph.name);if(node){const clone=node.clone();clone.setLocalPosition(x+advance/2,0,0);this.group.addChild(clone);}x+=advance;}
  for(const node of this.group.children){const pos=node.getLocalPosition();node.setLocalPosition(pos.x-x/2,0,0);}
  this.width=Math.max(265,x+65);this.studio.camera.camera.aspectRatio=this.width/170;this.host.style.aspectRatio=`${this.width}/170`;
 }
 render(time){const w=this.host.clientWidth;if(w>0&&this.lastWidth!==w){this.studio.resize(w,w*170/this.width);this.lastWidth=w;}const intro=1-Math.pow(1-Math.min(1,time/.4),3),s=.82+intro*.18;this.group.setLocalScale(s,s,s);this.group.setLocalEulerAngles(-.19*180/Math.PI,(-.28+(1-intro)*.5+Math.sin(time*.6)*.06)*180/Math.PI,-.035*180/Math.PI);this.studio.app.renderNextFrame=true;}
 dispose(){if(this.disposed)return;this.disposed=true;this.group.destroy();this.prefab?.destroy();this.asset?.unload();this.materials.forEach(m=>m.destroy());this.gradient?.destroy();this.studio.destroy();}
}
export function updateTitle(host,label,tone,time){if(!label||!host._sculpture)return;const key=label+tone;if(host.dataset.art!==key){host.dataset.art=key;host._sculpture.set(label,tone);host._sculpture.lastWidth=0;}host.style.opacity=1;host.style.transform='none';host._sculpture.render(time);}
export function disposeTitle(host){host?._sculpture?.dispose();}
