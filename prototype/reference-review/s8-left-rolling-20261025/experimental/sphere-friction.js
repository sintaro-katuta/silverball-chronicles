// Unit-mass sphere, I = (2/5) r². A stationary pin can transfer energy between
// translation and spin, but cannot add it. No prescribed roll speed or direction.
export function applySphereFriction(ball,nx,ny,normalImpulse,friction,tangentialRestitution=0){
 if(!(friction>0)||!(normalImpulse>0))return 0;
 const inertia=.4*ball.r*ball.r,tx=-ny,ty=nx;
 const slip=ball.vx*tx+ball.vy*ty-(ball.omega??0)*ball.r;
 const limit=friction*normalImpulse,impulse=Math.max(-limit,Math.min(limit,-(1+tangentialRestitution)*slip/(1+ball.r*ball.r/inertia)));
 ball.vx+=impulse*tx;ball.vy+=impulse*ty;
 ball.omega=(ball.omega??0)-ball.r*impulse/inertia;
 return impulse;
}
// Optional authored material curve. Only incoming normal speed is used; the
// response is independent of board direction and remains in [0,1].
export function contactRestitution(base,incomingNormalSpeed,curve){
 if(!curve)return base;
 const t=Math.max(0,Math.min(1,(incomingNormalSpeed-curve.lowSpeed)/(curve.highSpeed-curve.lowSpeed))),blend=t*t*(3-2*t);
 return curve.lowRestitution+(base-curve.lowRestitution)*blend;
}
