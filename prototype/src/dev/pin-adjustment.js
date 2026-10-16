import {collideSolidPolygon} from '../physics/solid-polygon-contact.js';
// Internal local trial only. No grid snapping, production adoption or automatic search.
import {createBoardFlow,LEFT_ADMISSION_GUIDE_ROLES,LCD_LOWER_APRON_ROLES} from '../pixi/board-flow.js';
import {getPinLayoutModel,sha256,canonicalJSON} from './pin-layout-model.js';
export const MM_ASSUMPTION=Object.freeze({assumedBallDiameterMM:11,logicalBallDiameter:3.6,mmPerLogicalUnit:11/3.6,note:'球径を11mmと仮定した相当量。実機採寸ではない。'});
export const TRIAL_GUIDE_ROLES=Object.freeze([...LEFT_ADMISSION_GUIDE_ROLES]);
const distanceToSegment=(x,y,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a.x-t*dx,y-a.y-t*dy);};
function inside(x,y,points){let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
export function resolvePinAdjustment(config){
 if(!config||Object.keys(config).some(k=>!['id','label','leftAdmissionGuides','hesoMouthWidth','moves','ballRadius','launchRailProfile','normalPower','windmillOffset','windmillShapeProfile'].includes(k))||typeof config.id!=='string'||typeof config.label!=='string'||typeof config.leftAdmissionGuides!=='boolean'||!Array.isArray(config.moves))throw new Error('Invalid adjustment configuration');
 if(config.windmillShapeProfile!==undefined&&!['legacy-capsules','visible-polygons'].includes(config.windmillShapeProfile))throw new Error('Invalid configured windmill shape');
 if(config.normalPower!==undefined&&(!Number.isFinite(config.normalPower)||config.normalPower<0||config.normalPower>1))throw new Error('Invalid configured normal power');
 const model=createBoardFlow({lcd:true,leftAdmissionGuides:config.leftAdmissionGuides,hesoMouthWidth:config.hesoMouthWidth??20,ballRadius:config.ballRadius??null,launchRailProfile:config.launchRailProfile??'legacy',windmillOffset:config.windmillOffset??null,windmillShapeProfile:config.windmillShapeProfile??'legacy-capsules'}),p=model.flow.physics,pins=structuredClone(p.pins),seen=new Set();
 for(const move of config.moves){
  if(!move||Object.keys(move).sort().join(',')!=='dx,dy,pinId'||!Number.isInteger(move.pinId)||!Number.isFinite(move.dx)||!Number.isFinite(move.dy)||Math.hypot(move.dx,move.dy)>1+1e-12||seen.has(move.pinId))throw new Error('Invalid adjustment; total displacement from original is limited to 1 logical unit');
  const pin=pins.find(q=>q.id===move.pinId);if(!pin)throw new Error('Unknown pin');seen.add(move.pinId);pin.x+=move.dx;pin.y+=move.dy;
 }
 const geometry=getPinLayoutModel().fixed;
 for(const id of seen){const pin=pins.find(p=>p.id===id),old=p.pins.find(p=>p.id===id);if(pin.x===old.x&&pin.y===old.y)continue;
  if(!inside(pin.x,pin.y,geometry.aperture))throw new Error(`Pin ${id}: outside board`);
  for(const poly of geometry.polygons.filter(q=>config.leftAdmissionGuides||!q.id.startsWith('heso-tray-'))){
   if(inside(pin.x,pin.y,poly.points)||poly.points.some((a,i)=>{const b=poly.points[(i+1)%poly.points.length];return distanceToSegment(pin.x,pin.y,{x:a[0],y:a[1]},{x:b[0],y:b[1]})<2;}))throw new Error(`Pin ${id}: fixed polygon ${poly.id}`);
  }
  for(const c of p.colliders){if(c.shape==='solid-polygon'){const circle={x:pin.x,y:pin.y,r:2,vx:0,vy:0};collideSolidPolygon(circle,c);if(circle.x!==pin.x||circle.y!==pin.y)throw new Error(`Pin ${id}: fixed contact ${c.role}`);}else if(distanceToSegment(pin.x,pin.y,c.a,c.b)<(c.r??0)+2)throw new Error(`Pin ${id}: fixed contact ${c.role}`);}
  for(const q of p.pockets)if(Math.abs(pin.x-q.x)<q.w/2+2&&pin.y>q.y-4&&pin.y<q.y+9)throw new Error(`Pin ${id}: mouth interference`);
  for(const m of p.mechanisms)if(Math.hypot(pin.x-m.x,pin.y-m.y)<m.radius+2)throw new Error(`Pin ${id}: windmill interference`);
 }
 for(let i=0;i<pins.length;i++)for(let j=i+1;j<pins.length;j++)if((seen.has(pins[i].id)||seen.has(pins[j].id))&&Math.hypot(pins[i].x-pins[j].x,pins[i].y-pins[j].y)<4-1e-9)throw new Error(`Pins ${pins[i].id}/${pins[j].id}: centre clearance below 4`);
 return {config:structuredClone(config),pins,pinPositions:pins.map(({id,x,y})=>({id,x,y})),flowOptions:{...(config.windmillShapeProfile!==undefined?{windmillShapeProfile:config.windmillShapeProfile}:{}),...(config.windmillOffset!==undefined?{windmillOffset:structuredClone(config.windmillOffset)}:{}),...(config.normalPower!==undefined?{normalPower:config.normalPower}:{}),...(config.launchRailProfile!==undefined?{launchRailProfile:config.launchRailProfile}:{}),leftAdmissionGuides:config.leftAdmissionGuides,hesoMouthWidth:config.hesoMouthWidth??20,...(config.ballRadius!==undefined?{ballRadius:config.ballRadius}:{}),pinPositions:pins.map(({id,x,y})=>({id,x,y}))},mmAssumption:MM_ASSUMPTION};
}
export async function preparePinAdjustment(config){const resolved=resolvePinAdjustment(config);return {...resolved,layoutSHA:await sha256(resolved.pins),configSHA:await sha256(config)};}
export function samePinAttributes(a,b){return canonicalJSON(a.map(({x,y,...p})=>p))===canonicalJSON(b.map(({x,y,...p})=>p));}
export function initialTrialCases(){
 return [{id:'current',label:'現行・口幅20・追加皿あり',leftAdmissionGuides:true,hesoMouthWidth:20,moves:[]},{id:'source-diagram',label:'元図壁・口幅12・独自追加皿なし',leftAdmissionGuides:false,hesoMouthWidth:12,moves:[]}];
}

export function microTrialCases(){
 const pins=createBoardFlow({lcd:true,leftAdmissionGuides:false,hesoMouthWidth:12}).flow.physics.pins,heso=pins.filter(p=>p.role==='heso').sort((a,b)=>a.x-b.x),road=pins.slice(22,26);
 const base=(id,label,moves=[])=>({id,label,leftAdmissionGuides:false,hesoMouthWidth:12,moves});
 const gap=dx=>[{pinId:heso[0].id,dx,dy:0},{pinId:heso[1].id,dx:-dx,dy:0}];
 const height=dy=>heso.map(p=>({pinId:p.id,dx:0,dy}));
 const roadHeight=dy=>road.map(p=>({pinId:p.id,dx:0,dy}));
 return [base('source-base','元図基準'),base('heso-in-half','命釘を左右内へ各0.5',gap(.5)),base('heso-out-half','命釘を左右外へ各0.5',gap(-.5)),base('heso-up-half','命釘2本を上へ0.5',height(-.5)),base('heso-down-half','命釘2本を下へ0.5',height(.5)),base('road-up-half','直前道釘4本を上へ0.5',roadHeight(-.5)),base('road-down-half','直前道釘4本を下へ0.5',roadHeight(.5))];
}

// Explicit historical comparison only: neither entry changes product defaults.
// .20 is a performance control outside the fixed upper-left aim; .14 was
// rejected for whole-board admission/return results despite hitting that aim.
export function normalStrengthComparisonCases(){return [.20,.14].map(normalPower=>({id:`comparison-power-${normalPower}`,label:normalPower===.20?'入賞性能の比較対照0.20（狙い採用ではない）':'比較履歴0.14（全体採用見送り）',leftAdmissionGuides:false,hesoMouthWidth:12,ballRadius:1.8,launchRailProfile:'reference-exit',normalPower,moves:[]}));}
