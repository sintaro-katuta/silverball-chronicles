// Static actual-geometry overlay only. Never steps physics or captures a browser.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex'),escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const finitePoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
export function geometryComponents(g){
 const capsules=g.capsules??g.segments??[];if(!Array.isArray(capsules))throw Error('Actual capsule array missing');
 const components=g.components??[],boundary=g.boundary??[];
 if(!Array.isArray(components)||!Array.isArray(boundary))throw Error('Actual shared polygon/boundary arrays missing');
 for(const c of capsules)if(!finitePoint(c.a)||!finitePoint(c.b)||!Number.isFinite(c.r)||c.r<=0)throw Error('Malformed actual capsule');
 for(const c of components)if(c.shape==='circle'){if(!finitePoint(c.centre)||!Number.isFinite(c.radius)||c.radius<=0)throw Error('Malformed analytic hub');}else if(!Array.isArray(c.points)||c.points.length<3||!c.points.every(finitePoint))throw Error('Malformed actual component');
 for(const e of boundary){if(!finitePoint(e.a)||!finitePoint(e.b))throw Error('Malformed actual union boundary');if(e.type==='arc'&&(!finitePoint(e.centre)||['radius','startAngle','endAngle'].some(k=>!Number.isFinite(e[k]))))throw Error('Malformed actual analytic arc');}
 return {capsules,components,boundary};
}
export function overlaySVG(records){
 if(records.length!==4)throw Error('Four declared angles required');
 const scale=11,body=[];const pt=(p,m,ox,oy)=>[ox+(p.x-m.x)*scale,oy+(p.y-m.y)*scale];
 for(const[i,r]of records.entries()){
  const left=400*i,ox=left+200,oy=280;body.push(`<rect x="${left+8}" y="112" width="384" height="374" rx="8" fill="#0d2130"/><text x="${left+24}" y="147" fill="white" font-size="21">${escape(r.label)}（${r.angle.toFixed(6)} rad）</text>`);
  const legacy=geometryComponents(r.legacy),shared=geometryComponents(r.shared);
  if(legacy.capsules.length!==4||shared.components.length!==4||!shared.boundary.length)throw Error('Expected actual4 capsules / shared3 vanes+analytic hub with effective boundary');
  body.push(`<circle cx="${ox}" cy="${oy}" r="${11.3*scale}" fill="none" stroke="#a2aac3" stroke-dasharray="5 5"/>`);
  for(const c of legacy.capsules){const a=pt(c.a,r.mechanism,ox,oy),b=pt(c.b,r.mechanism,ox,oy);body.push(`<path d="M${a} L${b}" fill="none" stroke="#ffb67c" stroke-opacity=".5" stroke-width="${c.r*2*scale}" stroke-linecap="round"/>`);}
  for(const c of shared.components){if(c.shape==='circle'){const q=pt(c.centre,r.mechanism,ox,oy);body.push(`<circle cx="${q[0]}" cy="${q[1]}" r="${c.radius*scale}" fill="#63deed" fill-opacity=".25"/>`);}else body.push(`<polygon points="${c.points.map(p=>pt(p,r.mechanism,ox,oy).join(',')).join(' ')}" fill="#63deed" fill-opacity=".25"/>`);}
  for(const e of shared.boundary){const a=pt(e.a,r.mechanism,ox,oy),b=pt(e.b,r.mechanism,ox,oy),d=e.type==='arc'?`M${a} A${e.radius*scale},${e.radius*scale} 0 ${e.endAngle-e.startAngle>Math.PI?1:0} 1 ${b}`:`M${a} L${b}`;body.push(`<path d="${d}" fill="none" stroke="#63deed" stroke-width="1.5"/>`);}
  body.push(`<path d="M${ox-4},${oy}h8 M${ox},${oy-4}v8" stroke="white"/><text x="${left+24}" y="437" font-size="16" fill="#d0e1ed">共通中心／11px・内部1単位</text><text x="${left+24}" y="464" font-size="15" fill="#d0e1ed">丸hubと3羽根は同体回転（旧4枚は対照）</text>`);
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600" viewBox="0 0 1600 600"><rect width="1600" height="600" fill="#071421"/><g font-family="sans-serif"><text x="24" y="40" font-size="27" fill="white">風車：旧接触と共通輪郭の同倍率照合</text><text x="24" y="78" font-size="19" fill="#d0e1ed">橙＝旧4capsule　水色＝新3羽根＋真円hubの有効境界　破線R11.3＝旧回転包絡（非部材）</text>${body.join('')}<text x="24" y="525" font-size="18" fill="#d0e1ed">指定角による静的構造図です。実試射の時刻・球の軌跡・入賞結果ではありません。未知の外装は接触体に追加しません。</text><text x="24" y="563" font-size="18" fill="#d0e1ed">内部座標／実寸mm未校正。3羽根・丸hubの重なり内部辺は、新しい接触壁として表示しません。</text></g></svg>`;
}
export async function main(argv){
 const o={};for(let i=0;i<argv.length;i+=2){if(!argv[i]?.startsWith('--')||!argv[i+1])throw Error('Use --key value');o[argv[i].slice(2)]=argv[i+1];}if(!o.module||!o.out)throw Error('--module [actual shared API module] --out [freshdir] required');
 const modulePath=path.resolve(o.module),moduleBytes=await fs.readFile(modulePath),moduleSHA=sha(moduleBytes),api=await import(pathToFileURL(modulePath));if(typeof api.windmillContactGeometry!=='function')throw Error('Actual solver geometry getter missing');
 const records=[['0°',0],['初期角',.28],['45°',Math.PI/4],['90°',Math.PI/2]].map(([label,angle])=>{const mechanism={kind:'windmill',x:64,y:476.5,radius:10,angle,omega:0,armRadius:.8};return {label,angle,mechanism,legacy:api.windmillContactGeometry({...mechanism,shapeProfile:'legacy-capsules'}),shared:api.windmillContactGeometry({...mechanism,shapeProfile:'photo-three-vane'})};});
 const svg=overlaySVG(records),out=path.resolve(o.out);await fs.mkdir(out,{recursive:true});if((await fs.readdir(out)).length)throw Error('Fresh static output dir required');if(sha(await fs.readFile(modulePath))!==moduleSHA)throw Error('Module changed during read');
 await fs.writeFile(path.join(out,'actual-geometry.json'),JSON.stringify(records,null,2));await fs.writeFile(path.join(out,'overlay.svg'),svg);await fs.writeFile(path.join(out,'overlay.html'),`<!doctype html><meta charset="utf-8"><title>風車・構造照合</title><style>body{margin:0;background:#071421}svg{display:block;max-width:100%;height:auto}</style>${svg}`);
 await fs.writeFile(path.join(out,'receipt.json'),JSON.stringify({scope:'Static actual solver API geometry, no measurement/browser; pixel acceptance pending',module:{path:modulePath,sha256:moduleSHA},media:{path:fileURLToPath(import.meta.url),sha256:sha(await fs.readFile(fileURLToPath(import.meta.url)))},command:process.argv,svgSHA:sha(svg),angles:records.map(r=>r.angle)},null,2));console.log('S8_WHEEL_STATIC_OVERLAY_READY');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main(process.argv.slice(2));
