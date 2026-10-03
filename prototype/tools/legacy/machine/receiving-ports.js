import * as THREE from 'three';
import {MachinePart} from './part.js';
export class ReceivingPorts extends MachinePart {
 constructor(machine){super(machine,'receiving-ports');for(const p of this.physics.pockets)if(p.kind==='normal'||p.kind==='start')this.receivingCup(p.x,p.y,p.w,p.kind==='start');}
 receivingCup(x,y,width,isStart=false){
  // Preserve the existing open U-shaped receiver and its physical entry width.
  const radius=width/2,straight=4,thickness=1.8;
  const casing=new THREE.Shape();casing.moveTo(-radius-5,1);casing.lineTo(-radius-5,-5);casing.lineTo(-radius-2,-18);casing.quadraticCurveTo(0,-23,radius+2,-18);casing.lineTo(radius+5,-5);casing.lineTo(radius+5,1);casing.lineTo(radius+2,1);casing.lineTo(radius+1,-8);casing.quadraticCurveTo(0,-19,-radius-1,-8);casing.lineTo(-radius-2,1);casing.closePath();
  const housing=this.solid(casing,x,y,3,7,isStart?this.porcelain:this.lacquer,1);housing.userData.part='receiver-housing';
  this.roundedBox(x,y+14,width-3,5,2,11,2,isStart?this.cyan:this.metal,.4);
  for(const side of [-1,1]){
   const fin=this.pos(new THREE.Mesh(new THREE.SphereGeometry(2.4,10,8),this.chrome),x+side*(radius+3),y+4,17);fin.scale.z=.45;
  }
  const shell=new THREE.Shape();shell.moveTo(-radius-thickness,0);shell.lineTo(-radius-thickness,-straight);shell.absarc(0,-straight,radius+thickness,Math.PI,Math.PI*2,false);shell.lineTo(radius+thickness,0);shell.lineTo(radius,0);shell.lineTo(radius,-straight);shell.absarc(0,-straight,radius,0,-Math.PI,true);shell.lineTo(-radius,0);shell.closePath();
  const plastic=new THREE.MeshPhysicalMaterial({color:isStart?'#9de9f5':'#c7dce3',metalness:0,roughness:.15,transparent:true,opacity:.84,depthWrite:false,clearcoat:1,envMapIntensity:.5});
  const receiver=this.solid(shell,x,y,10,10,plastic,.4);receiver.userData.part='open-u-receiver';receiver.userData.entryWidth=width;
  const interior=new THREE.Shape();interior.moveTo(-radius,0);interior.lineTo(-radius,-straight);interior.absarc(0,-straight,radius,Math.PI,Math.PI*2,false);interior.lineTo(radius,0);interior.closePath();
  this.pos(new THREE.Mesh(new THREE.ShapeGeometry(interior),new THREE.MeshBasicMaterial({color:'#091721',toneMapped:false})),x,y,6);
  const shallow=new THREE.Shape();shallow.moveTo(-radius+1,0);shallow.lineTo(-radius+1,-straight);shallow.absarc(0,-straight,radius-1,Math.PI,Math.PI*2,false);shallow.lineTo(radius-1,0);shallow.closePath();
  const innerWall=new THREE.Mesh(new THREE.ExtrudeGeometry(shallow,{depth:3,bevelEnabled:false,curveSegments:20}),new THREE.MeshBasicMaterial({color:'#18313f',side:THREE.BackSide,toneMapped:false}));this.pos(innerWall,x,y,7);
  const edge=[[x-radius-.65,y,22],[x-radius-.65,y+straight,22]];
  for(let i=1;i<=32;i++){const angle=Math.PI+i*Math.PI/32;edge.push([x+(radius+.65)*Math.cos(angle),y+straight-(radius+.65)*Math.sin(angle),22]);}
  edge.push([x+radius+.65,y,22]);this.path(edge,isStart?1.15:.9,isStart?this.cyan:this.chrome,true);
  if(isStart){const jewel=this.pos(new THREE.Mesh(new THREE.SphereGeometry(3.2,12,8),this.cyan),x,y+15,24);jewel.scale.z=.35;}
 }
 update(game){this.cyan.emissiveIntensity=game?.jackpot?1.3:game?.rush?.7:game?.presentation?.6:.22;}
}
