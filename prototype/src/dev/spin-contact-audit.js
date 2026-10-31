// Experimental contact term only; production never imports this module.
// Unit-mass solid sphere: I = (2/5) r². Friction transfers linear/angular
// momentum at the contact, clamped to Coulomb's |jt| <= mu * jn.
export const spinEnergy=b=>.5*(b.vx*b.vx+b.vy*b.vy)+.5*.4*b.r*b.r*(b.omega??0)**2;
export const spinAudit={contacts:0,maxEnergyIncrease:0,maxOmega:0};
export function resetSpinAudit(){spinAudit.contacts=0;spinAudit.maxEnergyIncrease=0;spinAudit.maxOmega=0;}
export function applySpinFriction(b,nx,ny,normalImpulse,surface={x:0,y:0}){
 const mu=b.spinFriction;if(!(mu>0)||!(normalImpulse>0))return 0;
 const before=spinEnergy(b),I=.4*b.r*b.r,tx=-ny,ty=nx,vt=(b.vx-surface.x)*tx+(b.vy-surface.y)*ty-(b.omega??0)*b.r;
 const jt=Math.max(-mu*normalImpulse,Math.min(mu*normalImpulse,-vt/(1+b.r*b.r/I)));
 b.vx+=jt*tx;b.vy+=jt*ty;b.omega=(b.omega??0)-b.r*jt/I;
 spinAudit.contacts++;spinAudit.maxOmega=Math.max(spinAudit.maxOmega,Math.abs(b.omega));
 if(surface.x===0&&surface.y===0)spinAudit.maxEnergyIncrease=Math.max(spinAudit.maxEnergyIncrease,spinEnergy(b)-before);
 return jt;
}
