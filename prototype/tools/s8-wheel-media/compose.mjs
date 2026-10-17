import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
const root=process.cwd(),base=path.resolve('prototype/reference-review/s8-20261016/wheel-shape'),out=path.join(base,'composition');await fs.mkdir(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
function svg(lines,height=1080){return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="${height}"><rect width="1280" height="${height}" fill="#071421"/>${lines.map(([s,y,size=30,color='#e5f1fa'])=>`<text x="30" y="${y}" font-family="sans-serif" font-size="${size}" fill="${color}">${esc(s)}</text>`).join('')}</svg>`;}
const cards={
 'strip-whole':svg([['実記録0〜15秒・全景／1倍・同時刻比較（画面の計数はその時刻）',28,24]],40),
 'strip-near':svg([['同じ実記録0〜15秒を近接で再掲／1倍・左右同倍率',28,24]],40),
 'strip-ball38':svg([['実記録22.5〜28秒／終点が違う最小ID38・一接触の因果は断定しません',28,23]],40),
 results:svg([
 ['3枚羽根と丸い中央：形状修正の試作結果',65,36,'#fff'],
 ['同じ開始条件0／各250発停止＋45秒排出の全結果',130,29],
 ['　　　　　　　　　変更前　　　　　　修正案',220,30],
 ['実発射　　　　　　　250　　　　　　　 250',290],
 ['ヘソ入賞　　　　　　 13　　　　　　　　 9',350],
 ['一般入賞　　　　　　　3　　　　　　　　 4',410],
 ['OUT　　　　　　　　 234　　　　　　　 237',470],
 ['返却・残球・滞留・液晶侵入4区分：両側すべて0',550,28],
 ['最長無ヘソ：30.93 → 70.19秒（発射中152.916秒の観測）',615,27],
 ['ヘソが減少したため、性能改善として不採用。追加3条件なし。',700,29,'#ffcfab'],
 ['目標の3条件750発・ヘソ60以上と各条件非悪化は未達。',750,27],
 ['元101釘・左上狙い・風車中心・球・レール・係数は固定。',825,25],
 ['両側とも受けガイド・取付板なし。旧ガイド付き15/250は別履歴。',870,24],
 ['3羽根＋真円hubは共通接触形状。前面円盤は表示のみ・全面壁ではありません。',925,23],
 ['写真と同型・実寸・奥行の完全再現は未確認。本編の既定は切り替えていません。',978,23],
 ['無音の保存座標リプレイ資料／新しい音声・追加試射なし',1035,23]
 ])};
cards.results=cards.results.replace(/<text x="30" y="(220|290|350|410|470)"[^>]*>.*?<\/text>/g,'').replace('</svg>',[['比較',220,30],['実発射',290,30],['ヘソ入賞',350,30],['一般入賞',410,30],['OUT',470,30]].map(([v,y,size])=>`<text x="30" y="${y}" font-family="sans-serif" font-size="${size}" fill="#e5f1fa">${v}</text>`).join('')+[['変更前',220,450],['修正案',220,840],['250',290,450],['250',290,840],['13',350,450],['9',350,840],['3',410,450],['4',410,840],['234',470,450],['237',470,840]].map(([v,y,x])=>`<text x="${x}" y="${y}" font-family="sans-serif" font-size="30" fill="#e5f1fa">${v}</text>`).join('')+'</svg>');
for(const[name,s]of Object.entries(cards)){await fs.writeFile(path.join(out,name+'.svg'),s);await sharp(Buffer.from(s)).png().toFile(path.join(out,name+'.png'));}
const segments=[['whole',15],['near',15],['ball38',5.5]];const inputs=[];
for(const[name,duration]of segments){const input=path.join(base,'clip-'+name,name+'.mp4'),verification=JSON.parse(await fs.readFile(path.join(base,'clip-'+name,'verification.json')));if(!verification.success)throw Error('Unverified clip');inputs.push({file:input,sha256:hash(await fs.readFile(input)),duration,receipt:hash(await fs.readFile(path.join(base,'clip-'+name,'verification.json')))});const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-i',input,'-i',path.join(out,'strip-'+name+'.png'),'-filter_complex','[0:v][1:v]overlay=0:84:format=auto','-an','-c:v','libx264','-crf','21','-preset','veryfast','-pix_fmt','yuv420p','-r','30','-y',path.join(out,name+'.mp4')],{stdio:'inherit'});if(r.status)throw Error('Segment encode failed');}
let r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-loop','1','-i',path.join(out,'results.png'),'-t','10','-r','30','-an','-c:v','libx264','-crf','21','-preset','veryfast','-pix_fmt','yuv420p','-y',path.join(out,'results.mp4')],{stdio:'inherit'});if(r.status)throw Error('Result card encode failed');
await fs.writeFile(path.join(out,'concat.txt'),['whole','near','ball38','results'].map(n=>`file '${path.join(out,n+'.mp4')}'`).join('\n'));
r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',path.join(out,'concat.txt'),'-c','copy','-movflags','+faststart','-y',path.join(base,'comparison.mp4')],{stdio:'inherit'});if(r.status)throw Error('Concat failed');
const b=await fs.readFile(path.join(base,'comparison.mp4'));await fs.writeFile(path.join(out,'receipt.json'),JSON.stringify({success:true,inputs,output:{file:path.join(base,'comparison.mp4'),sha256:hash(b),bytes:b.length},sourceSHA:'25f905a27cf6efb2fe3ff43732cad40e18e76e7b53e391acd3d6eccb741e980c',segments:[{whole:'0..15s',speed:1},{near:'0..15s replay',speed:1},{ball38:'22.5..28s',speed:1,reason:'Minimum actual outcome difference ID; not single-contact causality'},{results:'Full250 shots plus45s drain',duration:10}],editing:'Only annotation strip y84..124 replaced. Game/time/counters unchanged; no interpolation/recalculation.',script:{path:'prototype/tools/s8-wheel-media/compose.mjs',sha256:hash(await fs.readFile(new URL(import.meta.url)))},cards:Object.keys(cards).map(n=>({name:n,sha256:hash(Buffer.from(cards[n]))})),nativePlayback:'PM pending'},null,2));
console.log('COMPOSITION_DONE',b.length,hash(b));
