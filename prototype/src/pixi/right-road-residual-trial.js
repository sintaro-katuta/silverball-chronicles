import {rightRoadTiltPositions,installRightRoadContacts} from './right-road-contacts.js';
export {rightRoadTiltPositions};
// Compatibility overlay for the already-reviewed measurement/preview runner.
export function installRightRoadResidualTrial(physics){
 for(const next of rightRoadTiltPositions()){const p=physics.pins.find(p=>p.id===next.id);p.x=next.x;p.y=next.y;}
 installRightRoadContacts(physics);physics.rightRoadResidualTrial='tilt8-visible-head-v1';
}
