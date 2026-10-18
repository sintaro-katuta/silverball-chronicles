import {createRequire} from 'node:module';
const sharp=createRequire('/private/tmp/silverball-s8-20261016/prototype/package.json')('sharp');
import fs from 'node:fs/promises';
const out='/private/tmp/silverball-s8-20261016/prototype/reference-review/s8-20261016/route-clips/titles';await fs.mkdir(out,{recursive:true});
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
async function card(name,h,lines){const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="${h}"><rect width="1280" height="${h}" fill="#071421"/>${lines.map(([s,x,y,size,color='#ffffff'])=>`<text x="${x}" y="${y}" font-family="Hiragino Sans, sans-serif" font-size="${size}" fill="${color}">${escape(s)}</text>`).join('')}</svg>`;await fs.writeFile(`${out}/${name}.svg`,svg);await sharp(Buffer.from(svg)).png().toFile(`${out}/${name}.png`);}
for(const[name,title]of Object.entries({'ball-1':'道釘で動きが変わらずOUT：球1','ball1-wheel-close':'球1の風車付近を拡大（0.125倍）','ball-34':'通常の釘間を横切ってOUT：球34','ball-12':'大きい切れ目を横切ってOUT：球12','ball-7':'大きい切れ目から一般入賞へ：球7','ball-2':'ヘソ入賞に至った例：球2'}))await card(name,55,[[title,24,42,30]]);
await card('intro',1080,[['元配置250発の流れを確認',70,200,54],['ヘソ15 ／ 一般6 ／ OUT229',70,310,44],['OUT203球には、道釘の反発・押し戻しがない',70,440,36],['釘・風車・玉・物理の設定は変えていません。',70,530,30],['代表球の実座標を再生します。',70,690,30],['左：実際の盤面 ／ 右：細かい記録による計測図',70,750,30],['低速再生の倍率と実時刻を画面に表示しています。',70,810,28],['無音の観測資料 ／ 改善結果や原因確定の映像ではありません。',70,1000,23,'#b8ccd9']]);
await card('outro',1080,[['次の提案は1つ',70,190,54],['風車の羽根・中央部を、',70,330,42],['見た目と当たり判定で共通の形にする。',70,400,42],['今回の実装は観測だけ。形状変更・改善比較は未実施。',70,590,30],['入賞が増えるかは、変更前後の試射で確認が必要です。',70,670,30],['目標：750発でヘソ60回以上。各条件でも減らさない。',70,770,30],['記録：元配置250発＋45秒排出 ／ 2026-10-16',70,970,25,'#b8ccd9']]);
console.log('Created SVG titlecards and rendered PNGs');
