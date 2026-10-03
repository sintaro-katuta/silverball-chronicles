// Draw identity is authoritative: equal queue lengths can still contain different draws.
export function createHoldMotion(){
 let mode=null,lastTime=-Infinity,tokens=new Map();
 const pose=(v,time)=>{const t=Math.max(0,Math.min(1,(time-v.at)/.28)),e=1-(1-t)**3;
  return {id:v.id,x:v.fromX+(v.x-v.fromX)*e,y:v.fromY+(130-v.fromY)*e,active:v.active};};
 return {update(time,nextMode,queue,activeId){
  const reset=mode!==nextMode||time<lastTime; if(reset)tokens.clear();
  mode=nextMode;lastTime=time;
  const wanted=queue.map((id,i)=>({id,x:69+i*18,active:false}));
  if(activeId!==null&&activeId!==undefined)wanted.push({id:activeId,x:45,active:true});
  const next=new Map();
  for(const item of wanted){let v=tokens.get(item.id);
   if(!v)v={...item,fromX:item.x,fromY:reset?130:120,at:time};
   else if(v.x!==item.x||v.active!==item.active){const p=pose(v,time);v={...item,fromX:p.x,fromY:p.y,at:time};}
   next.set(item.id,v);
  }
  tokens=next;return [...tokens.values()].map(v=>pose(v,time));
 }};
}
