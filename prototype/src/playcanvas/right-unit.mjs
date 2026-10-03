import {rightGatePose} from './right-mechanism-geometry.mjs';
import {RightHousing} from './right-housing.mjs';
import {Entity,Script} from 'playcanvas';
const degrees=180/Math.PI;

// The game supplies live physical endpoints; this Script never changes payout or collision rules.
export class RightUnit extends Script {
 static scriptName='rightUnit';
 /** Closed attacker emission.
  * @attribute
  */
 closedEmission=.22;
 /** Open attacker emission.
  * @attribute
  */
 openEmission=1.45;
 /** Closed RUSH inlet emission.
  * @attribute
  */
 inletClosedEmission=.12;
 /** Open RUSH inlet emission.
  * @attribute
  */
 inletOpenEmission=1.8;
 initialize(){
  this.model=this.entity;
  // Engine integration may supply instance-owned materials. Editor instances own their clones.
  if(!this.materialByName){
   this.materialByName=new Map();const copies=new Map();
   for(const render of this.entity.findComponents('render'))for(const mesh of render.meshInstances){
    const original=mesh.material;if(!copies.has(original))copies.set(original,original.clone());
    mesh.material=copies.get(original);this.materialByName.set(mesh.material.name,mesh.material);
   }
   this.on('destroy',()=>{for(const material of copies.values())material.destroy();});
  }
  this.housing=new RightHousing(this.app,this.model);this.on('destroy',()=>this.housing.dispose());
  this.panel=this.model.findByName('gatePanel');this.rib=this.model.findByName('gateRib');this.glow=this.model.findByName('attackerGlow');
  // Native components follow live physics endpoints, including end caps.
  this.segments={};for(const key of ['gate','chuckerScoop','chuckerCover']){
   const old=this.model.findByName(key),material=old.render.meshInstances[0].material,parent=old.parent;old.destroy();const root=new Entity(key,this.app);parent.addChild(root);
   this.segments[key]={root,body:this.primitive('cylinder',material,root),a:this.primitive('sphere',material,root),b:this.primitive('sphere',material,root)};
  }
 }
 primitive(type,material,parent){const node=new Entity(type,this.app);node.addComponent('render',{type,material,castShadows:false});parent.addChild(node);return node;}
 segment(key,{a,b,r}){
  const s=this.segments[key],radius=r??1.3,length=Math.hypot(b.x-a.x,b.y-a.y);
  s.root.setLocalPosition((a.x+b.x)/2-210,340-(a.y+b.y)/2,27);s.root.setLocalEulerAngles(0,0,-Math.atan2(b.y-a.y,b.x-a.x)*degrees-90);s.body.setLocalScale(radius*2,length,radius*2);
  for(const [node,sign]of [[s.a,1],[s.b,-1]]){node.setLocalPosition(0,sign*length/2,0);node.setLocalScale(radius*2,radius*2,radius*2);}
 }
 diagnostics(){const roots=this.housing.root.findComponents('render');return {name:this.housing.root.name,renderCount:roots.length,panelPosition:this.panel.getLocalPosition().toArray(),panelAngles:this.panel.getLocalEulerAngles().toArray(),bounds:roots.map(r=>({name:r.entity.name,center:r.meshInstances[0].aabb.center.toArray(),half:r.meshInstances[0].aabb.halfExtents.toArray()}))};}
 emission(name,value){const material=this.materialByName.get(name);if(material){material.emissiveIntensity=value;material.update();}}
 applyState(physics){
  this.housing.applyState(physics);
  const gate=physics.gate,open=gate.open;this.segment('gate',gate);this.segment('chuckerScoop',physics.rightChucker.scoop);this.segment('chuckerCover',physics.rightChucker.cover);
  const pose=rightGatePose(gate);this.panel.setLocalScale(pose.length/60,7/16,1);
  this.panel.setLocalPosition(pose.x,pose.y,pose.z);this.panel.setLocalEulerAngles(0,0,pose.angle);
  this.rib.enabled=false;this.glow.enabled=open;this.emission('right-gateMaterial',open?this.openEmission:this.closedEmission);this.emission('right-chuckerMaterial',physics.rightChucker.open?this.inletOpenEmission:this.inletClosedEmission);

 }
}
