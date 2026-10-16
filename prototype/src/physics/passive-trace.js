// Synchronous diagnostic observer only. No observer is installed by product callers.
export let activePhysicsTrace=null;
export const tracePoint=b=>({id:b.id,x:b.x,y:b.y,vx:b.vx,vy:b.vy,r:b.r,front:!!b.leftLaunchPlane,dead:!!b.dead});
export function withPhysicsTrace(operation,sink){
 if(activePhysicsTrace||typeof sink!=='function')throw new Error('Invalid/nested physics trace');
 activePhysicsTrace=sink;try{return operation();}finally{activePhysicsTrace=null;}
}
export function traceSolverContact(physics,ball,part,stage,operation,peer=null){
 const before=tracePoint(ball),peerBefore=peer?tracePoint(peer):null,value=operation(),after=tracePoint(ball),peerAfter=peer?tracePoint(peer):null;
 const changed=(a,b)=>a.x!==b.x||a.y!==b.y||a.vx!==b.vx||a.vy!==b.vy;
 if(changed(before,after)||peer&&changed(peerBefore,peerAfter))activePhysicsTrace({type:'contact',time:physics.time,stage,part:structuredClone(part),before,after,peerBefore,peerAfter,solverResult:value,velocityChanged:before.vx!==after.vx||before.vy!==after.vy,positionChanged:before.x!==after.x||before.y!==after.y});
 return value;
}
export function traceSubstep(physics,stage,dt,gameTime=null){activePhysicsTrace({type:'substep',stage,time:physics.time,timeStart:physics.time-dt,timeEnd:physics.time,gameTime,dt,balls:physics.balls.map(tracePoint)});}
export function traceOutcome(physics,ball,outcome){activePhysicsTrace({type:'outcome',time:physics.time,outcome,ball:tracePoint(ball)});}

export function traceMotion(physics,ball,before,dt,gameTime=null){activePhysicsTrace({type:'motion',time:physics.time,timeStart:physics.time-dt,timeEnd:physics.time,gameTime,dt,before,after:tracePoint(ball)});}

// Conservative rejection of calls that cannot change state; original solver
// still executes exactly once either way. No contact outline is approximated.
export function traceMayContact(ball,part){
 if(part.shape==='solid-polygon'){const q=part.solid?.bounds??part.bounds;if(!q)return true;return ball.x>=q.minX-ball.r&&ball.x<=q.maxX+ball.r&&ball.y>=q.minY-ball.r&&ball.y<=q.maxY+ball.r;}
 if(part.a&&part.b){const reach=ball.r+(part.r??0);return ball.x>=Math.min(part.a.x,part.b.x)-reach&&ball.x<=Math.max(part.a.x,part.b.x)+reach&&ball.y>=Math.min(part.a.y,part.b.y)-reach&&ball.y<=Math.max(part.a.y,part.b.y)+reach;}
 if(Number.isFinite(part.x)&&Number.isFinite(part.y)){const reach=ball.r+part.r;return Math.abs(ball.x-part.x)<reach&&Math.abs(ball.y-part.y)<reach;}
 return true;
}
