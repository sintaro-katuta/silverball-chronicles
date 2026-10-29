// Unit-mass sphere, I = (2/5) r². A stationary pin can transfer energy between
// translation and spin, but cannot add it. No prescribed roll speed or direction.
export function applySphereFriction(ball,nx,ny,normalImpulse,friction){
 if(!(friction>0)||!(normalImpulse>0))return 0;
 const inertia=.4*ball.r*ball.r,tx=-ny,ty=nx;
 const slip=ball.vx*tx+ball.vy*ty-(ball.omega??0)*ball.r;
 const limit=friction*normalImpulse,impulse=Math.max(-limit,Math.min(limit,-slip/(1+ball.r*ball.r/inertia)));
 ball.vx+=impulse*tx;ball.vy+=impulse*ty;
 ball.omega=(ball.omega??0)-ball.r*impulse/inertia;
 return impulse;
}
