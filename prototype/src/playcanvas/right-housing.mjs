import {Entity,Mesh,MeshInstance,StandardMaterial,Color,calculateNormals} from 'playcanvas';

// These surfaces sit behind the 27-unit ball plane or outside the contact corridor.
// Coordinates are the shared board coordinates, never a second collision model.
export const RIGHT_HOUSING=Object.freeze({ballZ:27,backZ:6,frontOfBack:12,rush:{x:330,y:477,width:34},attacker:{x:359,y:581,width:60}});
export class RightHousing {
 constructor(app,parent){
  this.app=app;this.root=new Entity('right-mechanism-housing',app);parent.addChild(this.root);this.meshes=[];this.materials=[];this.serial=0;
  this.m={dark:this.mat('recess','#040b13',.12,.4),steel:this.mat('edge-steel','#607986',.75,.55),chrome:this.mat('rim-silver','#c6dce5',.85,.8),resin:this.mat('resin-edge','#347b91',.15,.75),blue:this.mat('rush-receiver-light','#80ddeb',.2,.55),amber:this.mat('attacker-receiver-light','#efcc86',.2,.55)};
  this.m.blue.emissive.fromString('#30c4ef');this.m.amber.emissive.fromString('#ffb248');
  // An exposed outside spine gives the upper clear channel depth without painting over the LCD.
  this.box('outer-track-shadow',382,352,5,364,6,8,this.m.dark);
  this.box('outer-track-silver',383.7,352,1.5,364,14,3,this.m.steel);
  for(const [a,b] of [[[340,200],[346.313,426]],[[347.486,468],[350,558]],[[379,155],[379,565]]]){
   this.bar('clear-guide-highlight',a,b,.42,28,this.m.chrome);
   this.bar('clear-guide-back-edge',a,b,1.15,18,this.m.resin);
  }
  // Lower channel liner, behind the ball and below the image area. Neither top mouth is bridged.
  this.box('lower-track-bed',365,528,24,94,5,4,this.m.dark);
  this.box('lower-track-outer-wall',382,530,3,86,10,8,this.m.steel);
  for(let i=0;i<5;i++)this.box('liner-moulding',381,490+i*17,2,5,19,2,this.m.chrome);
  // RUSH receiver: compact asymmetric casting and deep cavity distinct from the lower payout unit.
  this.box('rush-cavity',330,490,31,19,7,3,this.m.dark);
  this.box('rush-left-cheek',308,489,5,28,9,10,this.m.steel);
  this.box('rush-right-cheek',351.5,491,5,23,9,10,this.m.steel);
  this.box('rush-bottom-casting',330,504,46,6,9,10,this.m.steel);
  this.box('rush-bottom-polished-lip',330,501,37,1.7,21,2,this.m.chrome);
  this.box('rush-status-lens',330,505,21,2.2,21,2,this.m.blue);
  for(const x of [307.5,352])this.axle('rush-fixed-screw',x,501,22,1.7,this.m.chrome);
  this.rushPivot=this.axle('rush-scoop-pivot',347.486,468,24,2.7,this.m.chrome);
  this.coverPivot=this.axle('rush-cover-pivot',313,477,24,2.3,this.m.chrome);
  this.box('rush-hinge-socket',348.5,473,6,5,13,6,this.m.dark);
  // Attacker: interior below the mouth, side returns and a separate bottom extraction well.
  this.box('attacker-inner-well',359,596,57,23,5,3,this.m.dark);
  for(const side of [-1,1]){
   this.box('attacker-cavity-return',359+side*28,596,2,21,8,6,this.m.steel);
   this.box('attacker-rear-channel',359+side*25,599,1.4,12,14,2,this.m.resin);
  }
  this.box('attacker-count-lens',359,605,33,2.4,14,2,this.m.amber);
  this.closedShutter=this.shutterFace();
  this.attackerBearing=this.axle('attacker-door-bearing',329,581,24,3.1,this.m.steel);
  this.attackerBearingCap=this.axle('attacker-door-bearing-cap',329,581,28,1.7,this.m.chrome);
  this.box('attacker-bottom-depth',359,615,53,7,4,8,this.m.dark);
  this.box('attacker-bottom-trim',359,613,51,1.5,13,2,this.m.chrome);
  this.applyState({gate:{open:false},rightChucker:{open:false}});
 }
 shutterFace(){
  const root=new Entity('attacker-closed-shutter-face',this.app);this.root.addChild(root);
  const material=this.mat('shutter-enamel','#173349',.68,.55),mesh=new Mesh(this.app.graphicsDevice);
  this.shutterMesh=mesh;this.meshes.push(mesh);
  root.addComponent('render',{meshInstances:[new MeshInstance(mesh,material)],castShadows:false});
  this.updateShutter({a:{x:329,y:596},b:{x:389,y:579}});
  return root;
 }
 updateShutter(gate){
  // The upper silhouette IS the live contact segment. Everything added lies below it
  // and behind the ball's rear tangent (22.4); the existing narrow edge remains in front.
  const {a,b}=gate,bottom=Math.max(a.y,b.y)+3,chamfer=1.1;
  const points=[a,{x:a.x,y:bottom-chamfer},{x:a.x+chamfer,y:bottom},{x:b.x-chamfer,y:bottom},{x:b.x,y:bottom-chamfer},b],positions=[],indices=[],n=points.length;
  for(const z of [15,21])for(const p of points)positions.push(p.x-210,340-p.y,z);
  for(let i=1;i<n-1;i++)indices.push(n,n+i,n+i+1,0,i+1,i);
  for(let i=0;i<n;i++){const j=(i+1)%n;indices.push(i,j,j+n,i,j+n,i+n);}
  this.shutterMesh.setPositions(positions);this.shutterMesh.setNormals(calculateNormals(positions,indices));this.shutterMesh.setIndices(indices);this.shutterMesh.update();
 }
 mat(name,color,metal,gloss){const m=new StandardMaterial();m.name='native-right-'+name;m.diffuse=new Color().fromString(color);m.useMetalness=true;m.metalness=metal;m.gloss=gloss;m.update();this.materials.push(m);return m;}
 box(name,x,y,w,h,z,d,mat){
  // Chamfered rectangular prism; one entity per semantic casting, no collider.
  const r=Math.min(1.3,w*.18,h*.18),p=[[-w/2+r,-h/2],[w/2-r,-h/2],[w/2,-h/2+r],[w/2,h/2-r],[w/2-r,h/2],[-w/2+r,h/2],[-w/2,h/2-r],[-w/2,-h/2+r]],positions=[],indices=[];
  for(const depth of [z,z+d])for(const [px,py]of p)positions.push(x-210+px,340-y+py,depth);
  for(let i=1;i<7;i++){indices.push(8,8+i,8+i+1,0,i+1,i);}
  for(let i=0;i<8;i++){const j=(i+1)%8;indices.push(i,j,j+8,i,j+8,i+8);}
  const mesh=new Mesh(this.app.graphicsDevice);mesh.setPositions(positions);mesh.setNormals(calculateNormals(positions,indices));mesh.setIndices(indices);mesh.update();this.meshes.push(mesh);
  const e=new Entity(`${name}-${this.serial++}`,this.app);e.addComponent('render',{meshInstances:[new MeshInstance(mesh,mat)],castShadows:false});this.root.addChild(e);return e;
 }
 bar(name,a,b,r,z,mat){const e=new Entity(name,this.app);e.addComponent('render',{type:'cylinder',material:mat,castShadows:false});this.root.addChild(e);e.setLocalPosition((a[0]+b[0])/2-210,340-(a[1]+b[1])/2,z);e.setLocalEulerAngles(0,0,-Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI-90);e.setLocalScale(r*2,Math.hypot(b[0]-a[0],b[1]-a[1]),r*2);return e;}
 axle(name,x,y,z,r,mat){const e=new Entity(name,this.app);e.addComponent('render',{type:'cylinder',material:mat,castShadows:false});this.root.addChild(e);e.setLocalPosition(x-210,340-y,z);e.setLocalEulerAngles(90,0,0);e.setLocalScale(r*2,2.4,r*2);return e;}
 applyState(physics){
  const a=physics.gate.a;if(a){this.attackerBearing.setLocalPosition(a.x-210,340-a.y,24);this.attackerBearingCap.setLocalPosition(a.x-210,340-a.y,28);}
  const cover=physics.rightChucker.cover?.a;if(cover)this.coverPivot.setLocalPosition(cover.x-210,340-cover.y,24);
  const key=`${physics.gate.open}:${physics.rightChucker.open}`;if(key===this.key)return;this.key=key;
  this.closedShutter.enabled=!physics.gate.open;if(!physics.gate.open&&physics.gate.a)this.updateShutter(physics.gate);this.m.blue.emissiveIntensity=physics.rightChucker.open?.8:.06;this.m.amber.emissiveIntensity=physics.gate.open?.8:.04;this.m.blue.update();this.m.amber.update();}
 dispose(){this.root.destroy();this.meshes.forEach(m=>m.destroy());this.materials.forEach(m=>m.destroy());}
}
