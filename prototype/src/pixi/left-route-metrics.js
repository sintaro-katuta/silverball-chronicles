// Observations only: never alter position, velocity or admission.
export function attachLeftRouteMetrics(flow){
 const records=new Map(),physics=flow.physics,advance=physics.advanceBall.bind(physics),hit=flow.game.hit.bind(flow.game),lose=flow.game.lose.bind(flow.game);
 const record=b=>{if(!records.has(b.id))records.set(b.id,{power:b.power,road:false,near:false,hesoContact:false,outcome:null});return records.get(b.id);};
 physics.advanceBall=(b,dt,options={})=>{const prev=advance(b,dt,options);if(!options.predict){const r=record(b),p=physics.pockets.find(p=>p.kind==='start');
  if(b.x>=85&&b.x<200&&b.y>=395&&b.y<=p.y-15&&b.contactRoles?.includes('michi'))r.road=true;
  if(Math.abs(b.x-p.x)<=25&&b.y>=p.y-40&&b.y<=p.y+b.r)r.near=true;
  if(b.contactRoles?.includes('heso'))r.hesoContact=true;
 }return prev;};
 flow.game.hit=(b,kind,...args)=>{record(b).outcome=kind;hit(b,kind,...args);};
 flow.game.lose=b=>{record(b).outcome='out';lose(b);};
 const summarize=(entries,alive)=>{
  const s={roadContact:0,nearHeso:0,admitted:0,nearAdmitted:0,deflectedAtHeso:0,nearMiss:0,earlySpill:0,pending:0,nearPending:0,nearMissOutcomes:{},outcomes:{},tracked:entries.length};
  for(const [id,r]of entries){if(r.road)s.roadContact++;if(r.near)s.nearHeso++;
   if(alive.has(id)){if(r.road||r.near)s.pending++;if(r.near)s.nearPending++;continue;}
   const outcome=r.outcome??'unclassified';s.outcomes[outcome]=(s.outcomes[outcome]??0)+1;
   if(r.outcome==='start'){s.admitted++;if(r.near)s.nearAdmitted++;}
   else if(r.near){if(r.hesoContact)s.deflectedAtHeso++;else{s.nearMiss++;s.nearMissOutcomes[outcome]=(s.nearMissOutcomes[outcome]??0)+1;}}
   else if(r.road)s.earlySpill++;
  }return s;
 };
 return {snapshot(){const alive=new Set(physics.balls.map(b=>b.id)),entries=[...records],s=summarize(entries,alive);s.byPower={};
  for(const power of new Set(entries.map(([,r])=>r.power)))s.byPower[String(power)]=summarize(entries.filter(([,r])=>r.power===power),alive);
  return s;
 }};
}
