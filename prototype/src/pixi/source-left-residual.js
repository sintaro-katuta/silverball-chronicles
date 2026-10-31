import {sourcePoint} from './source-layout.js';
// A continuing frame/character joint has no independent round peg at its cut.
export function installConnectedLeftTip(physics){
 const edge=physics.colliders.find(c=>c.sourceGuideId==='left-title-edge'&&c.sourceGuideSegment===0);edge.excludeCapA=true;
}
export function installSourceLeftResidual(physics){
 const pin=physics.pins.find(p=>p.id===33),[x,y]=sourcePoint([172.5,348.5]);pin.x=x;pin.y=y;
 installConnectedLeftTip(physics);physics.leftResidualProfile='pin33-and-connected-tip-v1';
}
