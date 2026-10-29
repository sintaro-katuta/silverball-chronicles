import {SOURCE_GUIDE_TRACES,SOURCE_GUIDE_TRACE_VERSION} from '../pixi/source-guide-trace.js';
export const REFERENCE={width:904,height:1280,image:'pixi-source-layout/reference.jpg'};
const names={'left-inlet':'左上・独立したガイド','left-title-edge':'タイトル左側の縁','left-return':'左下・丸い部分','left-return-band':'左下・横の帯','apron-outer':'液晶下・道釘側の縁','apron-moulding':'液晶下・太い成形縁','apron-inner':'液晶下・内側の縁','apron-bevel-left':'液晶下・左の段差','apron-bevel-right':'液晶下・右の段差','unit-right-step':'右側・液晶脇の段差','right-channel-inner':'右上・内側のガイド','right-channel-outer':'右上・外側のガイド','right-upper-silhouette':'右上・外側の輪郭','right-attacker-approach':'右側・上の曲がり','right-return-wall':'右下・外側の壁','right-return-inner':'右下・内側の壁','right-outside-wall':'右下・長い外壁','right-outside-back-edge':'右下・外壁の縁','right-lower-guide':'右下・下の曲がり','electric-upper-bevel':'始動口・上の縁','electric-outer-bevel':'始動口・外の縁','electric-left-moulding':'始動口・左の縁'};
export const clone=value=>structuredClone(value);
export const roundPoint=([x,y])=>[Math.round(Math.max(0,Math.min(904,x))*10)/10,Math.round(Math.max(0,Math.min(1280,y))*10)/10];
export function initialDocument(){return {lines:SOURCE_GUIDE_TRACES.map(p=>({id:p.id,sourceTemplateId:p.id,name:names[p.id]??p.id,kind:p.contact?'guide':'detail',mode:'polyline',closed:false,reviewed:false,visible:true,points:p.points.map(q=>[...q])}))};}
export function validateDocument(value){
 if(!value||typeof value!=='object'||!Array.isArray(value.lines)||value.lines.length>300)throw Error('線のデータを読み取れません。保存したJSONファイルを選んでください。');
 const ids=new Set(),lines=[];let pointCount=0;
 for(const raw of value.lines){
  if(!raw||typeof raw.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(raw.id)||ids.has(raw.id))throw Error('線の識別名が重複しているか、読み取れません。');
  ids.add(raw.id);
  if(typeof raw.name!=='string'||raw.name.length>80||!['guide','detail','undecided'].includes(raw.kind)||!['polyline','curve'].includes(raw.mode)||!Array.isArray(raw.points)||raw.points.length>3000)throw Error('線の設定を読み取れません。');
  const points=raw.points.map(p=>{if(!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||p[0]<0||p[0]>904||p[1]<0||p[1]>1280)throw Error('画像の外にある点、または不正な座標が含まれています。');return [...p];});
  pointCount+=points.length;if(pointCount>15000)throw Error('点の数が多すぎます。');
  if(raw.sourceTemplateId!==null&&raw.sourceTemplateId!==undefined&&!SOURCE_GUIDE_TRACES.some(p=>p.id===raw.sourceTemplateId))throw Error('元の線との対応を読み取れません。');
  lines.push({id:raw.id,sourceTemplateId:raw.sourceTemplateId??null,name:raw.name,kind:raw.kind,mode:raw.mode,closed:raw.closed===true,reviewed:raw.reviewed===true,visible:raw.visible!==false,points});
 }
 return {lines};
}
export function importDocument(value){
 if(value?.format!=='silverball-guide-layout'||value.version!==1||value.reference?.width!==904||value.reference?.height!==1280)throw Error('この編集ツールで保存した904×1280のデータを選んでください。');
 return validateDocument(value);
}
export function cubicSegments(line){
 const ps=line.points,n=ps.length,segments=[];if(n<2)return segments;
 const at=i=>line.closed?ps[(i+n)%n]:ps[Math.max(0,Math.min(n-1,i))];
 for(let i=0;i<(line.closed?n:n-1);i++){const a=at(i),b=at(i+1);if(line.mode==='polyline'){segments.push({index:i,a,b});continue;}
  const prev=at(i-1),next=at(i+2);
  // Clamp tangents to the segment's scale so a nearby short segment cannot
  // create a large loop. Curves interpolate every user-placed point.
  const len=Math.hypot(b[0]-a[0],b[1]-a[1]),tangent=(v,max)=>{const l=Math.hypot(...v);return l>max?v.map(x=>x*max/l):v;};
  const ta=tangent([(b[0]-prev[0])/6,(b[1]-prev[1])/6],len/2),tb=tangent([(next[0]-a[0])/6,(next[1]-a[1])/6],len/2);
  const bound=p=>p.map((v,k)=>Math.max(0,Math.min(k?1280:904,v)));
  const c1=bound([a[0]+ta[0],a[1]+ta[1]]),c2=bound([b[0]-tb[0],b[1]-tb[1]]);
  segments.push({index:i,a,b,c1,c2});
 }return segments;
}
export function pointOnSegment(s,t){if(!s.c1)return s.a.map((v,k)=>v+(s.b[k]-v)*t);const u=1-t;return [0,1].map(k=>u*u*u*s.a[k]+3*u*u*t*s.c1[k]+3*u*t*t*s.c2[k]+t*t*t*s.b[k]);}
export function linePath(line){const ps=line.points;if(!ps.length)return '';let d=`M${ps[0].join(',')}`;for(const s of cubicSegments(line))d+=s.c1?`C${s.c1.join(',')} ${s.c2.join(',')} ${s.b.join(',')}`:`L${s.b.join(',')}`;return d+(line.closed&&ps.length>2?'Z':'');}
// Adaptive subdivision retains curvature in the handoff polyline (<=.15 source px).
export function sampledPoints(line){
 const result=[];const flatness=(s)=>{const dx=s.b[0]-s.a[0],dy=s.b[1]-s.a[1],l=Math.hypot(dx,dy);return Math.max(...[s.c1,s.c2].map(p=>l?Math.abs(dy*p[0]-dx*p[1]+s.b[0]*s.a[1]-s.b[1]*s.a[0])/l:Math.hypot(p[0]-s.a[0],p[1]-s.a[1])));};
 const mid=(a,b)=>a.map((v,k)=>(v+b[k])/2);
 const append=(s,depth=0)=>{if(!s.c1||flatness(s)<=.15||depth>=14){result.push([...s.b]);return;}const a=mid(s.a,s.c1),b=mid(s.c1,s.c2),c=mid(s.c2,s.b),d=mid(a,b),e=mid(b,c),m=mid(d,e);append({a:s.a,c1:a,c2:d,b:m},depth+1);append({a:m,c1:e,c2:c,b:s.b},depth+1);};
 if(line.points.length)result.push([...line.points[0]]);for(const s of cubicSegments(line))append(s);
 return result.map(p=>p.map((v,k)=>Math.max(0,Math.min(k?1280:904,Math.round(v*1000)/1000))));
}
export function nearestInsertion(line,p){let best=null;for(const s of cubicSegments(line)){let last=s.a;const steps=s.c1?100:1;for(let i=1;i<=steps;i++){const b=pointOnSegment(s,i/steps),dx=b[0]-last[0],dy=b[1]-last[1],l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p[0]-last[0])*dx+(p[1]-last[1])*dy)/l)):0,q=[last[0]+dx*t,last[1]+dy*t],distance=Math.hypot(p[0]-q[0],p[1]-q[1]);if(!best||distance<best.distance)best={index:s.index+1,point:roundPoint(q),distance};last=b;}}return best;}
export function exportDocument(doc){
 const valid=validateDocument(doc),initial=initialDocument();
 return {format:'silverball-guide-layout',version:1,reference:{...REFERENCE},baseVersion:SOURCE_GUIDE_TRACE_VERSION,savedAt:new Date().toISOString(),...valid,
  removedSourceIds:initial.lines.filter(b=>!valid.lines.some(l=>l.sourceTemplateId===b.id)).map(l=>l.id),
  sourcePaths:valid.lines.filter(l=>l.points.length>=2).map(l=>({id:l.id,sourceTemplateId:l.sourceTemplateId,name:l.name,reviewed:l.reviewed,contact:l.kind==='undecided'?null:l.kind==='guide',points:sampledPoints(l)}))};
}
export function createHistory(initial,limit=80){let current=clone(initial),past=[],future=[];return {get value(){return current;},get canUndo(){return past.length>0;},get canRedo(){return future.length>0;},commit(next){if(JSON.stringify(next)===JSON.stringify(current))return false;past.push(clone(current));if(past.length>limit)past.shift();current=clone(next);future=[];return true;},undo(){if(!past.length)return false;future.push(current);current=past.pop();return true;},redo(){if(!future.length)return false;past.push(current);current=future.pop();return true;}};}
