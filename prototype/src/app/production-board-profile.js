import {rightRoadTiltPositions} from '../pixi/right-road-contacts.js';
import {ROAD_SOURCE,LEFT_PINS_SOURCE,RIGHT_ROAD_SOURCE,sourcePoint} from '../pixi/source-layout.js';

// Original centres except user-approved pin33 and the reviewed four right-road centres.
export const PRODUCTION_NORMAL_POWER=.18;
export function productionBoardFlowOptions(){
 const rightRoad=new Map(rightRoadTiltPositions().map(p=>[p.id,p]));
 const pinPositions=[...ROAD_SOURCE,...LEFT_PINS_SOURCE,...RIGHT_ROAD_SOURCE].map((point,index)=>{
  const [x,y]=sourcePoint(point);return rightRoad.get(index+1)??{id:index+1,x:index===32?x-3:x,y:index===78?y+1:y};
 });
 return {windmillShapeProfile:'photo-three-vane',windmillResponseProfile:'light-rotor-v1',windmillOffset:{dx:0,dy:0},normalPower:PRODUCTION_NORMAL_POWER,launchRailProfile:'reference-exit',leftAdmissionGuides:false,hesoMouthWidth:16,ballRadius:3,normalLaunchSpeedOffset:125,roadPinRestitution:.12,pixelRoadGuards:false,leftTitleGuard:false,leftInletRoute:'diagram',guideMechanicsProfile:'continuous-source-v1',pinPositions};
}
