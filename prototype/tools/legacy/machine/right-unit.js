import * as THREE from 'three';
import {MachinePart} from './part.js';
export class RightUnit extends MachinePart {
 constructor(machine){
 super(machine,'right-unit');this.chuckerMaterial=this.cyan.clone();this.chuckerMaterial.emissiveIntensity=.15;
 for(const c of this.physics.colliders)if(c.role.startsWith('right-')){const mesh=this.segment(c,this.resin);mesh.userData.role=c.role;}
 for(const p of this.physics.pockets){
  if(p.kind!=='bonus'&&p.kind!=='rush')continue;
  const mat=p.kind==='bonus'?this.chrome:this.chuckerMaterial;
  this.openPocket(p.x,p.y,p.w,p.kind==='bonus'?17:15,mat);
  if(p.kind==='bonus'){
   this.attackerHousing(p.x,p.y,p.w);
   this.attackerGlow=this.pos(new THREE.Mesh(new THREE.PlaneGeometry(p.w-7,6),new THREE.MeshBasicMaterial({color:'#ffc765',transparent:true,opacity:.5,depthWrite:false,toneMapped:false})),p.x,p.y+11,9);
   this.attackerGlow.visible=false;
  }
 }
 if(this.physics.gate){this.gateMaterial=new THREE.MeshStandardMaterial({color:'#213a50',metalness:.7,roughness:.32,emissive:'#16354a',emissiveIntensity:.22});this.gate=this.segment(this.physics.gate,this.gateMaterial);this.gatePanel=this.pos(new THREE.Mesh(new THREE.BoxGeometry(1,7,3),this.gateMaterial),0,0,29);this.gatePanel.userData.part='attacker-shutter';this.gateRib=this.pos(new THREE.Mesh(new THREE.BoxGeometry(46,.7,1),this.gold),0,0,31);this.placeGatePanel();this.shutterDetail();}
 if(this.physics.rightChucker){
  this.chuckerScoop=this.segment(this.physics.rightChucker.scoop,this.chuckerMaterial);
  this.chuckerCover=this.segment(this.physics.rightChucker.cover,this.chrome);

 }

 }
 attackerHousing(x,y,width){
  const outer=this.rounded(width+16,38,5),inner=this.rounded(width+7,23,2);
  outer.holes.push(new THREE.Path(inner.getPoints(40)));
  this.solid(outer,x,y+8,3,9,this.lacquer,.9).userData.part='attacker-housing';
  const trim=this.rounded(width+13,33,4),cut=this.rounded(width+9,28,3);
  trim.holes.push(new THREE.Path(cut.getPoints(40)));
  this.solid(trim,x,y+8,13,1.3,this.metal,.35).userData.part='attacker-silver-surround';
  this.plate([[x-width/2-3,y-8],[x+width/2+3,y-8],[x+width/2,y-3],[x-width/2,y-3]],17,3,this.chrome,.5);
  this.box(x,y-5,width-3,.65,21,1,this.gold);
  for(const side of [-1,1]){
   const sx=x+side*(width/2+4);
   this.roundedBox(sx,y+6,5,23,1.5,16,5,this.metal,.45);
   this.roundedBox(sx,y+4,2,12,.7,22,1,this.lacquer,.2);
   const pivot=this.pos(new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.3,2,16),this.chrome),sx,y+13,23);pivot.rotation.x=Math.PI/2;
   this.pos(new THREE.Mesh(new THREE.SphereGeometry(1,10,8),this.dark),sx,y+13,24.4).scale.z=.3;
   this.roundedBox(sx,y-4,2.2,3.5,.6,23,1,this.cyan,.2);
  }
  this.plate([[x-width/2-2,y+22],[x+width/2+2,y+22],[x+width/2-4,y+26],[x-width/2+4,y+26]],15,3,this.metal,.45);
  this.box(x,y+23,width-10,.65,19,1,this.gold);
 }
 shutterDetail(){
  // Ornaments are children of the door and follow its physical open pose.
  const x=359,y=589,panel=this.gatePanel;
  const attach=mesh=>{panel.updateMatrixWorld(true);mesh.updateMatrixWorld(true);panel.attach(mesh);};
  const surround=this.rounded(59,15,2),opening=this.rounded(55,11,1.2);
  surround.holes.push(new THREE.Path(opening.getPoints(32)));
  attach(this.solid(surround,x,y,31,1.1,this.chrome,.25));
  for(const side of [-1,1]){
   attach(this.plate([[x+side*25,y-4],[x+side*7,y-4],[x+side*10,y-1],[x+side*25,y-1]],32,1,this.metal,.15));
   attach(this.box(x+side*17,y+3,18,.45,33,1,this.gold));
  }
  attach(this.plate([[x,y-4],[x+3,y],[x,y+4],[x-3,y]],33,1,this.gold,.2));
  attach(this.plate([[x,y-2.4],[x+1.7,y],[x,y+2.4],[x-1.7,y]],34.2,.4,this.cyan,.1));
 }
 placeGatePanel(){
  const {a,b,open}=this.physics.gate,length=open?Math.hypot(b.x-a.x,b.y-a.y):60,height=open?7:16,key=open?'open':'closed';
  if(this.gatePanel.userData.state!==key){this.gatePanel.geometry.dispose();this.gatePanel.geometry=new THREE.BoxGeometry(length,height,3);this.gatePanel.userData.state=key;}
  // Front view: the closed flap covers the full aperture. When open, its edge
  // follows the same vertical segment that redirects incoming balls.
  this.gatePanel.position.set(open?(a.x+b.x)/2-210:359-210,open?340-(a.y+b.y)/2:340-589,29);
  this.gatePanel.rotation.z=open?-Math.atan2(b.y-a.y,b.x-a.x):0;
  this.gateRib.visible=!open;this.gateRib.position.set(359-210,340-589,31);
 }
 update(game){this.cyan.emissiveIntensity=game?.jackpot?1.3:game?.rush?.7:game?.presentation?.6:.22;if(this.gate){this.placeSegment(this.gate,this.physics.gate);this.placeGatePanel();this.gateMaterial.emissiveIntensity=this.physics.gate.open?1.45:.22;this.attackerGlow.visible=this.physics.gate.open;}if(this.chuckerScoop){this.placeSegment(this.chuckerScoop,this.physics.rightChucker.scoop);this.placeSegment(this.chuckerCover,this.physics.rightChucker.cover);this.chuckerMaterial.emissiveIntensity=this.physics.rightChucker.open?1.8:.12;}}
}
