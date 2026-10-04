import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {GAME_IMAGES,GUARDIAN_ART} from '../src/assets.js';
import {SCENES,PATTERNS,imagePath} from '../src/reach-scenes.js';
import {Physics,BALL_RADIUS,LAUNCHER} from '../src/physics.js';
import {FLOOR_ONE} from '../src/floor-catalog.js';
import {MACHINE_VIEW} from '../src/machine-layout.js';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'migration-prep/materials');
const docsRoot=fileURLToPath(new URL('../../docs/prototype/',import.meta.url));
await mkdir(path.join(docsRoot,'migration-prep'),{recursive:true});
await mkdir(path.join(out,'images'),{recursive:true});
const entries=[...GAME_IMAGES.map(url=>({url,status:'使用中'})),{url:'/machines/moonlit-pachinko.png',status:'使用中'},{url:'/moon-guardian.png',status:'旧原画・参照用'},{url:'/machines/moonlit-pachinko-frame.png',status:'使用停止・参照用'}];
function purpose(url){
 if(url===GUARDIAN_ART)return '通常液晶・人物カットイン（現行のドット絵調案／採用判断は保留）';
 if(url==='/eclipse-battle.png')return '戦闘のフォールバック原画';
 if(url==='/moon-guardian.png')return '守護者の旧原画・人物と世界観の参考';
 if(url.includes('-frame.png'))return '遊技画面の重ね枠・現在は未使用';
 if(url.includes('/machines/'))return 'フロア一覧・機種詳細で共用。現行は96×120へ縮小表示';
 const scene=SCENES.find(s=>PATTERNS.some(p=>imagePath(s.id,p.id)===url));
 const pattern=PATTERNS.find(p=>imagePath(scene?.id,p.id)===url);
 return `${scene.name}／${pattern.name}${url.includes('moon-awakening')?'（RUSH背景にも使用）':url.includes('eclipse-victory')?'（BONUS背景にも使用）':''}`;
}
const catalog=[];
for(const [index,entry] of entries.entries()){
 const file=path.join(root,'public',entry.url),bytes=await readFile(file);
 if(bytes.readUInt32BE(0)!==0x89504e47)throw new Error(`Not PNG: ${entry.url}`);
 const name=entry.url.slice(1).replaceAll('/','__');await copyFile(file,path.join(out,'images',name));
 catalog.push({id:`IMG-${String(index+1).padStart(3,'0')}`,...entry,purpose:purpose(entry.url),width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),preview:`images/${name}`,decision:'未検討'});
}
await writeFile(path.join(out,'inventory.json'),JSON.stringify(catalog,null,2)+'\n');
const rows=catalog.map(e=>`| ${e.id} | [${e.url}](${path.relative(path.join(docsRoot,'migration-prep'),path.join(root,'public',e.url))}) | ${e.purpose} | ${e.width}×${e.height} | ${e.status} | 未検討 |`).join('\n');
await writeFile(path.join(docsRoot,'migration-prep/IMAGE_FILES.md'),`# 画像ファイル一覧\n\n${catalog.length}件。使用中${catalog.filter(x=>x.status==='使用中').length}件、旧／使用停止2件。寸法は現在のファイル寸法であり、新素材の推奨寸法ではありません。\n\n| ID | 原本 | 用途 | 現寸法 | 現状 | 判断欄 |\n|---|---|---|---|---|---|\n${rows}\n`);
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
await writeFile(path.join(out,'index.html'),`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>月影機関・素材検討一覧</title><style>body{background:#111923;color:#edf1f5;font:16px/1.6 system-ui;margin:24px}h1{font-size:24px}input{padding:10px;width:min(90%,600px);margin:10px 0 24px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px}article{background:#1e2b3b;padding:14px}img{width:100%;height:250px;object-fit:contain;background:#0b1119}small{color:#b5c5d7}a{color:#9fceff}article[hidden]{display:none}</style><h1>月影機関・素材検討一覧</h1><p>全${catalog.length}画像。絵柄・解像度・差分枚数は未決定。既存画像を変更せず収録しています。<br>画像をクリックすると原寸で開きます。画像以外の必要素材は <a href="../../../docs/prototype/migration-prep/materials/ASSET_LIST.md">ASSET_LIST.md</a> を参照してください。</p><input id="search" placeholder="用途・シーン名・ファイル名で絞り込み" aria-label="素材を絞り込み"><main>${catalog.map(e=>`<article><a href="${e.preview}"><img loading="lazy" src="${e.preview}" alt="${escape(e.purpose)}"></a><h2>${e.id}</h2><p>${escape(e.purpose)}</p><small>${e.url}<br>${e.width}×${e.height}・${(e.bytes/1048576).toFixed(2)} MiB<br>${e.status}</small></article>`).join('')}</main><script>document.querySelector('#search').oninput=e=>document.querySelectorAll('article').forEach(a=>a.hidden=!a.textContent.toLowerCase().includes(e.target.value.toLowerCase()));</script></html>`);
const layouts=[];
for(const item of [...Array.from({length:3},(_,course)=>({id:`legacy-course-${course}`,course,pegSeed:0})),...FLOOR_ONE.filter(x=>x.kind==='main').map(x=>({id:x.id,course:0,pegSeed:x.pegSeed}))]){
 const p=new Physics(item.course,item.pegSeed),states={};
 for(const [name,game] of Object.entries({normal:{},rush:{rush:{}},bonus:{jackpot:{gap:0,count:0}},bonusGap:{jackpot:{gap:1,count:0}}})){
  p.updateGate(game);states[name]=structuredClone({gate:p.gate,rightChucker:p.rightChucker});
 }
 layouts.push({...item,pins:p.pins,colliders:p.colliders,pockets:p.pockets,mechanisms:p.mechanisms,outlet:p.outlet,returnOutlet:p.returnOutlet,states});
}
await writeFile(path.join(root,'migration-prep/physical-baseline.json'),JSON.stringify({view:MACHINE_VIEW,ballRadius:BALL_RADIUS,launcher:LAUNCHER,layouts},null,2)+'\n');
console.log(JSON.stringify({images:catalog.length,active:catalog.filter(x=>x.status==='使用中').length,totalMiB:catalog.reduce((s,x)=>s+x.bytes,0)/1048576,layouts:layouts.length}));
