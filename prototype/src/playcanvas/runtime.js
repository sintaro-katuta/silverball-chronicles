import {Application,Asset,Entity,Color,Texture,EnvLighting,PROJECTION_ORTHOGRAPHIC,ASPECT_MANUAL,RESOLUTION_FIXED,FILLMODE_NONE,TONEMAP_ACES,ADDRESS_CLAMP_TO_EDGE,LAYERID_SKYBOX} from 'playcanvas';

const buffers=new Map();
export async function modelBuffer(url,signal){
 if(buffers.has(url))return buffers.get(url);
 const response=await fetch(url,{signal});if(!response.ok)throw new Error(`Model failed: ${url} (${response.status})`);
 const buffer=await response.arrayBuffer();if(buffer.byteLength<12||new DataView(buffer).getUint32(0,true)!==0x46546c67)throw new Error(`Invalid GLB: ${url}`);signal?.throwIfAborted();buffers.set(url,buffer);return buffer;
}
export function loadContainer(app,url,contents){
 return new Promise((resolve,reject)=>{
  const objectUrl=URL.createObjectURL(new Blob([contents]));
  const asset=new Asset(url,'container',{url:objectUrl,filename:url.split('/').pop()});
  asset.once('load',()=>{URL.revokeObjectURL(objectUrl);resolve(asset);});asset.once('error',error=>{URL.revokeObjectURL(objectUrl);reject(error);});app.assets.add(asset);app.assets.load(asset);
 });
}
export function studio(host,{width=460,height=740}={}){
 const canvas=document.createElement('canvas');canvas.dataset.engine='playcanvas';host.append(canvas);
 const pixelScale=1,renderWidth=Math.max(1,Math.round(width/pixelScale)),renderHeight=Math.max(1,Math.round(height/pixelScale));
 canvas.width=renderWidth;canvas.height=renderHeight;canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;canvas.style.imageRendering='auto';
 const app=new Application(canvas,{graphicsDeviceOptions:{alpha:true,antialias:true,preserveDrawingBuffer:false}});
 app.graphicsDevice.maxPixelRatio=1;app.setCanvasResolution(RESOLUTION_FIXED,renderWidth,renderHeight);app.setCanvasFillMode(FILLMODE_NONE,width,height);
 app.autoRender=false;app.scene.ambientLight=new Color(.22,.26,.32);
 const camera=new Entity('Camera');camera.addComponent('camera',{projection:PROJECTION_ORTHOGRAPHIC,orthoHeight:height/2,aspectRatioMode:ASPECT_MANUAL,aspectRatio:width/height,nearClip:.1,farClip:2000,clearColor:new Color(0,0,0,0),toneMapping:TONEMAP_ACES});camera.camera.layers=camera.camera.layers.filter(id=>id!==LAYERID_SKYBOX);camera.setPosition(0,0,900);app.root.addChild(camera);
 const key=new Entity('Key');key.addComponent('light',{type:'directional',color:new Color(.85,.93,1),intensity:2.3});key.setEulerAngles(65,-28,0);app.root.addChild(key);
 const fill=new Entity('Fill');fill.addComponent('light',{type:'directional',color:new Color(1,.85,.62),intensity:.9});fill.setEulerAngles(-30,140,0);app.root.addChild(fill);
 // A small local studio reflection map; no remote environment dependency.
 const faces=Array.from({length:6},(_,i)=>{
  const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,0,64);
  g.addColorStop(0,i===2?'#b6c5d7':'#556277');g.addColorStop(.5,'#162233');g.addColorStop(1,'#070c12');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
  if(i!==3){ctx.fillStyle='#dce9f4';ctx.fillRect(8,8,11,40);ctx.fillStyle='#8c9ba9';ctx.fillRect(42,14,8,32);}return c;
 });
 const cube=new Texture(app.graphicsDevice,{name:'studio',cubemap:true,width:64,height:64,mipmaps:true,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE,LAYERID_SKYBOX});cube.setSource(faces);
 const lighting=EnvLighting.generateLightingSource(cube,{size:64});const atlas=EnvLighting.generateAtlas(lighting,{size:256,numReflectionSamples:64,numAmbientSamples:64});app.scene.envAtlas=atlas;
 app.start();
 return {app,canvas,camera,key,resize(w,h){if(w>0&&h>0){canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;app.resizeCanvas(w,h);app.setCanvasResolution(RESOLUTION_FIXED,renderWidth,renderHeight);app.setCanvasFillMode(FILLMODE_NONE,w,h);}},destroy(){app.scene.envAtlas=null;atlas.destroy();lighting.destroy();cube.destroy();app.destroy();canvas.remove();}};
}
export function visit(root,fn){fn(root);for(const child of root.children)visit(child,fn);}
export function cloneMaterials(root){
 const materials=new Map();visit(root,node=>{for(const mi of node.render?.meshInstances||[]){const original=mi.material;if(!materials.has(original))materials.set(original,original.clone());mi.material=materials.get(original);}});
 return [...materials.values()];
}
