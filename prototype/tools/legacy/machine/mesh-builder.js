import * as THREE from 'three';

// Geometry helpers use board coordinates and add meshes to this.scene.
export class MeshBuilder {
 pos(mesh,x,y,z=0){mesh.position.set(x-210,340-y,z);this.scene.add(mesh);return mesh;}
 box(x,y,w,h,z,depth,mat){return this.pos(new THREE.Mesh(new THREE.BoxGeometry(w,h,depth),mat),x,y,z);}
 path(points,r,mat,linear=false){const vertices=points.map(([x,y,z=10])=>new THREE.Vector3(x-210,340-y,z));const curve=linear?new THREE.CurvePath():new THREE.CatmullRomCurve3(vertices);if(linear)for(let i=1;i<vertices.length;i++)curve.add(new THREE.LineCurve3(vertices[i-1],vertices[i]));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,80,r,8,false),mat);this.scene.add(mesh);return mesh;}
 rounded(w,h,r){const shape=new THREE.Shape(),x=-w/2,y=-h/2;shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);return shape;}
 solid(shape,x,y,z,depth,material,bevel=2){const geometry=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:bevel>0,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:14});return this.pos(new THREE.Mesh(geometry,material),x,y,z);}
 plate(points,z,depth,material,bevel=1){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x-210,340-y):shape.moveTo(x-210,340-y));shape.closePath();return this.solid(shape,210,340,z,depth,material,bevel);}
 roundedBox(x,y,w,h,r,z,depth,material,bevel=1){return this.solid(this.rounded(w,h,r),x,y,z,depth,material,bevel);}
 rim(shape,x,y,z,r,material){return this.path(shape.getPoints(100).map(p=>[x+p.x,y-p.y,z]),r,material,true);}
 openPocket(x,y,width,height,frameMaterial,{grille=false}={}){
  // This is a hollow frame, not a solid box with a dark decal behind its front face.
  // The physical acceptance plane is y, and the clear mouth width is exactly width.
  const centerY=y+height/2,frontZ=22,backZ=4;
  const bezel=this.rounded(width+7,height+6,3),opening=this.rounded(width,height,1.2);
  bezel.holes.push(new THREE.Path(opening.getPoints(32)));
  const frame=this.solid(bezel,x,centerY,15,7,frameMaterial,.55);frame.userData.part='open-pocket-bezel';
  const darkness=new THREE.MeshBasicMaterial({color:'#010307',toneMapped:false});
  const back=this.pos(new THREE.Mesh(new THREE.PlaneGeometry(width-3,height-2),darkness),x,centerY+1,backZ);back.userData.part='pocket-interior';
  // Sloping interior walls are shaded into darkness without reflecting the room map.
  const front=[[-width/2,-height/2],[width/2,-height/2],[width/2,height/2],[-width/2,height/2]];
  const rear=[[-width/2+1.5,-height/2+2],[width/2-1.5,-height/2+2],[width/2-1.5,height/2],[-width/2+1.5,height/2]];
  for(let edge=0;edge<4;edge++){
   const next=(edge+1)%4,points=[[...front[edge],frontZ],[...front[next],frontZ],[...rear[next],backZ],[...rear[edge],backZ]];
   const positions=[],colors=[],near=new THREE.Color(edge===2?'#354355':edge===0?'#0b1320':'#1e2c3f'),far=new THREE.Color('#020509');
   for(const i of [0,1,2,0,2,3]){const p=points[i],color=i<2?near:far;positions.push(x+p[0]-210,340-(centerY+p[1]),p[2]);colors.push(color.r,color.g,color.b);}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
   const wall=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,toneMapped:false}));wall.userData.part='pocket-inner-wall';this.scene.add(wall);
  }
  // A narrow clear lower lip has depth, but leaves the entrance unobstructed.
  const lip=new THREE.Mesh(new THREE.BoxGeometry(width+3,2,7),this.resin);this.pos(lip,x,y+height+1,20);lip.rotation.x=-.18;
  this.box(x,y+height+2,width+5,.8,23,1,this.chrome);
  if(grille)for(let offset=-width/2+5;offset<width/2-2;offset+=8)this.box(x+offset,y+height-2,.7,4,10,2,this.metal);
 }
 segment(collider,material){
 const {a,b}=collider;const radius=collider.r??1.5;
 const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(radius,Math.hypot(b.x-a.x,b.y-a.y),4,8),material);
 mesh.userData.segmentLength=Math.hypot(b.x-a.x,b.y-a.y);mesh.userData.segmentRadius=radius;this.scene.add(mesh);this.placeSegment(mesh,collider);return mesh;
 }
 placeSegment(mesh,{a,b,r=mesh.userData.segmentRadius}){const length=Math.hypot(b.x-a.x,b.y-a.y);if(Math.abs(length-mesh.userData.segmentLength)>.001){mesh.geometry.dispose();mesh.geometry=new THREE.CapsuleGeometry(r,length,4,8);mesh.userData.segmentLength=length;}mesh.position.set((a.x+b.x)/2-210,340-(a.y+b.y)/2,27);mesh.rotation.z=-Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2;}
}
