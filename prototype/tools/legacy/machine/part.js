import * as THREE from 'three';
import {MeshBuilder} from './mesh-builder.js';
export class MachinePart extends MeshBuilder {
 constructor(machine,name){
  super();this.physics=machine.physics;this.scene=new THREE.Group();this.scene.name=name;
  for(const key of ['metal','gold','dark','chrome','cyan','porcelain','lacquer','resin','rubber'])this[key]=machine[key].clone();
  machine.scene.add(this.scene);
 }
 update(){}
 // The owning Machine disposes the complete scene tree, including this group.
}
