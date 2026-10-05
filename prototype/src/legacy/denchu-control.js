// Prototype values, not specifications copied from a real machine.
export const DENCHU_SPEC=Object.freeze({gate:{left:347,right:379,y:410},holdLimit:4,odds:1/.85,drawSeconds:.2,openSeconds:1.8,closeSeconds:.6});
export class DenchuControl{
 constructor(rng=Math.random,spec=DENCHU_SPEC){this.rng=rng;this.spec=spec;this.queue=[];this.active=null;this.phase='idle';this.remaining=0;this.passes=0;this.draws=0;this.wins=0;this.openings=0;this.enabled=false;}
 pass(){this.passes++;if(!this.enabled||this.queue.length>=this.spec.holdLimit)return false;this.queue.push(this.rng()<1/this.spec.odds);return true;}
 tick(dt,enabled){this.enabled=enabled;if(!enabled){this.queue=[];this.active=null;this.phase='idle';this.remaining=0;return false;}
  if(this.phase==='idle'&&this.queue.length){this.active=this.queue.shift();this.phase='drawing';this.remaining=this.spec.drawSeconds;}
  this.remaining-=dt;
  if(this.phase!=='idle'&&this.remaining<=0){if(this.phase==='drawing'){this.draws++;if(this.active){this.wins++;this.openings++;this.phase='open';this.remaining=this.spec.openSeconds;}else{this.phase='closing';this.remaining=this.spec.closeSeconds;}this.active=null;}else if(this.phase==='open'){this.phase='closing';this.remaining=this.spec.closeSeconds;}else this.phase='idle';}
  return this.phase==='open';
 }
 snapshot(){return {phase:this.phase,passes:this.passes,draws:this.draws,wins:this.wins,openings:this.openings,holds:this.queue.length,remaining:this.remaining};}
}
