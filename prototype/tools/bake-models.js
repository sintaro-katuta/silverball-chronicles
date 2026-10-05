// Offline migration tool. Never imported by the game runtime.
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {Machine} from './legacy/scene.js';
import {TitleSculpture} from './legacy/title-art.js';
import {Physics} from '../src/physics/physics.js';
import font from '../src/legacy/title-glyphs.json';
const host=document.querySelector('#host');
const exportModel=async root=>{
 root.updateMatrixWorld(true);
 const buffer=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:false});
 const bytes=new Uint8Array(buffer);let result='';
 for(let i=0;i<bytes.length;i+=32768)result+=String.fromCharCode(...bytes.subarray(i,i+32768));
 return btoa(result);
};
window.bakeBoard=async course=>{
 const machine=new Machine(host,new Physics(course));
 for(const owner of [machine,machine.rightUnit,machine.receivingPorts]){
  const prefix=owner===machine?'machine':owner===machine.rightUnit?'right':'receivers';
  for(const key of ['metal','gold','dark','chrome','cyan','porcelain','lacquer','resin','rubber','shoulderLens','pinFace','lifePinFace','windmillMetal','gateMaterial','chuckerMaterial'])if(owner[key])owner[key].name=`${prefix}-${key}`;
 }
 const right=machine.rightUnit;
 for(const key of ['gate','gatePanel','gateRib','chuckerScoop','chuckerCover','attackerGlow'])right[key].name=key;
 machine.crest.name='cinematic-crest';
 machine.mechanismMeshes.forEach((mesh,i)=>mesh.name=`windmill-${i}`);
 const segments={};for(const key of ['gate','chuckerScoop','chuckerCover'])segments[key]=right[key].userData.segmentLength;
 machine.lights.forEach((light,i)=>{
  light.mesh.name=`cabinet-light-${i}`;light.material.name=`cabinet-light-${i}`;
  // Replace Three-only sprites with an ordinary, editable glTF plane.
  const halo=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:machine.glowTexture,color:'#5ebedf',transparent:true,opacity:.1,depthWrite:false}));
  halo.position.copy(light.halo.position);halo.scale.copy(light.halo.scale);halo.name=`halo-${i}`;halo.material.name=`halo-${i}`;
  machine.scene.remove(light.halo);halo.userData.replacedExterior=true;machine.scene.add(halo);
 });
 let i=0;machine.scene.traverse(node=>{if(!node.name)node.name=node.userData.part||node.userData.role||`part-${i++}`;});
 const root=new T.Group();root.name=`tsukikage-course-${course}`;
 for(const child of [...machine.scene.children])if(!child.isLight)root.add(child);
 const exterior=new T.Group();exterior.name='legacy-exterior';
 for(const child of [...root.children])if(child.userData.replacedExterior)exterior.add(child);
 root.add(exterior);
 const result=await exportModel(root);
 const metadata={segments,lights:machine.lights.map((l,i)=>({name:`cabinet-light-${i}`,halo:`halo-${i}`,zone:l.zone})),pins:machine.physics.pins,colliders:machine.physics.colliders,pockets:machine.physics.pockets};
 machine.scene.add(root);machine.dispose();
 return {data:result,metadata};
};
window.bakeGlyphs=async()=>{
 const sculpture=new TitleSculpture(host),root=new T.Group();root.name='title-glyphs';const metrics={};
 for(const [char,glyph] of Object.entries(font.glyphs)){
  metrics[char]={advance:glyph.advance*86/font.units+3,name:`glyph-${char.codePointAt(0)}`};
  if(!glyph.path)continue;
  sculpture.set(char,'gold');const group=new T.Group();group.name=metrics[char].name;
  for(const material of sculpture.materials)material.name=material===sculpture.materials[0]?'title-side':material===sculpture.materials[1]?'title-rim':'title-face';
  for(const mesh of [...sculpture.group.children]){
   const geometry=mesh.geometry,positions=geometry.attributes.position,uvs=[];
   for(let i=0;i<positions.count;i++)uvs.push(.5,Math.max(0,Math.min(1,positions.getY(i)/86)));
   geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.deleteAttribute('color');group.add(mesh);
  }
  // Ownership moves to the asset; don't dispose its shared materials in set().
  sculpture.materials=[];root.add(group);
 }
 const data=await exportModel(root);sculpture.dispose();return {data,metrics};
};
