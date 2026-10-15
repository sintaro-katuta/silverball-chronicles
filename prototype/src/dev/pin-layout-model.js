// Local development tool only. Production installLcdBoundary is untouched.
import {createBoardFlow} from '../pixi/board-flow.js';
import {hesoTrayShapes} from '../pixi/heso-guide.js';
import * as sourceDefinition from '../pixi/source-layout.js';
import {LAUNCH_RAIL_RADIUS,PLAYFIELD_APERTURE} from '../pixi/board-rails.js';
import {sourcePath,UNIT_SOURCE,FRAME_SOURCE,ELECTRIC_DEFLECTOR_SOURCE} from '../pixi/source-layout.js';

export const CONSTRAINT_VERSION='estimated-board-grid-v1';
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export const canonicalJSON=v=>JSON.stringify(canonical(v));
export async function sha256(v){const bytes=new TextEncoder().encode(typeof v==='string'?v:canonicalJSON(v));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function inside(x,y,points){let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
function segmentDistance(x,y,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a.x-t*dx,y-a.y-t*dy);}
let data;
function model(){
 if(data)return data;
 const p=createBoardFlow({lcd:true}).flow.physics;
 const groups=[
  {id:'left-road',label:'左道釘',editable:true,bounds:[60,475,190,550]},
  {id:'upper-left',label:'左上釘',editable:true,bounds:[30,220,95,305]},
  {id:'lower-left',label:'左下・一般周辺釘',editable:true,bounds:[30,400,235,570]},
  {id:'heso',label:'ヘソ2本',editable:false,reason:'入口と比較基準を維持するため初回は固定'},
  {id:'right-prize',label:'右一般入賞周辺釘',editable:true,bounds:[275,515,315,545]},
  {id:'right-road',label:'右道釘',editable:true,bounds:[230,530,265,555]},
 ];
 const pins=p.pins.map((pin,i)=>({...pin,group:pin.role==='heso'?'heso':i<26?'left-road':i>=96?'right-road':i>=93?'right-prize':i<36?'upper-left':'lower-left',baselineSiteId:`baseline:${pin.id}`}));
 const fixed={aperture:PLAYFIELD_APERTURE,polygons:[{id:'unit',points:sourcePath(UNIT_SOURCE)},{id:'lcd-frame',points:sourcePath(FRAME_SOURCE)},{id:'electric-deflector',points:sourcePath(ELECTRIC_DEFLECTOR_SOURCE)},...hesoTrayShapes(p.pockets.find(q=>q.kind==='start')).map((points,i)=>({id:`heso-tray-${i}`,points:points.map(q=>[q.x,q.y])}))],colliders:p.colliders,pockets:p.pockets,mechanisms:p.mechanisms,outlet:p.outlet};
 data={constraintVersion:CONSTRAINT_VERSION,grid:{origin:[22,180],pitch:4,estimated:true},minimumPinDistance:4,fixedClearance:2,groups,pins,fixed,sites:[]};
 for(let row=-45;row<=110;row++)for(let col=0;col<=100;col++){
  const x=22+col*4,y=180+row*4;
  if(fixedReason(x,y))continue;
  const allowedGroups=groups.filter(g=>g.editable&&x>=g.bounds[0]&&y>=g.bounds[1]&&x<=g.bounds[2]&&y<=g.bounds[3]).map(g=>g.id);
  data.sites.push({id:`grid:${col}:${row}`,x,y,allowedGroups});
 }
 for(const pin of pins)data.sites.push({id:pin.baselineSiteId,x:pin.x,y:pin.y,allowedGroups:[pin.group],ownerPinId:pin.id});
 return data;
}
function fixedReason(x,y){
 const m=data;if(!inside(x,y,m.fixed.aperture))return '盤面外';
 for(const poly of m.fixed.polygons){if(inside(x,y,poly.points))return `固定部材 ${poly.id}`;for(let i=0;i<poly.points.length;i++){const a=poly.points[i],b=poly.points[(i+1)%poly.points.length];if(segmentDistance(x,y,{x:a[0],y:a[1]},{x:b[0],y:b[1]})<m.fixedClearance)return `固定部材境界 ${poly.id}`;}}
 for(const c of m.fixed.colliders)if(segmentDistance(x,y,c.a,c.b)<(c.r??0)+m.fixedClearance)return `固定接触面 ${c.role}`;
 for(const p of m.fixed.pockets)if(Math.abs(x-p.x)<p.w/2+m.fixedClearance&&y>p.y-4&&y<p.y+9)return `入賞口 ${p.id}`;
 for(const part of m.fixed.mechanisms)if(Math.hypot(x-part.x,y-part.y)<(part.radius??0)+m.fixedClearance)return '風車';
 const o=m.fixed.outlet;if(Math.abs(x-o.x)<o.w/2+m.fixedClearance&&Math.abs(y-o.y)<4)return '排出口';
 return null;
}
export function getPinLayoutModel(){return structuredClone(model());}
// Baseline identity includes exact coordinates and contact attributes; no rounding.
export function createBaselineLayout(){const m=model();return {schemaVersion:1,constraintVersion:m.constraintVersion,baselineIdentity:canonicalJSON(m.pins),placements:m.pins.map(p=>({pinId:p.id,siteId:p.baselineSiteId}))};}
export function validateLayout(layout){
 const m=model(),errors=[],error=(code,message,pinId)=>errors.push({code,message,pinId});
 if(!layout||typeof layout!=='object'||Array.isArray(layout))return {valid:false,errors:[{code:'schema',message:'配置はJSON objectで指定してください'}]};
 if(Object.keys(layout).some(k=>!['schemaVersion','constraintVersion','baselineIdentity','placements'].includes(k)))error('schema','未定義の配置フィールド');
 if(layout.schemaVersion!==1||layout.constraintVersion!==m.constraintVersion||layout.baselineIdentity!==canonicalJSON(m.pins))error('identity','基準または制約版が異なります');
 if(!Array.isArray(layout.placements)||layout.placements.length!==101)return {valid:false,errors:[...errors,{code:'count',message:'101本の配置が必要です'}]};
 const ids=new Set(),sites=new Set(),resolved=[];
 for(const entry of layout.placements){
  if(!entry||Object.keys(entry).some(k=>!['pinId','siteId'].includes(k))){error('schema','座標や接触属性は指定できません');continue;}
  const pin=m.pins.find(p=>p.id===entry.pinId),site=m.sites.find(s=>s.id===entry.siteId);
  if(!pin){error('pin','未定義の釘ID',entry.pinId);continue;}
  if(ids.has(pin.id))error('duplicate-pin','釘IDが重複',pin.id);ids.add(pin.id);
  if(!site){error('site','未定義または禁止された地点',pin.id);continue;}
  if(sites.has(site.id))error('duplicate-site','地点が重複',pin.id);sites.add(site.id);
  if(site.ownerPinId!==undefined&&site.ownerPinId!==pin.id)error('owner','他の釘の基準地点は使用できません',pin.id);
  if(!site.allowedGroups.includes(pin.group))error('group','所属群の編集領域外',pin.id);
  if(!m.groups.find(g=>g.id===pin.group).editable&&site.id!==pin.baselineSiteId)error('fixed','初回固定の釘です',pin.id);
  if(site.id!==pin.baselineSiteId){const reason=fixedReason(site.x,site.y);if(reason)error('interference',reason,pin.id);}
  resolved.push({...pin,x:site.x,y:site.y,moved:site.id!==pin.baselineSiteId});
 }
 for(let i=0;i<resolved.length;i++)for(let j=i+1;j<resolved.length;j++)if((resolved[i].moved||resolved[j].moved)&&distance(resolved[i],resolved[j])<m.minimumPinDistance-1e-9)error('clearance',`釘${resolved[j].id}との中心距離が4未満`,resolved[i].id);
 return {valid:errors.length===0,errors};
}
function requireValid(layout){const r=validateLayout(layout);if(!r.valid){const e=new Error(r.errors.map(e=>e.message).join(' / '));e.errors=r.errors;throw e;}}
export function validateMove(layout,pinId,siteId){const next=structuredClone(layout);if(!Array.isArray(next?.placements))return validateLayout(next);const entry=next.placements.find(p=>p.pinId===pinId);if(!entry)return {valid:false,errors:[{code:'pin',pinId,message:'未定義の釘ID'}]};entry.siteId=siteId;return validateLayout(next);}
export function applyMove(layout,pinId,siteId){requireValid(layout);const next=structuredClone(layout),entry=next.placements.find(p=>p.pinId===pinId);if(!entry)throw new Error('未定義の釘ID');entry.siteId=siteId;requireValid(next);return next;}
export const movePin=applyMove;
export function resolvePins(layout){requireValid(layout);const m=model();return m.pins.map(p=>{const entry=layout.placements.find(e=>e.pinId===p.id),site=m.sites.find(s=>s.id===entry.siteId);const {group,baselineSiteId,...contact}=p;return {...contact,x:site.x,y:site.y};});}
export function diffLayout(layout){requireValid(layout);const m=model();return layout.placements.filter(e=>e.siteId!==`baseline:${e.pinId}`).map(e=>({pinId:e.pinId,from:m.pins.find(p=>p.id===e.pinId),to:m.sites.find(s=>s.id===e.siteId)}));}
export function serializeLayout(layout){requireValid(layout);return JSON.stringify({...layout,placements:[...layout.placements].sort((a,b)=>a.pinId-b.pinId)},null,2);}
export function parseLayout(text){if(typeof text!=='string'||text.length>100000)throw new Error('配置JSONが不正または大きすぎます');const v=JSON.parse(text);requireValid(v);return JSON.parse(serializeLayout(v));}
export const layoutHash=async layout=>sha256(resolvePins(layout));
// Persistence identifies declared input rules, not engine-specific sin/cos results.
export function constraintDefinition(){const m=model();return {constraintVersion:m.constraintVersion,grid:m.grid,minimumPinDistance:m.minimumPinDistance,fixedClearance:m.fixedClearance,groups:m.groups,baselinePins:m.pins,sourceCoordinates:Object.fromEntries(Object.entries(sourceDefinition).filter(([,v])=>typeof v!=='function')),sourceTransform:{sourceOrigin:[72,120],boardOrigin:[22,180],scale:.5},boardRailGeneration:{center:[444,530],outerRadii:[372,410],innerRadii:[352,390],outerSegments:80,innerSegments:24,exitAnglePiMultiplier:1.23,railRadius:LAUNCH_RAIL_RADIUS},fixedRules:{version:1,aperture:'board-rails PLAYFIELD_APERTURE',polygons:['UNIT_SOURCE','FRAME_SOURCE','ELECTRIC_DEFLECTOR_SOURCE','hesoTrayShapes'],capsules:'factory colliders r + fixedClearance',pockets:{horizontalExtra:2,before:4,after:9},windmill:'factory radius + fixedClearance',outlet:{horizontalExtra:2,vertical:4},baselineException:'own unchanged original point only',distanceCheck:'any moved pin against every other pin'}};}
export const constraintHash=async()=>sha256(constraintDefinition());
export const engineGeometryHash=async()=>sha256({fixed:model().fixed,sites:model().sites});
export async function exportLayout(layout){requireValid(layout);return JSON.stringify({formatVersion:2,layout:JSON.parse(serializeLayout(layout)),metadata:{baselineSHA:await layoutHash(createBaselineLayout()),layoutSHA:await layoutHash(layout),constraintSHA:await constraintHash(),engineGeometrySHA:await engineGeometryHash()}},null,2);}
export async function inspectImport(text){
 if(typeof text!=='string'||text.length>100000)throw new Error('Invalid saved JSON');const v=JSON.parse(text);
 if(!v||v.formatVersion!==2||Object.keys(v).sort().join(',')!=='formatVersion,layout,metadata')throw new Error('保存形式が旧版または不正です。formatVersion 2で再保存が必要です。');
 const layout=parseLayout(JSON.stringify(v.layout)),expected=JSON.parse(await exportLayout(layout)).metadata;
 if(!v.metadata||Object.keys(v.metadata).sort().join(',')!==Object.keys(expected).sort().join(',')||Object.values(v.metadata).some(x=>typeof x!=='string'||! /^[a-f0-9]{64}$/.test(x)))throw new Error('Invalid saved hash metadata');
 for(const key of ['baselineSHA','layoutSHA','constraintSHA'])if(expected[key]!==v.metadata[key])throw new Error('Saved baseline/layout/constraint SHA mismatch');
 // resolve/validate above rechecks the current engine's sites and contact clearances.
 return {layout,geometryMismatch:expected.engineGeometrySHA!==v.metadata.engineGeometrySHA,recordedEngineGeometrySHA:v.metadata.engineGeometrySHA,currentEngineGeometrySHA:expected.engineGeometrySHA,warning:expected.engineGeometrySHA!==v.metadata.engineGeometrySHA?'生成形状のSHAが異なります。現在のエンジンで配置制約を再検査済みですが、試射結果は環境別に扱ってください。':null};
}
export async function importLayout(text){return (await inspectImport(text)).layout;}
