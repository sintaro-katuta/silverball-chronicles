import {installSourceResidualContacts} from './source-residual-contact.js';
import {LCD_PIN_HEAD_CONTACT_RADIUS} from '../domain/pin-dimensions.js';
import {sourcePoint} from './source-layout.js';
export function installSourceResidualProposal(physics){
 installSourceResidualContacts(physics);
 const edge=physics.colliders.find(c=>c.sourceGuideId==='left-title-edge'&&c.sourceGuideSegment===0);edge.excludeCapA=true;
 // The guide joins the character body here; its start is not a round peg.
 for(const p of physics.pins)if(p.id===45||p.id===46){p.shaftRadius=p.r;p.r=LCD_PIN_HEAD_CONTACT_RADIUS;p.contactFriction=.5;}
 const [x,y]=sourcePoint([499.5,857.5]),a=-8*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 for(const p of physics.pins)if(p.id>=97&&p.id<=101){const dx=p.x-x,dy=p.y-y;p.x=x+c*dx-s*dy;p.y=y+s*dx+c*dy;}
 physics.residualContactProfile='source-residual-proposal-v1';
}
