import {installSourceLeftLowerGuide} from './source-left-lower-guide.js';
import {installRightUserLayout} from './source-right-user-layout.js';
import {installSourceRightUpperGuide} from './source-right-upper-guide.js';
import {installRightRoadContacts} from './right-road-contacts.js';
import {installRearElectricDecoration} from './rear-electric-decoration.js';
import {installConnectedLeftTip} from './source-left-residual.js';
import {installSourceStage} from './source-stage.js';
import {LCD_PIN_HEAD_CONTACT_RADIUS} from '../domain/pin-dimensions.js';
import {sourcePath,ROAD_SOURCE} from './source-layout.js';
import {sourceBoardSurfaces} from './source-board-surfaces.js';
import {prepareSolidPolygon} from '../physics/solid-polygon-contact.js';
export const SOURCE_GUIDE_MECHANICS='continuous-source-v1';
export function installSourceGuideMechanics(physics,{userRightLayout=true}={}){
 const path=id=>physics.sourceGuidePaths.find(p=>p.id===id);
 const left=path('left-title-edge'),round=path('left-return'),apron=path('apron-outer');
 if(!left||!round||!apron)throw new Error('Missing source guide components');
 // The round component remains visible decoration behind the continuous guard.
 // Its former open ends are not a ball entrance, floor, or upper riding surface.
 for(const c of physics.colliders)if(c.sourceGuideId==='left-return'){c.active=false;c.contactRole='decoration';}
 round.contactRole='decoration';
 const points=[left.points.at(-1),round.points.at(-1),apron.points[0]].map(p=>[...p]);
 const world=sourcePath(points).map(([x,y])=>({x,y}));
 physics.sourceGuideBridge={id:'left-guide-bridge',points,r:.65};
 for(let i=1;i<world.length;i++)physics.colliders.push({a:world[i-1],b:world[i],r:.65,material:'resin',role:'left-guide-bridge',restitution:.08,playfieldOnly:true,sourceGuideId:'left-guide-bridge',sourceGuideSegment:i-1});

 // User clarification 2026-10-25: the upper LCD-side slope is the guide;
 // the lower parallel apron outline is decorative, not a barrier above pins.
 for(const c of physics.colliders)if(c.sourceGuideId==='apron-outer'){c.active=false;c.contactRole='decoration';}
 apron.contactRole='decoration';
 const slopePoints=[[218.7,677.0],[408.0,766.9]],slopeWorld=sourcePath(slopePoints).map(([x,y])=>({x,y}));
 physics.sourceSlopeGuide={id:'user-left-slope',points:slopePoints,r:.5};
 physics.colliders.push({a:slopeWorld[0],b:slopeWorld[1],r:.5,material:'resin',role:'user-left-slope',restitution:.08,playfieldOnly:true,sourceGuideId:'user-left-slope',sourceGuideSegment:0});

 // This guessed bridge and the terminal stub created a sub-diameter throat
 // beside source pins 49/53. They are decorative, not the specified slope.
 physics.sourceGuideBridge.contactRole='decoration';
 for(const c of physics.colliders)if(c.sourceGuideId==='left-guide-bridge'||c.sourceGuideId==='left-title-edge'&&c.sourceGuideSegment===22){c.active=false;c.contactRole='decoration';}
 installSourceStage(physics);
 // Road balls ride the visible nail heads. Keep the authored centres and the
 // original shaft measurement separately instead of using it as the head.
 for(const pin of physics.pins)if(pin.id<=ROAD_SOURCE.length){pin.shaftRadius=pin.r;pin.r=LCD_PIN_HEAD_CONTACT_RADIUS;}
 physics.roadPinContactProfile='visible-head-v1';
 physics.pinContactFriction=.5;
 physics.pinContactFrictionMaxX=sourcePath([[408,0]])[0][0];

 physics.guideMechanicsProfile=SOURCE_GUIDE_MECHANICS;
 // The upper character is a solid object with the same silhouette as its art.
 // Replace the former disconnected coarse edges rather than stack two walls.
 physics.colliders=physics.colliders.filter(c=>c.sourceGuideId||!/^lcd-boundary-[0-7]$/.test(c.role));
 const head=sourcePath(sourceBoardSurfaces(physics).upperRelief).map(([x,y])=>({x,y}));
 installConnectedLeftTip(physics);
 installRearElectricDecoration(physics);
 installRightRoadContacts(physics);
 installSourceRightUpperGuide(physics);
 physics.colliders.push({a:head[0],b:head.at(-1),r:0,material:'resin',role:'upper-character-body',shape:'solid-polygon',solid:prepareSolidPolygon(head),restitution:.08,playfieldOnly:true});
 installSourceLeftLowerGuide(physics);
 if(userRightLayout)installRightUserLayout(physics);
}
