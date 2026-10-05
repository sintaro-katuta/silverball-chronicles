import * as THREE from 'three';
import {longReachPose,REACH_LABELS,actorFrameLayout} from '../pixi/long-reach-timeline.js';
import {clothVertex} from '../pixi/long-reach-view.js';
import {pixelSurface} from '../pixi/pixel-primitives.js';
// Comparison adapter only. Production gameplay continues to use PixiJS.
export async function createThreeReach(canvas,{atlasUrl,motionAtlasUrl=null,landscapeUrl}){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:false});renderer.setSize(840,560);renderer.setPixelRatio(1);renderer.setClearColor(0x060d1a);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),world=new THREE.Group();scene.add(world);const camera=new THREE.OrthographicCamera(0,210,0,140,.1,100);camera.position.z=10;
 const loader=new THREE.TextureLoader(),atlas=await loader.loadAsync(atlasUrl),landscape=await loader.loadAsync(landscapeUrl),motionAtlas=motionAtlasUrl?await loader.loadAsync(motionAtlasUrl):null,owned=[atlas,landscape,...motionAtlas?[motionAtlas]:[]],geometries=[],materials=[];
 for(const t of owned){t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;}
 function material(map){const m=new THREE.MeshBasicMaterial({map,transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide});materials.push(m);return m;}
 function plane(w,h,map,z=0){const geom=new THREE.PlaneGeometry(w,h);geometries.push(geom);const mesh=new THREE.Mesh(geom,material(map));mesh.rotation.x=Math.PI;mesh.renderOrder=z;world.add(mesh);return mesh;}
 const back=plane(238,159,landscape,0);
 const frames=[];for(const sheet of [atlas,motionAtlas].filter(Boolean))for(let i=0;i<6;i++){const t=sheet.clone();t.repeat.set(1/3,1/2);t.offset.set(i%3/3,1-Math.floor(i/3)/2-.5);owned.push(t);frames.push(t);}
 const w=512,h=512;
 function actor(order){const pos=[],uv=[],idx=[];for(let row=0;row<9;row++)for(let col=0;col<9;col++){pos.push(col/8*w-w/2,row/8*h-h*.95,0);uv.push(col/8,1-row/8);if(row<8&&col<8){const n=row*9+col;idx.push(n,n+1,n+10,n,n+10,n+9);}}
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geom.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geom.setIndex(idx);geometries.push(geom);const mesh=new THREE.Mesh(geom,material(frames[0]));mesh.renderOrder=order;world.add(mesh);return mesh;}
 const hero=[actor(2),actor(2)],enemy=[actor(3),actor(3)];
 const chargeCanvas=pixelSurface(48,48,c=>{c.strokeStyle='#9adff1';c.lineWidth=.6;for(const [r,a]of [[17,.08],[10,.12],[3,.4]]){c.globalAlpha=a;c.fillStyle='#96d5fa';c.beginPath();c.arc(24,24,r,0,Math.PI*2);c.fill();}c.globalAlpha=1;c.beginPath();c.arc(24,24,14,0,Math.PI*2);c.stroke();}),chargeTexture=new THREE.CanvasTexture(chargeCanvas);owned.push(chargeTexture);const charge=plane(48,48,chargeTexture,4);
 const slashCanvas=pixelSurface(120,60,c=>{c.fillStyle='#c6e9ff';c.beginPath();for(let i=0;i<=24;i++){const u=i/24,x=60-24+48*u,y=30+4-12*Math.sin(Math.PI*u);if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}for(let i=24;i>=0;i--){const u=i/24;c.lineTo(60-24+48*u,30+4-9*Math.sin(Math.PI*u));}c.closePath();c.fill();}),slashTexture=new THREE.CanvasTexture(slashCanvas);owned.push(slashTexture);const slash=plane(120,60,slashTexture,5);
 const impactTexture=new THREE.CanvasTexture(pixelSurface(20,20,c=>{c.fillStyle='#f4e8b7';c.beginPath();c.arc(10,10,3,0,Math.PI*2);c.fill();c.strokeStyle='#a9dcf5';c.lineWidth=.7;c.beginPath();c.arc(10,10,7,0,Math.PI*2);c.stroke();}));owned.push(impactTexture);const impact=plane(20,20,impactTexture,6);
 const sparkTexture=new THREE.CanvasTexture(pixelSurface(8,4,c=>{c.fillStyle='#c6e9ff';c.beginPath();c.moveTo(3,2);c.lineTo(4,1.35);c.lineTo(6,2);c.lineTo(4,2.65);c.closePath();c.fill();}));owned.push(sparkTexture);const sparks=Array.from({length:12},()=>plane(8,4,sparkTexture,6));
 const speedTexture=new THREE.CanvasTexture(pixelSurface(200,2,c=>{c.fillStyle='#7b9cbf';c.fillRect(0,0,200,1);}));owned.push(speedTexture);const speedLines=Array.from({length:6},(_,i)=>plane(100+i*9,.7,speedTexture,1));
 const starCanvas=pixelSurface(4,4,c=>{c.fillStyle='#9adff1';c.beginPath();c.arc(2,2,1.5,0,Math.PI*2);c.fill();}),starTexture=new THREE.CanvasTexture(starCanvas);owned.push(starTexture);const motes=Array.from({length:32},(_,i)=>plane(i%4===0?1.4:.7,i%4===0?1.4:.7,starTexture,6));
 const dim=plane(210,140,null,7);scene.add(dim);dim.material.color.setHex(0x020714);dim.position.set(105,70,0);
 const labels={};for(const label of REACH_LABELS){const c=pixelSurface(210,26,c=>{c.textAlign='center';c.textBaseline='middle';c.font=(label==='上に注目'?'20':'15')+'px "DotGothic16"';c.lineWidth=4;c.strokeStyle='#061020';c.strokeText(label,105,13);c.fillStyle='#e4edf5';c.fillText(label,105,13);});const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;owned.push(t);labels[label]=plane(210,26,t,8);scene.add(labels[label]);}
 const arrowTexture=new THREE.CanvasTexture(pixelSurface(20,24,c=>{c.fillStyle='#e4d39e';c.beginPath();c.moveTo(10,2);c.lineTo(3,10);c.lineTo(8,10);c.lineTo(8,18);c.lineTo(12,18);c.lineTo(12,10);c.lineTo(17,10);c.closePath();c.fill();}));owned.push(arrowTexture);const arrow=plane(20,24,arrowTexture,9);scene.add(arrow);arrow.position.set(105,49,0);
 function updateActor(layers,p,t,wind){
  const indices=[p.blendFrame??p.frame,p.frame],blend=p.frameBlend??1;
  layers.forEach((mesh,layer)=>{
   const frame=indices[layer],layout=actorFrameLayout(frame),alpha=p.alpha*(layer===0?1-blend:blend);
   mesh.visible=alpha>0;if(!mesh.visible)return;
   mesh.material.map=frames[frame];mesh.material.opacity=alpha;mesh.position.set(p.x,p.y,0);mesh.rotation.z=p.rotation;mesh.scale.setScalar(100/w*p.scale*layout.scale);
   const data=mesh.geometry.attributes.position.array;
   for(let row=0;row<9;row++)for(let col=0;col<9;col++){const v=clothVertex(col/8*w,row/8*h,t,wind),i=(row*9+col)*3;data[i]=v.x-w*layout.pivotX;data[i+1]=v.y-h*layout.pivotY;}
   mesh.geometry.attributes.position.needsUpdate=true;
  });
 }
 return {renderer,render(t,options={}){const p=longReachPose(t,{...options,motionFrames:!!motionAtlas});world.scale.set(p.camera.scale,p.camera.scale,1);world.position.set(105-p.camera.x*p.camera.scale,70-p.camera.y*p.camera.scale,0);back.position.set(105+p.backdrop.x*.3,70+p.backdrop.y*.2,0);back.scale.setScalar(p.backdrop.scale);updateActor(hero,p.hero,t,p.wind);updateActor(enemy,p.enemy,t,0);charge.position.set(p.chargePosition.x,p.chargePosition.y,0);charge.visible=p.charge>0;charge.material.opacity=p.charge*.6;charge.rotation.z=t*.4;charge.scale.setScalar(.8+.1*Math.sin(t));slash.position.set(p.slash.x,p.slash.y,0);slash.rotation.z=-p.slash.rotation;slash.scale.setScalar(p.slash.scale);slash.material.opacity=p.slash.alpha;slash.material.color.setHex(p.slash.side==='enemy'?0xb49ce8:0xffffff);dim.material.opacity=Math.max(p.dim,p.cutShade);impact.position.set(p.impact.x,p.impact.y,0);impact.material.opacity=p.impact.alpha;impact.scale.setScalar(p.impact.scale);sparks.forEach((g,i)=>{const q=p.sparks[i];g.position.set(q.x,q.y,0);g.rotation.z=-q.angle;g.material.opacity=q.alpha;g.scale.setScalar(q.scale);});speedLines.forEach((g,i)=>{g.position.set(70+(i%2)*30-70+(100+i*9)/2,37+i*12,0);g.material.opacity=p.slash.alpha*.15;});for(const [label,s]of Object.entries(labels)){s.visible=label===p.label;s.position.set(105,17,0);s.material.opacity=p.captionAlpha;}arrow.visible=p.handoff>0;arrow.position.y=p.arrowY;arrow.material.opacity=p.handoff;motes.forEach((g,i)=>{g.position.set((i*47+t*(2+i%3))%230-10,116-((i*19+t*(1+i%4))%106),0);g.material.opacity=p.atmosphere*(.55+.45*Math.sin(t+i));});renderer.render(scene,camera);return p;},dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());owned.forEach(t=>t.dispose());renderer.dispose();}};
}
