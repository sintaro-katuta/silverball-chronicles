import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const base='reference-review/s8-board-consistency-20261020',r=JSON.parse(readFileSync(base+'/baseline-normal-0/result.json'));
const first=new Map();for(const e of r.reverse)if(!first.has(e.before.id))first.set(e.before.id,e);
const examples=[];
for(const [ballId,e] of first){const path=(r.paths[ballId]??[]).filter(p=>p.time>=e.time&&p.time<=e.time+.75);if(!path.length)continue;const peak=path.reduce((a,b)=>a.y<b.y?a:b);examples.push({ballId,pinId:e.part.id,time:e.time,riseWithin075Seconds:e.before.y-peak.y,peak,contact:e,path});}
examples.sort((a,b)=>b.riseWithin075Seconds-a.riseWithin075Seconds);
const report={scope:'Baseline phase0: first recorded reversal per ball, retained path up to180 frames at60Hz, 0.75second ascent window; not user-target confirmation or complete reversal rate',velocityReversals:r.reverseCount,uniqueBalls:first.size,examples:examples.slice(0,5),allPinImpulseEnergyNonIncreasing:r.reverse.every(e=>e.after.vx**2+e.after.vy**2<=e.before.vx**2+e.before.vy**2+1e-8)};
writeFileSync(base+'/reverse-analysis.json',JSON.stringify(report,null,2));
const a=examples[0];if(!a)throw Error('No observed ascent');
const pins=r.initial.pins.filter(p=>p.id<=26),points=[...a.path,...pins],left=Math.min(...points.map(p=>p.x))-5,top=Math.min(...points.map(p=>p.y))-10,width=Math.max(...points.map(p=>p.x))-left+6,height=Math.max(...points.map(p=>p.y))-top+6;
const nails=pins.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="#f5c36b"/><text x="${p.x+1}" y="${p.y-1}" fill="#bbc9dc" font-size="1.5">${p.id}</text>`).join(''),path=a.path.map(p=>`${p.x},${p.y}`).join(' '),b=a.contact.before;
writeFileSync(base+'/reverse-example.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${width} ${height}" width="1000" height="1000"><rect x="${left}" y="${top}" width="${width}" height="${height}" fill="#0a1524"/>${nails}<polyline points="${path}" fill="none" stroke="#57dce8" stroke-width=".35"/><circle cx="${b.x}" cy="${b.y}" r="1.8" fill="none" stroke="#ff657a" stroke-width=".3"/><circle cx="${a.peak.x}" cy="${a.peak.y}" r="1" fill="#57dce8"/><text x="${left+2}" y="${top+3}" fill="#fff" font-size="2">Ball ${a.ballId}, pin ${a.pinId}; rise ${a.riseWithin075Seconds.toFixed(2)} board units</text><text x="${left+2}" y="${top+6}" fill="#fff" font-size="1.7">Recorded trajectory / contact shafts, not a corrected path or measured mm</text></svg>`);
console.log(JSON.stringify({ballId:a.ballId,pinId:a.pinId,rise:a.riseWithin075Seconds,scope:report.scope}));
