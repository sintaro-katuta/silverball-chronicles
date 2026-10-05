import {Cabinet} from '../playcanvas/cabinet.js';
import {RightUnit} from '../playcanvas/right-unit.mjs';
import {Entity,Color} from 'playcanvas';
import {studio,loadContainer,modelBuffer,cloneMaterials,visit} from '../playcanvas/runtime.js';
import {BALL_RADIUS} from '../physics/physics.js';
import {timeline,beatAt} from '../presentation/cinematic.js';
import {MACHINE_VIEW} from './machine-layout.js';
// Compatibility export for existing preview/QA clients.
export {MACHINE_VIEW} from './machine-layout.js';
const degrees=180/Math.PI;
export class Machine {
 static async create(host,physics,{course=0,signal,onProgress=()=>{}}={}){
  const data=await modelBuffer(`/models/course-${course}.glb`,signal);onProgress();
  const glyphs=await modelBuffer('/models/title-glyphs.glb',signal);onProgress();
  await document.fonts.load('24px "DotGothic16"','月影機関');
  signal?.throwIfAborted();const machine=new Machine(host,physics,course);
  try{machine.asset=await loadContainer(machine.app,`/models/course-${course}.glb`,data);signal?.throwIfAborted();machine.glyphData=glyphs;machine.build();return machine;}
  catch(error){machine.dispose();throw error;}
 }
 constructor(host,physics,course){
  this.physics=physics;this.course=course;this.studio=studio(host,{width:MACHINE_VIEW.width,height:MACHINE_VIEW.height});this.app=this.studio.app;this.camera=this.studio.camera;this.balls=new Map();this.ownedMaterials=[];
  this.observer=new ResizeObserver(()=>this.resize());this.mount(host);
 }
 mount(host){this.observer.disconnect();this.host=host;host.append(this.studio.canvas);this.observer.observe(host);this.resize();}
 build(){
  this.model=this.asset.resource.instantiateRenderEntity();this.model.name='Machine';this.app.root.addChild(this.model);
  // The authored cabinet carries named, static pin meshes; move each visual
  // triplet to the exact same per-unit coordinates used by the physics solver.
  this.pinNodes=this.physics.pins.map(pin=>{
   const nodes=['shaft','backing','head'].map(part=>this.model.findByName(`pin-${pin.id}-${part}`));
   const positions=[18,29,30];nodes.forEach((node,index)=>node?.setLocalPosition(pin.x-210,340-pin.y,positions[index]));return nodes;
  });
  this.materials=cloneMaterials(this.model);this.ownedMaterials.push(...this.materials);this.materialByName=new Map(this.materials.map(m=>[m.name,m]));
  this.rightUnit=this.model.findByName('right-unit');this.receivingPorts=this.model.findByName('receiving-ports');this.crest=this.model.findByName('cinematic-crest');this.crest.enabled=false;
  this.windmills=this.physics.mechanisms.map((_,i)=>this.model.findByName(`windmill-${i}`));
  this.legacyExterior=this.model.findByName('legacy-exterior');
  if(!this.legacyExterior)throw new Error('Cabinet asset needs regeneration: missing legacy-exterior');
  this.legacyExterior.enabled=false;this.cabinet=new Cabinet(this.app,this.rightUnit.parent);
  // Match functional mouldings to the new enamel / titanium enclosure.
  for(const name of ['right-lacquer','receivers-lacquer','receivers-porcelain']){const m=this.materialByName.get(name);if(m){m.diffuse.fromString('#a6bdca');m.metalness=.24;m.gloss=.55;m.update();}}
  for(const name of ['right-metal','receivers-metal']){const m=this.materialByName.get(name);if(m){m.diffuse.fromString('#8ea8b8');m.metalness=.8;m.gloss=.64;m.update();}}
  this.rightUnit.addComponent('script');
  this.rightController=this.rightUnit.script.create(RightUnit,{properties:{materialByName:this.materialByName}});
  this.ballMaterial=this.materialByName.get('machine-chrome');this.goldBall=this.ballMaterial.clone();this.goldBall.diffuse=new Color(1,.77,.28);this.goldBall.update();
  this.largeBall=this.ballMaterial.clone();this.largeBall.diffuse=new Color(.7,.5,1);this.largeBall.update();this.ownedMaterials.push(this.goldBall,this.largeBall);
 }
 primitive(type,material,parent=this.app.root){const node=new Entity(type,this.app);node.addComponent('render',{type,material,castShadows:false});parent.addChild(node);return node;}
 emission(name,value,color){const mat=this.materialByName.get(name);if(!mat)return;mat.emissiveIntensity=value;if(color)mat.emissive.fromString(color);mat.update();}
 updateParts(game){
  this.rightController.applyState(this.physics);
  const energy=game?.jackpot?1.3:game?.rush?.7:game?.presentation?.6:.22;for(const name of ['machine-cyan','right-cyan','receivers-cyan'])this.emission(name,energy);
 }
 render(game){
  if(!this.model)return;const p=timeline(game),beat=p?beatAt(p.t,p.pattern).id:null;
  this.crest.enabled=false; // MoonMechanism now owns the physical decision beat.
  this.physics.mechanisms.forEach((m,i)=>this.windmills[i].setLocalEulerAngles(0,0,-m.angle*degrees));const alive=new Set();
  for(const b of this.physics.balls){alive.add(b.id);let node=this.balls.get(b.id);if(!node){node=this.primitive('sphere',b.gold?this.goldBall:b.large?this.largeBall:this.ballMaterial);node.name=`ball-${b.id}`;node.setLocalScale(BALL_RADIUS*2,BALL_RADIUS*2,BALL_RADIUS*2);this.balls.set(b.id,node);}node.setPosition(b.x-210,340-b.y,27);}
  for(const[id,node]of this.balls)if(!alive.has(id)){node.destroy();this.balls.delete(id);}this.updateParts(game);this.cabinet.update(game,p,beat,p?beatAt(p.t,p.pattern):null);this.app.renderNextFrame=true;
 }
 focus(part='all',angle='front'){
  const selected=part.startsWith('right')?this.rightUnit:part==='receivers'?this.receivingPorts:part==='cabinet'?this.cabinet.root:null,root=this.rightUnit.parent;for(const child of root.children)child.enabled=!selected||child===selected;this.legacyExterior.enabled=false;this.crest.enabled=false;
  let x=0,y=0,w=MACHINE_VIEW.width,h=MACHINE_VIEW.height;
  if(selected){let bounds;visit(selected,n=>{for(const mi of n.render?.meshInstances||[])bounds?bounds.add(mi.aabb):bounds=mi.aabb.clone();});if(bounds){x=bounds.center.x;y=bounds.center.y;h=bounds.halfExtents.y*2.2;const aspect=this.host.clientWidth/this.host.clientHeight;h=Math.max(h,bounds.halfExtents.x*2.2/aspect);w=h*aspect;}}
  if(part==='right-inlet'||part==='right-attacker'){
   const pocket=this.physics.pockets.find(p=>p.kind===(part==='right-inlet'?'rush':'bonus'));
   x=pocket.x-210;y=340-pocket.y+(part==='right-inlet'?10:0);w=part==='right-inlet'?100:112;h=part==='right-inlet'?108:88;
  }
  const aspect=this.host.clientWidth/this.host.clientHeight;h=Math.max(h,w/aspect);
  this.camera.setPosition(x+(angle==='front'?0:430),y+(angle==='front'?0:130),900);this.camera.lookAt(x,y,0);this.camera.camera.orthoHeight=h/2;this.camera.camera.aspectRatio=aspect;
 }
 resize(){const {width,height}=this.host.getBoundingClientRect();this.studio.resize(width,height);this.app.renderNextFrame=true;}
 diagnostics(){return {engine:'PlayCanvas',cabinet:'hybrid-v3',legacyExteriorVisible:this.legacyExterior?.enabled,course:this.course,entities:this.model?.findComponents('render').length??0,balls:this.balls.size,gateOpen:this.physics.gate.open,canvas:{width:this.studio.canvas.width,height:this.studio.canvas.height,cssWidth:this.studio.canvas.clientWidth,pixelRatio:this.app.graphicsDevice.maxPixelRatio},drawCalls:this.app.stats.drawCalls.total};}
 dispose(){if(this.disposed)return;this.disposed=true;this.observer.disconnect();this.cabinet?.dispose();this.model?.destroy();for(const node of this.balls.values())node.destroy();this.balls.clear();this.asset?.unload();this.ownedMaterials.forEach(m=>m.destroy());this.studio.destroy();}
}
