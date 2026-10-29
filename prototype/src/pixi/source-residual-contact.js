import {LCD_PIN_HEAD_CONTACT_RADIUS} from '../domain/pin-dimensions.js';
import {sourcePoint} from './source-layout.js';
import {installSourceElectricBody} from './source-electric-body.js';
export function installSourceResidualContacts(physics){
 const pin=physics.pins.find(p=>p.id===33),[x,y]=sourcePoint([178.5-5.4,348.5]);pin.x=x;pin.y=y;
 installSourceElectricBody(physics);
 // These five nails already use the same head artwork as the left road.
 // Match that visible head, preserving centres, shaft and restitution.
 for(const p of physics.pins)if(p.id>=97&&p.id<=101){p.shaftRadius=p.r;p.r=LCD_PIN_HEAD_CONTACT_RADIUS;p.contactFriction=.5;}
 physics.residualContactProfile='source-residual-v1';
}
