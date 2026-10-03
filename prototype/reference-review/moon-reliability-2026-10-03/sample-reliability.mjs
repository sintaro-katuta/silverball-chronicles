import {assignMoonCue,MOON_CUES} from '../../src/pixi/moon-cue.js';import {writeFile} from 'node:fs/promises';
const output=[];for(const [mode,p,n]of[['normal',.495/199.9,8000000],['rush',1/95.3,3000000]]){
 let seed=0x817523ab;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 const counts=MOON_CUES.map(c=>({...c,wins:0,losses:0}));let wins=0,reaches=0,noCue=0;
 for(let id=1;id<=n;id++){const win=random()<p;wins+=win?1:0;const reach=win||random()<.055;if(!reach)continue;reaches++;const cue=assignMoonCue({win,reach,drawId:id,mode,baseWinProbability:p,lossReachRate:.055});if(!cue){noCue++;continue;}const i=MOON_CUES.indexOf(cue);counts[i][win?'wins':'losses']++;}
 const rows=counts.map(c=>({...c,observed:c.wins/(c.wins+c.losses)*100}));output.push({mode,draws:n,wins,reaches,noCue,rows});
}
await writeFile('reference-review/moon-reliability-2026-10-03/sample-reliability.json',JSON.stringify({scope:'Synthetic independent draw/reach sampling, not live ball admission or measured W internals.',output},null,2));console.log(output.map(x=>({mode:x.mode,draws:x.draws,maxDifferencePercentagePoints:Math.max(...x.rows.map(c=>Math.abs(c.observed-c.expectation)))})));
