import {MeshBuilder} from './machine/mesh-builder.js';
import {ReceivingPorts} from './machine/receiving-ports.js';
import {RightUnit} from './machine/right-unit.js';
import * as THREE from 'three';
import {BALL_RADIUS} from '../../src/physics/physics.js';
import {timeline,beatAt} from '../../src/presentation/cinematic.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
export const MACHINE_VIEW=Object.freeze({width:460,height:740,boardOffset:{x:20,y:30},lcd:{x:72,y:102,width:317,height:408,radius:14}});
export class Machine extends MeshBuilder {
 constructor(host,physics){super();this.host=host;this.physics=physics;this.scene=new THREE.Scene();this.scene.background=null;this.camera=new THREE.OrthographicCamera(-MACHINE_VIEW.width/2,MACHINE_VIEW.width/2,MACHINE_VIEW.height/2,-MACHINE_VIEW.height/2,.1,2000);this.camera.position.set(0,0,900);this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.92;host.append(this.renderer.domElement);const pmrem=new THREE.PMREMGenerator(this.renderer);const env=new RoomEnvironment();const envTarget=pmrem.fromScene(env,.04);this.scene.environment=envTarget.texture;env.dispose();pmrem.dispose();this.envTarget=envTarget;
 this.metal=new THREE.MeshStandardMaterial({color:'#566a82',metalness:.8,roughness:.25});this.gold=new THREE.MeshStandardMaterial({color:'#c6a265',metalness:.9,roughness:.28});this.dark=new THREE.MeshStandardMaterial({color:'#142235',metalness:.8,roughness:.33});this.chrome=new THREE.MeshStandardMaterial({color:'#eaf4ff',metalness:1,roughness:.08});this.cyan=new THREE.MeshStandardMaterial({color:'#79e7ff',emissive:'#159ecb',emissiveIntensity:1.5,metalness:.4,roughness:.24});
 this.scene.add(new THREE.AmbientLight('#d5e5ff',.8));const light=new THREE.DirectionalLight('#d8ecff',2.8);light.position.set(-150,260,400);this.scene.add(light);const warm=new THREE.PointLight('#ffe0ae',30000,800,2);warm.position.set(170,-200,130);this.scene.add(warm);this.balls=new Map();this.ballGeo=new THREE.SphereGeometry(BALL_RADIUS,14,10);this.goldBall=new THREE.MeshStandardMaterial({color:'#ffd066',metalness:1,roughness:.12,emissive:'#ae5500',emissiveIntensity:.25});this.largeBall=new THREE.MeshStandardMaterial({color:'#cba9ff',metalness:.9,roughness:.2});this.build();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize(); }
 build(){
 this.porcelain=new THREE.MeshPhysicalMaterial({color:'#647f94',metalness:.58,roughness:.3,clearcoat:.8,clearcoatRoughness:.18});
 this.lacquer=new THREE.MeshPhysicalMaterial({color:'#101b2c',metalness:.42,roughness:.2,clearcoat:1,clearcoatRoughness:.12});
 this.resin=new THREE.MeshPhysicalMaterial({color:'#cdeafa',metalness:0,roughness:.12,transparent:true,opacity:.25,depthWrite:false,clearcoat:1});
 this.rubber=new THREE.MeshStandardMaterial({color:'#273641',metalness:.05,roughness:.87});
 this.lights=[];
 const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;const glowContext=glowCanvas.getContext('2d'),glow=glowContext.createRadialGradient(64,64,0,64,64,64);glow.addColorStop(0,'rgba(255,255,255,.8)');glow.addColorStop(.2,'rgba(255,255,255,.28)');glow.addColorStop(.55,'rgba(255,255,255,.08)');glow.addColorStop(1,'rgba(255,255,255,0)');glowContext.fillStyle=glow;glowContext.fillRect(0,0,128,128);this.glowTexture=new THREE.CanvasTexture(glowCanvas);

 const exteriorStart=this.scene.children.length;
 // One moulded cabinet surrounds the clear playfield; it has room beyond the physical board.
 const body=this.rounded(438,714,42),opening=this.rounded(404,656,22);
 const openingPath=new THREE.Path(opening.getPoints(100).map(p=>new THREE.Vector2(p.x,p.y+7)));body.holes.push(openingPath);
 for(const outlet of [this.physics.outlet,this.physics.returnOutlet].filter(Boolean)){const cut=this.rounded(outlet.w,13,1.2);body.holes.push(new THREE.Path(cut.getPoints(24).map(p=>new THREE.Vector2(p.x+outlet.x-210,p.y+340-(outlet.y+6.5)))));}

 this.solid(body,210,340,-16,32,this.porcelain,4);
 this.rim(this.rounded(438,714,42),210,340,24,1.8,this.chrome);
 this.rim(opening,210,333,24,2.3,this.chrome);
 // Dark sculpted cheek panels are part of the casing, outside the ball plane.
 for(const side of [-1,1]){
  const cheek=this.rounded(14,530,7);this.solid(cheek,210+side*214,338,14,11,this.lacquer,2);
  const sweep=[[210+side*207,76,34],[210+side*217,129,37],[210+side*216,430,36],[210+side*204,584,33]];
  this.path(sweep,4.3,this.resin);this.cabinetLight(sweep,1.25,side<0?'left':'right');
  for(const y of [52,616]){const jewel=this.pos(new THREE.Mesh(new THREE.OctahedronGeometry(13),this.porcelain),210+side*203,y,35);jewel.scale.set(.55,1,.6);}
 }
 // Faceted shoulder lenses and lower cheek mouldings interrupt the uniform outer rim.
 this.shoulderLens=new THREE.MeshPhysicalMaterial({color:'#397790',metalness:.12,roughness:.2,envMapIntensity:.35,transparent:true,opacity:.8,clearcoat:.8,emissive:'#124f67',emissiveIntensity:.24});
 for(const side of [-1,1]){
  const mirror=points=>points.map(([x,y])=>[side<0?x:420-x,y]);
  this.plate(mirror([[5,101],[14,57],[39,27],[105,16],[133,26],[107,47],[56,63],[27,114]]),7,13,this.lacquer,3);
  this.plate(mirror([[12,91],[23,55],[44,36],[99,25],[116,29],[94,42],[53,55],[31,94]]),21,7,this.chrome,1);
  for(const tile of [[[21,82],[30,56],[53,50],[40,76]],[[33,52],[48,38],[72,33],[56,49]],[[64,44],[75,32],[102,29],[93,38]]])this.plate(mirror(tile),30,4,this.shoulderLens,1.4);
  const shoulderPath=mirror([[28,76],[43,46],[75,35],[104,31]]).map(([x,y])=>[x,y,36]);this.cabinetLight(shoulderPath,1.1,'shoulder');
  this.plate(mirror([[4,538],[25,568],[38,616],[71,653],[22,649],[2,621]]),8,12,this.lacquer,2.5);
  this.plate(mirror([[10,559],[22,579],[30,616],[48,641],[25,633],[12,611]]),22,5,this.shoulderLens,1.5);
  this.path(mirror([[14,578],[21,612],[41,640]]).map(([x,y])=>[x,y,31]),1.2,this.chrome);
 }
 // Quiet printed foil under clear plastic; no schematic grid, guide dots or part labels.
 const canvas=document.createElement('canvas');canvas.width=840;canvas.height=1360;const ctx=canvas.getContext('2d');ctx.scale(2,2);
 const grad=ctx.createLinearGradient(0,0,380,680);grad.addColorStop(0,'#183442');grad.addColorStop(.45,'#081520');grad.addColorStop(1,'#152637');ctx.fillStyle=grad;ctx.fillRect(0,0,420,680);
 for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(24+i*13,630);ctx.bezierCurveTo(115+i*19,610,172+i*18,492,354+i*4,515);ctx.strokeStyle=i%2?'#b2c5cd12':'#b8985d24';ctx.lineWidth=i%2?2:5;ctx.stroke();}
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;this.boardTexture=tex;
 const boardShape=this.rounded(410,675,22);const hole=this.rounded(317,408,14);const holePath=new THREE.Path(hole.getPoints(80).map(p=>new THREE.Vector2(p.x+.5,p.y+64)));boardShape.holes.push(holePath);
 const boardGeo=new THREE.ShapeGeometry(boardShape);const uv=boardGeo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+210)/420,(uv.getY(i)+340)/680);this.pos(new THREE.Mesh(boardGeo,new THREE.MeshBasicMaterial({map:tex})),210,340,-2);
 for(const node of this.scene.children.slice(exteriorStart))node.userData.replacedExterior=true;
 // Collision outlines remain the same as their visible moulded guides.
 this.colliderMeshes=[];
 for(const collider of this.physics.colliders??[]){
  // These guides sit inside the receiving cup, below its entry; do not draw them as projecting legs.
  if(collider.role==='normal-rim'||collider.role==='start-rim'||collider.role.startsWith('right-'))continue;
  const mat=collider.material==='resin'?this.resin:collider.material==='rubber'?this.rubber:collider.material==='pocket'?this.metal:this.chrome;
  const mesh=this.segment(collider,mat);mesh.userData.role=collider.role;this.colliderMeshes.push(mesh);
  if(collider.role==='launch-kicker'||collider.role==='upper-reflector'){
   const base=this.segment({...collider,r:collider.r+3.2},this.rubber);base.position.z=13;
   for(const endpoint of [collider.a,collider.b]){this.roundedBox(endpoint.x,endpoint.y,10,12,3,5,9,this.lacquer,1);const screw=this.pos(new THREE.Mesh(new THREE.SphereGeometry(2.3,10,6),this.chrome),endpoint.x,endpoint.y,17);screw.scale.z=.45;}
  }
 }
 const surroundStart=this.scene.children.length;
 // The LCD glass sits inside a shaped resin centre assembly, not a rectangular picture frame.
 const bezel=this.rounded(330,421,19),aperture=this.rounded(317,408,14);bezel.holes.push(new THREE.Path(aperture.getPoints(80)));
 this.solid(bezel,210.5,276,1,9,this.lacquer,1.4);this.rim(aperture,210.5,276,13,.9,this.chrome);
 // Swept lower wings tie the display surround into the life-nail area without fake collisions.
 for(const side of [-1,1]){
  const wing=new THREE.Shape();const pts=[[0,0],[48,-1],[76,-18],[55,-14],[19,-12]];pts.forEach(([x,y],i)=>i?wing.lineTo(side*x,y):wing.moveTo(side*x,y));wing.closePath();
  this.solid(wing,210+side*32,487,1,8,this.porcelain,1.2);
  this.path([[210+side*42,489,12],[210+side*79,484,12],[210+side*105,471,12]],1.25,this.gold);
 }
 // A crescent crown is this fictional machine's identity; no copied manufacturer's logo.
 const crown=this.rounded(155,37,13);this.solid(crown,202,43,9,13,this.lacquer,2);this.rim(crown,202,43,23,.85,this.gold);
 for(const side of [-1,1]){this.path([[202+side*14,38,29],[202+side*35,27,28],[202+side*70,31,25]],3.8,this.resin);this.cabinetLight([[202+side*16,38,30],[202+side*34,29,29],[202+side*68,32,27]],1.3,'crown');}
 const moonArc=new THREE.Mesh(new THREE.TorusGeometry(17,3.1,8,48,Math.PI*1.65),this.gold);moonArc.rotation.z=-.36;this.pos(moonArc,202,43,31);
 const moonCore=this.pos(new THREE.Mesh(new THREE.OctahedronGeometry(8),this.cyan),204,43,35);moonCore.scale.z=.4;
 for(const node of this.scene.children.slice(surroundStart))node.userData.replacedExterior=true;
 // A single transparent muzzle on the left launch rail, sourced from the physical launcher.
 const launcher=this.physics.launcher,origin=launcher?.origin??{x:29,y:652},mouth=launcher?.mouth??{x:29,y:632};
 this.roundedBox(origin.x,mouth.y+8,16,27,5,9,8,this.lacquer);
 this.roundedBox(origin.x,mouth.y+3,13,20,4,20,3,this.resin,.5);
 this.rim(this.rounded(14,23,4),origin.x,mouth.y+5,26,.8,this.chrome);
 const trayStart=this.scene.children.length;
 // The shallow lower tray and right control handle belong to the outer cabinet.
 this.roundedBox(187,690,285,26,11,23,16,this.lacquer,2);this.roundedBox(187,698,274,9,4,41,6,this.porcelain,1.5);
 this.roundedBox(187,684,261,13,6,38,3,this.dark,1);
 this.path([[54,686,44],[90,696,45],[281,696,45],[323,686,44]],1.7,this.chrome);
 this.cabinetLight([[100,700,43],[188,702,44],[273,700,43]],.8,'tray');
 const handleBase=this.pos(new THREE.Mesh(new THREE.CylinderGeometry(19,22,8,40),this.chrome),389,687,40);handleBase.rotation.x=Math.PI/2;
 const handle=this.pos(new THREE.Mesh(new THREE.SphereGeometry(16.5,28,18),this.lacquer),389,687,48);handle.scale.z=.45;
 const grip=this.pos(new THREE.Mesh(new THREE.TorusGeometry(16,2.2,8,48,Math.PI*1.45),this.gold),389,687,53);grip.rotation.z=.5;
 for(const node of this.scene.children.slice(trayStart))node.userData.replacedExterior=true;
 // Decorative moon crest is synchronised with the existing cinematic and never enters physics.
 this.crest=new THREE.Group();this.scene.add(this.crest);const ring=new THREE.Mesh(new THREE.TorusGeometry(33,5,8,48),this.gold);this.crest.add(ring);const moon=new THREE.Mesh(new THREE.OctahedronGeometry(22),this.cyan);moon.scale.set(.65,1.15,.4);this.crest.add(moon);for(const side of [-1,1])for(let i=0;i<3;i++){const wing=new THREE.Mesh(new THREE.BoxGeometry(27-i*4,5,5),this.gold);wing.position.set(side*(39+i*7),-i*7,0);wing.rotation.z=side*.45;this.crest.add(wing);}this.crest.visible=false;
 this.windmillMetal=new THREE.MeshStandardMaterial({color:'#e8c77f',metalness:.82,roughness:.2,emissive:'#8d641e',emissiveIntensity:.48});
 this.mechanismMeshes=this.physics.mechanisms.map(m=>{
  const group=new THREE.Group();group.position.set(m.x-210,340-m.y,27);this.scene.add(group);
  const armRadius=m.armRadius??1.3;
  const bar=angle=>{const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(armRadius,m.radius*2,4,8),this.windmillMetal);mesh.rotation.z=angle+Math.PI/2;group.add(mesh);};
  bar(0);if(m.kind==='windmill')bar(Math.PI/2);
  // An axle cap gives the spinning arms a visible pivot without drawing a false ball guide.
  const socket=new THREE.Mesh(new THREE.SphereGeometry(5,12,8),this.dark);socket.position.z=-4;socket.scale.z=.35;group.add(socket);
  const axle=new THREE.Mesh(new THREE.SphereGeometry(3.2,12,8),this.chrome);axle.position.z=2;axle.scale.z=.4;group.add(axle);return group;
 });
 // No decorative guide can silently constrain a ball: these are shared colliders.

 this.pinHeads=[];this.pinBacking=new THREE.MeshStandardMaterial({color:'#172331',metalness:.55,roughness:.38});
 this.pinFace=new THREE.MeshStandardMaterial({color:'#dceaf0',metalness:.92,roughness:.2,emissive:'#496373',emissiveIntensity:.22});
 this.lifePinFace=new THREE.MeshStandardMaterial({color:'#e6faff',metalness:.88,roughness:.18,emissive:'#47c4e2',emissiveIntensity:.35});
 for(const p of this.physics.pins){
  const shaftRadius=p.r??2.2,headRadius=p.headRadius??shaftRadius*1.4;
  const body=this.pos(new THREE.Mesh(new THREE.CylinderGeometry(shaftRadius,shaftRadius,18,10),this.metal),p.x,p.y,18);body.name=`pin-${p.id}-shaft`;body.rotation.x=Math.PI/2;
  const backing=this.pos(new THREE.Mesh(new THREE.CircleGeometry(headRadius+.75,14),this.pinBacking),p.x,p.y,29);backing.name=`pin-${p.id}-backing`;
  const top=this.pos(new THREE.Mesh(new THREE.SphereGeometry(headRadius,12,8),p.role==='heso'||p.role==='jump'?this.lifePinFace:this.pinFace),p.x,p.y,30);top.name=`pin-${p.id}-head`;top.scale.z=.4;this.pinHeads.push(top);
 }
 this.receivingPorts=new ReceivingPorts(this);
 this.rightUnit=new RightUnit(this);
 for(const outlet of [this.physics.outlet,this.physics.returnOutlet].filter(Boolean))this.openPocket(outlet.x,outlet.y,outlet.w,13,this.metal,{grille:true});

 // The heso approach is defined entirely by the visible life, jump and road nails.
 }
 cabinetLight(points,r,zone){
 const material=new THREE.MeshStandardMaterial({color:'#b1dce9',emissive:'#2c94be',emissiveIntensity:.2,metalness:.12,roughness:.28});const mesh=this.path(points,r,material);
 const haloMaterial=new THREE.SpriteMaterial({map:this.glowTexture,color:'#5ebedf',transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,toneMapped:false});const halo=new THREE.Sprite(haloMaterial);
 const mid=points[Math.floor(points.length/2)];this.pos(halo,mid[0],zone==='left'||zone==='right'?330:mid[1],48);
 halo.scale.set(zone==='crown'?94:zone==='shoulder'?95:zone==='tray'?230:32,zone==='crown'?70:zone==='shoulder'?80:zone==='tray'?30:520,1);halo.renderOrder=2;
 this.lights.push({material,zone,mesh,halo,haloMaterial});return mesh;
 }
 updateLights(game,presentation,beat){
  const time=game?.time??0,bonus=!!game?.jackpot,rush=!!game?.rush,reach=!!presentation;
  const red=reach&&game.presentation?.reachColor==='red',winningBeat=reach&&['awakening','revival','strike','resolve'].includes(beat)&&presentation.win;
  const color=bonus?'#ffbd55':winningBeat?'#e5fbff':red?'#ef3449':reach?'#d9f2ff':rush?'#53cbe9':'#447d9a';
  const energy=bonus?1.5+Math.sin(time*1.8)*.18:winningBeat?1.8:red?.85:reach?.65:rush?.7:.16;
  for(const light of this.lights){const tone=rush&&!bonus&&light.zone==='crown'?'#edc470':color;light.material.color.set(bonus?'#e2bb75':red?'#d8737c':rush?'#88d7ec':'#b1dce9');light.material.emissive.set(tone);light.material.emissiveIntensity=energy*(light.zone==='tray'?.48:light.zone==='crown'?1.15:1);light.haloMaterial.color.set(tone);light.haloMaterial.opacity=Math.min(.7,energy*.38);}
  this.cyan.emissiveIntensity=bonus?1.3:rush?.7:reach?.6:.22;this.shoulderLens.color.set(bonus?'#ac702c':red?'#6e1523':reach?'#869da8':rush?'#367c91':'#397790');this.shoulderLens.emissive.set(color);this.shoulderLens.emissiveIntensity=energy*.3;
 }
 resize(){const {width,height}=this.host.getBoundingClientRect();if(width&&height)this.renderer.setSize(width,height,false);}
 render(game){const presentation=timeline(game),beat=presentation?beatAt(presentation.t,presentation.pattern).id:null;this.crest.visible=!!presentation&&presentation.pattern!=='defeat'&&!(beat==='resolve'&&!presentation.win)&&!(presentation.pattern==='revival'&&presentation.t<17.8)&&['awakening','revival','strike','judgment','resolve'].includes(beat);if(this.crest.visible){const drop=['awakening','revival'].includes(beat)?1:Math.min(1,(presentation.t-(presentation.pattern==='revival'?17.8:10.3))/.6);this.crest.position.set(0,340-(55+drop*375),70);this.crest.rotation.z=Math.sin(presentation.t*3)*.06;this.crest.scale.setScalar(beat==='resolve'?1.2:1);}this.physics.mechanisms.forEach((m,i)=>this.mechanismMeshes[i].rotation.z=-m.angle);const alive=new Set();for(const b of this.physics.balls){alive.add(b.id);let mesh=this.balls.get(b.id);if(!mesh){mesh=new THREE.Mesh(this.ballGeo,b.gold?this.goldBall:b.large?this.largeBall:this.chrome);this.scene.add(mesh);this.balls.set(b.id,mesh);}mesh.position.set(b.x-210,340-b.y,27);mesh.rotation.x+=.09;}
 for(const[id,mesh]of this.balls){if(!alive.has(id)){this.scene.remove(mesh);this.balls.delete(id);}}this.receivingPorts.update(game);this.rightUnit.update(game);this.updateLights(game,presentation,beat);this.renderer.render(this.scene,this.camera);}
 dispose(){this.observer.disconnect();this.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();});const mats=new Set();this.scene.traverse(o=>{if(o.material)mats.add(o.material);});mats.forEach(m=>m.dispose());this.boardTexture.dispose();this.glowTexture.dispose();this.envTarget.dispose();this.renderer.dispose();this.host.replaceChildren();}
}
