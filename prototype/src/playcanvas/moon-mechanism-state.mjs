const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
/** Read-only staging. No outcome is consulted until the public resolve beat. */
export function moonMechanismState(game,p,beat){
 const idle={closure:0,opening:0,light:.12,angle:0,bonusOpen:0,bonusLight:0};
 if(game.jackpot){
  const rounds=Number(game.jackpot.displayRounds)||4;
  const level=rounds>=10?1:rounds>=6?.6:.25;
  return {...idle,bonusOpen:level,bonusLight:.35+level*.8};
 }
 if(!p||!beat)return idle;
 const progress=clamp((p.t-beat.from)/Math.max(.001,beat.to-beat.from));
 if(beat.id==='awakening'||beat.id==='revival')return {...idle,closure:ease(progress)*.16,light:.45};
 if(beat.id==='strike')return {...idle,closure:.16+.84*ease(progress),light:.65+progress*.3};
 if(beat.id==='judgment')return {...idle,closure:1,light:.9};
 if(beat.id==='resolve'){
  const release=ease(progress*3);
  return p.win?{...idle,closure:1-release,opening:Math.sin(release*Math.PI),light:1.5*(1-ease(progress)),angle:release*24}:{...idle,closure:1-ease(progress*1.8),light:.06};
 }
 return idle;
}
