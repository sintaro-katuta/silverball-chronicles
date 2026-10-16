// Pure media validation/sampling. Does not import or execute the solver.
export const canonical=v=>JSON.stringify(normalize(v));
function normalize(v){if(Array.isArray(v))return v.map(normalize);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])]));return v===undefined?null:v;}
const fail=m=>{throw Error(m);};
export const same=(a,b,label)=>{if(canonical(a)!==canonical(b))fail(label);};
export function finitePoint(b){if(!Number.isSafeInteger(b?.id)||['x','y','vx','vy','r'].some(k=>!Number.isFinite(b[k]))||b.r!==1.8||typeof b.front!=='boolean'||typeof b.dead!=='boolean')fail('Missing actual trace ball/radius/layer');}
export function validateRun(r){
 if(r.phase!==0||r.kind!=='mechanical'||r.conditions?.mode!=='normal'||r.conditions?.power!==.18||r.conditions?.ballRadius!==1.8||r.conditions?.shotLimit!==250||r.conditions?.gravity!==690||r.conditions?.updateSeconds!==1/120||r.conditions?.mouthWidth!==20||r.conditions?.actualDrainSeconds!==45||r.replayFPS!==30)fail('Expected unchanged original250/normal.18/r1.8/30Hz');
 if(r.config?.moves?.length!==0||r.flowOptions?.launchRailProfile!=='legacy'||r.flowOptions?.hesoMouthWidth!==20||r.flowOptions?.leftAdmissionGuides!==true||Object.hasOwn(r.flowOptions,'ballRadius'))fail('Not original fixed production trial');
 const offset=r.flowOptions.windmillOffset;if(offset&&(offset.dx!==0||offset.dy!==0))fail('Windmill must remain original');
 if(r.pins?.length!==101||new Set(r.pins.map(p=>p.id)).size!==101)fail('101 unique actual pins required');
 same(r.pins,r.pinsAtEnd,'Pins changed at end');same(r.flowOptions.pinPositions,r.pins.map(({id,x,y})=>({id,x,y})),'Factory pins differ');
 if(r.fixed?.mechanisms?.[0]?.x!==64||r.fixed?.mechanisms?.[0]?.y!==476.5||r.fixed?.mechanisms?.[0]?.radius!==10)fail('Original windmill geometry required');
 const sampling=r.replaySampling;if(!sampling||sampling.fps!==30||sampling.originSeconds!==0||sampling.endStep!==sampling.stopStep+5400||r.replayFrames?.length!==Math.floor(sampling.endStep/4)+1)fail('Incomplete regular sampling');
 const countKeys=['start','normal','fuzu','rush','bonus','out','returned'];
 function frame(f){if(!f||!Array.isArray(f.balls)||!Number.isFinite(f.time)||f.inFlight!==f.balls.length||new Set(f.balls.map(b=>b.id)).size!==f.balls.length)fail('Invalid frame');
  if(countKeys.some(k=>!Number.isSafeInteger(f.counts?.[k])||f.counts[k]<0)||countKeys.reduce((s,k)=>s+f.counts[k],0)+f.inFlight!==f.spawned)fail('Count conservation');
  for(const b of f.balls)if(['x','y','r','vx','vy'].some(k=>!Number.isFinite(b[k]))||b.r!==1.8||typeof b.leftLaunchPlane!=='boolean')fail('Missing actual replay position/layer');
  if(f.mechanisms?.length!==1||['x','y','radius','angle','omega'].some(k=>!Number.isFinite(f.mechanisms[0][k])))fail('Missing actual mechanism');
 }
 for(let i=0;i<r.replayFrames.length;i++){const f=r.replayFrames[i];frame(f);if(Math.abs(f.time-i/30)>1e-7)fail('Non30Hz frame');}
 for(const key of ['stop','end']){const f=r.replayEndpoints?.[key],s=key==='stop'?r.atStop:r.end;frame(f);if(Math.abs(f.time-s.time)>1e-8||Math.abs(f.time-(key==='stop'?sampling.stopStep:sampling.endStep)/120)>1e-7)fail('Actual endpoint time');same(f.counts,s.counts,'Endpoint counts');if(f.spawned!==250||f.inFlight!==s.remaining)fail('Endpoint250/residual');}
 if(r.events?.filter(e=>e.type==='shot').length!==250||r.physical?.shots!==250)fail('Expected exact250');
 return {sourceSHA:r.sourceSHA,duration:r.replayFrames.at(-1).time,actualEnd:r.end.time,fps:30};
}
export function validateTraceRow(e,previousSeq=0){
 if(!Number.isSafeInteger(e?.seq)||e.seq<=previousSeq||!['motion','contact','substep','outcome','gap-cross'].includes(e.type)||!Number.isFinite(e.time)||!Number.isSafeInteger(e.substepIndex)||e.substepIndex<0)fail('Invalid trace order/schema');
 if(!Number.isFinite(e.timeStart)||!Number.isFinite(e.timeEnd)||e.timeStart>e.timeEnd+1e-12)fail('Missing actual substep time bounds');
 if(e.type==='motion'||e.type==='contact'){finitePoint(e.before);finitePoint(e.after);if(e.before.id!==e.after.id)fail('Ball ID changed');}
 if(e.type==='contact'){if(!['pin','wall','windmill-arm','ball-pair'].includes(e.part?.kind)||typeof e.positionChanged!=='boolean'||typeof e.velocityChanged!=='boolean')fail('Actual contact evidence missing');if(e.peerBefore){finitePoint(e.peerBefore);finitePoint(e.peerAfter);}}
 if(e.type==='substep'){if(!['before','after'].includes(e.stage)||!Array.isArray(e.balls))fail('Substep snapshot missing');e.balls.forEach(finitePoint);}
 if(e.type==='outcome'){finitePoint(e.ball);if(typeof e.outcome!=='string')fail('Actual outcome missing');}
 if(e.type==='gap-cross'&&(!/^\d+-\d+$/.test(e.gapId)||!['ordinary','large-break'].includes(e.classification)||!['kinematic-motion','solver-position-correction'].includes(e.sourceKind)||!Number.isSafeInteger(e.sourceSeq)||['frontBefore','frontAfter','discClearAtCentreCross'].some(k=>typeof e[k]!=='boolean')||['x','y','clearanceAtCross'].some(k=>!Number.isFinite(e[k]))))fail('Gap observation missing');
 return e.seq;
}
export function validateSummary(summary){
 if(summary.schema!=='s8-passive-flow-trace-v1'||summary.balls?.length!==250||new Set(summary.balls.map(b=>b.ballId)).size!==250||summary.gaps?.length!==25)fail('Incomplete250 trace summary');
 for(const b of summary.balls)for(const e of b.gapCrossings){if(['frontBefore','frontAfter','discClearAtCentreCross'].some(k=>typeof e[k]!=='boolean'))fail('Unknown gap plane/disc clearance');}
 if(summary.balls.some(b=>!b.outcome))fail('Unknown/missing actual terminal; preserve before rendering');return summary;
}
export function frontClearCross(e){return e.sourceKind==='kinematic-motion'&&e.direction==='descending'&&e.frontBefore&&e.frontAfter&&e.discClearAtCentreCross;}
export function representatives(summary){
 validateSummary(summary);const groups=new Map();for(const b of [...summary.balls].sort((a,b)=>a.ballId-b.ballId)){
  const first=b.gapCrossings.find(e=>e.sourceKind==='kinematic-motion'&&e.direction==='descending'&&e.frontBefore&&e.frontAfter);
  const classification=first?first.classification+'/'+(first.discClearAtCentreCross?'clear':'negative'):'no-front-descending-gap';
  const key=classification+'/'+b.outcome.kind,g=groups.get(key)??{key,count:0,representativeId:b.ballId};g.count++;groups.set(key,g);
 }return [...groups.values()];
}
export function floorSample(frames,time){if(!Number.isFinite(time)||time<0||!frames.length||time<frames[0].time-1e-8||time>frames.at(-1)?.time+1e-8)fail('Outside saved regular record');let l=0,h=frames.length;while(l<h){const m=(l+h)>>1;if(frames[m].time<=time+1e-8)l=m+1;else h=m;}return {index:Math.max(0,l-1),frame:frames[Math.max(0,l-1)]};}
export function diagnosticSamples(rows,ballId){
 return rows.filter(e=>e.type==='substep'&&e.stage==='after').map(e=>({seq:e.seq,time:e.time,substepIndex:e.substepIndex,ball:e.balls.find(b=>b.id===ballId)??null}));
}
export function related(e,id){return e.ballId===id||e.ball?.id===id||e.before?.id===id||e.peerBefore?.id===id||e.type==='substep';}
