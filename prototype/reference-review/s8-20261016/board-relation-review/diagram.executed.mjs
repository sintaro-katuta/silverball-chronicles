import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const root='/private/tmp/silverball-s8-20261016';
const {createBoardFlow}=await import(root+'/prototype/src/pixi/board-flow.js');
const {hesoTrayShapes}=await import(root+'/prototype/src/pixi/heso-guide.js');
const require=createRequire(root+'/prototype/package.json');const sharp=require('sharp');
const p=createBoardFlow({lcd:true,normalPower:.18}).flow.physics;
const out=root+'/prototype/reference-review/s8-20261016/board-relation-review';
let s=`<svg xmlns="http://www.w3.org/2000/svg" width="1520" height="1040" viewBox="0 0 1520 1040"><defs><style>text{font-family:'Hiragino Sans','Noto Sans CJK JP',sans-serif;fill:#243446}.title{font-size:29px;font-weight:700}.sub{font-size:18px}.label{font-size:17px}.small{font-size:14px}.number{font-size:13px}</style></defs><rect width="1520" height="1040" fill="#f6f8fa"/>`;
const text=(x,y,t,cls='label',fill)=>{s+=`<text x="${x}" y="${y}" class="${cls}"${fill?` style="fill:${fill}"`:''}>${t}</text>`;};
const line=(x,y,a,b,color='#708398',dash='')=>{s+=`<line x1="${x}" y1="${y}" x2="${a}" y2="${b}" stroke="${color}" stroke-width="1.4"${dash?' stroke-dasharray="'+dash+'"':''}/>`;};
text(36,46,'釘・風車・道・ヘソの位置関係を読む','title');text(36,79,'元図転記データと現モデルの接触形状から作成した位置図。値は内部座標で、実測mmではありません。','sub');
s+='<rect x="28" y="104" width="540" height="656" rx="12" fill="white" stroke="#cbd5df"/><rect x="588" y="104" width="904" height="656" rx="12" fill="white" stroke="#cbd5df"/>';
text(48,139,'① 寄り釘 → 風車 → 道の入口','title');text(48,171,'位置を単独で動かす前に、入る側と出る側を照合','small');
const a={x:54,y:198,scale:2.12,sx:80,sy:550};const b={x:616,y:214,scale:3.2,sx:280,sy:780};
const source=q=>({x:(q.x+14)*2,y:(q.y-120)*2});
const point=(q,k)=>{const z=source(q);return {x:k.x+(z.x-k.sx)*k.scale,y:k.y+(z.y-k.sy)*k.scale};};
const circle=(x,y,r,fill,stroke,width=1,dash='')=>{s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${dash?' stroke-dasharray="'+dash+'"':''}/>`;};
const pin=(q,k,labeled=false)=>{const z=point(q,k);circle(z.x,z.y,q.r*2*k.scale,'#164d74','#164d74');circle(z.x,z.y,2.8,'none','#164d74');if(labeled)text(z.x+6,z.y-4,String(q.id),'number');};
for(const q of p.pins){const src=source(q);if((q.id<=6||q.id>=37&&q.id<=63)&&src.x>=80&&src.x<=242&&src.y>=550&&src.y<=788)pin(q,a,[1,2,3,6,56,58,63].includes(q.id));}
const m=p.mechanisms[0],z=point(m,a);circle(z.x,z.y,(m.radius+1.3)*2*a.scale,'#fef5e7','#ba7723',1,'5 4');circle(z.x,z.y,m.radius*2*a.scale,'none','#b37a2b',1.5);circle(z.x,z.y,3,'#b37a2b','#b37a2b');
for(let i=0;i<4;i++){const t=.28+i*Math.PI/2;line(z.x,z.y,z.x+Math.cos(t)*m.radius*2*a.scale,z.y+Math.sin(t)*m.radius*2*a.scale,'#b37a2b');}
text(305,535,'風車の中心','label');text(305,561,'(64, 476.5)','small');text(305,589,'腕の長さ 10','small');text(305,614,'破線：現接触の回転包絡','small');
const one=p.pins.find(q=>q.id===1),oz=point(one,a);line(z.x,z.y,oz.x,oz.y,'#397d62','3 3');text(50,710,'風車 → 道の最初の釘：右8.5 / 下11.5','label');text(50,737,'風車の出口と、この最初の釘が一組の受渡し部','small');
text(610,139,'② 道の末端 → 手前の釘 → ヘソ','title');text(610,171,'青：原座標の釘　赤：現モデルの追加受け皿','small');
for(const q of p.pins){const src=source(q);if(src.x>=280&&src.x<=500&&src.y>=780&&src.y<=906)pin(q,b,[19,20,21,22,23,24,25,26,88,89,90,91,92,93].includes(q.id));}
const mouth=p.pockets.find(q=>q.kind==='start');for(const shape of hesoTrayShapes(mouth)){const pts=shape.map(q=>{const z=point(q,b);return z.x+','+z.y;}).join(' ');s+=`<polygon points="${pts}" fill="#e16b5b" fill-opacity=".30" stroke="#bd4537" stroke-width="2"/>`;}
for(const id of [25,26,90]){const z=point(p.pins.find(q=>q.id===id),b);circle(z.x,z.y,8,'none','#b8342f',2);}
const mz=point(mouth,b);line(mz.x-mouth.w*b.scale,mz.y,mz.x+mouth.w*b.scale,mz.y,'#8b5221');text(1080,615,'ヘソ入口','small');
text(612,692,'道末端26 → 手前90 → 命釘91/92','label');text(612,720,'末端は単なる下り坂ではなく、高さと横距離のある受渡し','small');text(612,747,'現追加皿の輪郭内に25・26・90。元図との構造差を要確認','small');
s+='<rect x="28" y="784" width="1464" height="224" rx="12" fill="white" stroke="#cbd5df"/>';
text(48,821,'③ 通常の連釘と、大きな切れ目を区別する','title');
text(50,858,'現モデルの玉の直径：3.60','label');text(50,889,'通常23組の釘表面間：3.63〜4.41','label');text(50,920,'全23組で、静的な隙間は玉径を上回る','label');text(50,951,'中心位置の一致だけで「連釘を渡る働き」の一致とは言えない','small');
text(795,858,'大きな切れ目は2か所：10→11、22→23','label');text(795,889,'釘表面間：10.24 / 8.88（通常間隔と明確に異なる）','label');text(795,920,'下段の釘・一般入賞・OUTへの分岐として読む仮説','label');text(795,951,'実機の寸法・設計者の意図・動的な通球は、この図だけでは未確定','small');
text(36,1032,'コードの静的幾何の読取りです。新しい配置変更・試射・本編反映はしていません。','small');s+='</svg>';
await writeFile(out+'/relations.svg',s);await sharp(Buffer.from(s)).png().toFile(out+'/relations.png');
const records=p.pins.filter(q=>q.role==='michi'&&q.id<=26).slice(1).map(q=>{const prev=p.pins.find(t=>t.id===q.id-1),pitch=Math.hypot(q.x-prev.x,q.y-prev.y);return {from:prev.id,to:q.id,pitch,shaftGap:pitch-prev.r-q.r,shaftGapMinusBall:pitch-prev.r-q.r-3.6};});
await writeFile(out+'/geometry.json',JSON.stringify({scope:'Read-only static coordinates. New trials=0. Geometry is not dynamic or manufacturer intent evidence.',ballDiameter:3.6,pinRadius:.2,windmill:m,roadPairs:records,svgSHA:createHash('sha256').update(s).digest('hex')},null,2)+'\n');console.log('Saved own vector geometry diagram and computed distances');
