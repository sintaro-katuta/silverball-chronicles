import {sourcePoint} from './source-layout.js';
const point=p=>{const[x,y]=sourcePoint(p);return{x,y};};
export const SOURCE_ATTACKER_ANCHORS=Object.freeze({hinge:[721.7,777.5],closed:[725.4,658],open:[670.5,655]});
export function sourceAttackerPose(progress){
 const p=Math.max(0,Math.min(1,progress)),a=SOURCE_ATTACKER_ANCHORS;
 const hinge=point(a.hinge),tip=point(a.closed.map((v,i)=>v+(a.open[i]-v)*p));
 // These are observed front projections, not a fixed-length planar rotation.
 return {progress:p,hinge,tip,hingeA:hinge,hingeB:hinge,freeA:tip,freeB:tip};
}
export function sourceElectricPose(progress){
 const p=Math.max(0,Math.min(1,progress));
 // Prototype: a rear flap retracts in depth and uncovers the lower intake.
 // The authored visible guides are not moved to create a new channel.
 return {progress:p,a:point([556,846]),b:point([613,835]),
  feedA:point([613,835]),feedB:point([604,837]),depth:p*8};
}
export function installSourceRightActuators(physics){
 physics.sourceRightActuators={profile:'source-diverter-fixed-receiver-v2',
  diverterSource:[723.9,746.8],rightReceiverSource:[739.6,807],
  assumptions:'Upper moving part is a left/right diverter, not an intake. Right fixed receiver is user specified; lower electric depth remains a prototype.'};
 // The old extra shelf made a ball-diameter trap against the authored wall.
 physics.colliders=physics.colliders.filter(c=>!c.denchuShelf);
 const attacker=physics.pockets.find(p=>p.kind==='bonus'),electric=physics.pockets.find(p=>p.kind==='rush');
 const [ax,ay]=sourcePoint([739.6,807]);Object.assign(attacker,{x:ax,y:ay,w:(749.1-726.4)*.5});
 delete attacker.captureTray;delete attacker.captureRegion;
 attacker.sourceFixedRightReceiver=true;
 physics.bonusDrainExit={left:sourcePoint([628,909])[0],right:sourcePoint([659,909])[0],y:sourcePoint([628,909])[1]};
 const [ex,ey]=sourcePoint([581,852]);Object.assign(electric,{x:ex,y:ey,w:23});delete electric.captureTray;
 delete electric.captureRegion;electric.sourceRearIntake=true;
 // Dotted lines in the source join the bypass to the lower ordinary starter.
 // Recessed chute reconstruction, anchored to the authored gap endpoints.
 for(const [a,b] of [[[559.2,874.9],[558.6,898.3]],[[582.7,874.4],[582.6,896.8]]]){
  physics.colliders.push({a:point(a),b:point(b),r:.65,material:'resin',role:'source-fuzu-rear-chute',restitution:.04,playfieldOnly:true});
 }
 // The labelled OUT mouth is above its drawn collection cup, not the cup floor.
 const [ox,oy]=sourcePoint([611.25,897]);
 physics.exitSensors=[{id:'source-right-out',x:ox,y:oy,w:(632.9-589.6)*.5}];
 physics.gate.r=.65;physics.gate.playfieldOnly=true;
 physics.rightChucker.scoop.r=.65;physics.rightChucker.cover.r=.65;
 physics.rightChucker.scoop.playfieldOnly=true;physics.rightChucker.cover.playfieldOnly=true;
}
