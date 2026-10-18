import {ROAD_SOURCE,LEFT_PINS_SOURCE,RIGHT_ROAD_SOURCE,sourcePoint} from '../pixi/source-layout.js';

// Production adoption is explicit; factory/control defaults remain reproducible.
export const PRODUCTION_NORMAL_POWER=.18;
export function productionBoardFlowOptions(){
 const pinPositions=[...ROAD_SOURCE,...LEFT_PINS_SOURCE,...RIGHT_ROAD_SOURCE].map((point,index)=>{
  const id=index+1,[x,y]=sourcePoint(point);
  return {id,x:x+(id>=47&&id<=63?-2:0),y};
 });
 return {windmillShapeProfile:'photo-three-vane',windmillOffset:{dx:0,dy:0},normalPower:PRODUCTION_NORMAL_POWER,launchRailProfile:'legacy',leftAdmissionGuides:false,hesoMouthWidth:20,pinPositions};
}
