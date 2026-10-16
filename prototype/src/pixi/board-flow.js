import {WINDMILL_VISIBLE_SHAPE_VERSION} from '../domain/windmill-shape.js';
import {applyWindmillOffset,WINDMILL_OFFSET_STRICT,WINDMILL_FEED_LEFT175} from './windmill-offset.js';
import {installHesoGuides} from './heso-guide.js';
import {installRightResinRoute,attachRightRouteDepth} from './right-resin-route.js';
import {attachPassGate} from './pass-gate.js';
import {attachLeftRouteMetrics} from './left-route-metrics.js';
import {HESO_MOUTH_WIDTH} from './heso-pocket-geometry.js';
import {installLcdBoundary} from './lcd-layout.js';
import {createPartFlow} from '../physics/ball-flow.js';
import {attachRightStartMotion} from './right-start-motion.js';
import {attachAttackerMotion} from './attacker-motion.js';
export const LEFT_ADMISSION_GUIDE_ROLES=Object.freeze(['heso-guide']);
export const LCD_LOWER_APRON_ROLES=Object.freeze(['lcd-boundary-16','lcd-boundary-17','lcd-boundary-18','lcd-boundary-19','lcd-boundary-20']);
// Combined mechanical review only. Individual approved previews remain unchanged.
export function createBoardFlow({lcd=false,normalPower=.20,launchInterval=.6,rightPower=.85,passGate=true,fire=null,pegSeed=0,leftAdmissionGuides=true,hesoMouthWidth=HESO_MOUTH_WIDTH,pinPositions=null,ballRadius=null,launchRailProfile='legacy',windmillOffset=null,windmillOffsetProfile=WINDMILL_OFFSET_STRICT,windmillShapeProfile='legacy-capsules'}={}){
 if(!['legacy','reference-exit'].includes(launchRailProfile)||!lcd&&launchRailProfile!=='legacy')throw new Error('Unsupported launch rail profile for this board');
 const options={fire,pegSeed,launchPower:.5,launchInterval:lcd?launchInterval:.1},flow=createPartFlow('normal',options);
 const tulip=attachRightStartMotion(flow),attacker=attachAttackerMotion(flow);
 // Shared guide: keep the tulip's upper clearance and the attacker's lower centre.
 const guide=flow.physics.colliders.find(c=>c.role==='right-inner-lower');guide.a.x=336;guide.b.x=330;
 if(lcd){installLcdBoundary(flow.physics,{hesoMouthWidth,launchRailProfile});installHesoGuides(flow.physics);installRightResinRoute(flow.physics);attachRightRouteDepth(flow.physics);}
 // Opt-in internal calibration: production callers retain all original contacts.
 if(typeof leftAdmissionGuides!=='boolean')throw new Error('Invalid guide option');
 if(!leftAdmissionGuides){if(!lcd)throw new Error('Guide trial requires LCD board');flow.physics.colliders=flow.physics.colliders.filter(c=>!LEFT_ADMISSION_GUIDE_ROLES.includes(c.role));}
 const feedShift=windmillOffsetProfile===WINDMILL_FEED_LEFT175,originalFeedPins=feedShift?JSON.stringify(flow.physics.pins):null;
 if(![WINDMILL_OFFSET_STRICT,WINDMILL_FEED_LEFT175].includes(windmillOffsetProfile))throw new Error('Unknown internal windmill offset profile');
 if(pinPositions!==null){
  if(!lcd||!Array.isArray(pinPositions))throw new Error('Invalid trial pin positions');
  const seen=new Set(),next=structuredClone(flow.physics.pins);
  for(const pos of pinPositions){
   if(!pos||Object.keys(pos).sort().join(',')!=='id,x,y'||!Number.isInteger(pos.id)||!Number.isFinite(pos.x)||!Number.isFinite(pos.y)||seen.has(pos.id))throw new Error('Invalid trial pin position');
   const pin=next.find(p=>p.id===pos.id);if(!pin)throw new Error('Unknown trial pin');seen.add(pos.id);pin.x=pos.x;pin.y=pos.y;
  }
  flow.physics.pins=next;
 }
 if(ballRadius!==null){if(!lcd||![1.4,1.6,1.7,1.8,1.85,1.9,2.0,2.2,3,4.09].includes(ballRadius))throw new Error('Unsupported internal trial ball radius');flow.physics.ballRadius=ballRadius;flow.physics.displayBallScale=6*ballRadius/28;flow.physics.displayBallDiameter=2*ballRadius;}
 if(feedShift&&(!lcd||leftAdmissionGuides!==false||hesoMouthWidth!==20||normalPower!==.18||launchInterval!==.6||rightPower!==.85||passGate!==true||ballRadius!==null||launchRailProfile!=='legacy'||windmillShapeProfile!=='photo-three-vane'||JSON.stringify(flow.physics.pins)!==originalFeedPins||windmillOffset?.dx!==-1.75||windmillOffset?.dy!==0))throw new Error('Feed shift requires unchanged original board and exact internal geometry');
 if(windmillOffset!==null){if(!lcd)throw new Error('Windmill trial requires LCD board');applyWindmillOffset(flow.physics,windmillOffset,{profile:windmillOffsetProfile});}
 if(!['legacy-capsules','photo-three-vane'].includes(windmillShapeProfile)||!lcd&&windmillShapeProfile!=='legacy-capsules')throw new Error('Invalid windmill shape profile');
 if(windmillShapeProfile==='photo-three-vane'){flow.physics.mechanisms[0].shapeProfile=windmillShapeProfile;flow.physics.mechanisms[0].shapeVersion=WINDMILL_VISIBLE_SHAPE_VERSION;}
 let currentMode='normal';
 const setMode=mode=>{currentMode=mode;options.launchPower=mode==='normal'?(lcd?normalPower:.5):(lcd?rightPower:1);flow.game.rush=mode==='rush'?{}:null;attacker.request(mode==='bonus');tulip.request(mode==='rush');};
 const leftMetrics=lcd?attachLeftRouteMetrics(flow):null;
 const setNormalPower=value=>{if(!Number.isFinite(value))return;normalPower=Math.max(0,Math.min(1,value));if(lcd&&currentMode==='normal')options.launchPower=normalPower;};
 const gate=lcd&&passGate?attachPassGate(flow):null;
 return {flow,tulip,attacker,getMode:()=>currentMode,setMode,leftMetrics,setNormalPower,gate};
}
