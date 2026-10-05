// Compact report of actual-controller sampled descriptors. Rendering evidence
// remains separate. Counts are unique per resolved draw and per signal label.
import {readFile,writeFile} from 'node:fs/promises';
import {MOON_CUES} from '../src/pixi/moon-cue.js';
const path=process.argv[2];if(!path)throw Error('Pass a controller-check.json path');
const data=JSON.parse(await readFile(path,'utf8'));
const pct=n=>(100*n).toFixed(2)+'%';
const row=(table,key)=>{const c=table[key];return c?`${c.wins}/${c.seen} (${pct(c.reliability)}; 95% CI ${c.interval95.map(pct).join('–')})`:'未出現';};
let out=`## 修正後の長期制御検証（seed ${data.seed}）\n\n`;
out+=`受理 ${data.counters.accepted.toLocaleString()}／開始 ${data.counters.started.toLocaleString()}／解決 ${data.counters.resolved.toLocaleString()}。FIFO ${data.counters.fifoChecks.toLocaleString()}、保存roll ${data.counters.rollChecks.toLocaleString()}、停止検査 ${data.counters.pauseChecks}、保留予告変更 ${data.counters.queueCueChanges}、不変条件違反 ${data.violations.length}。仮想 ${(data.virtualSeconds/3600).toFixed(2)} 時間、実行 ${data.wallSeconds.toFixed(1)} 秒。\n\n`;
out+=`チャージ ${data.excluded.charge}／保証 ${data.excluded.guaranteed}／記録odds変更 ${data.excluded.changedPrior} を標準母数から除外。保証移行後の旧95.3記録は標準母数へ含める。制御した入賞callback・通常一様乱数を使い、当落・ルートの強制指定はない。\n\n`;
out+='| 表示された信号 | 通常 当選/出現 | 標準RUSH 当選/出現 |\n|---|---|---|\n';
for(const key of ['route:ordinary','route:basic','battle:exchange','battle:initiative','battle:pressure','route:direct','route:flash','hold:blue','hold:red','hold:gold','revival:revealed','premium:moon','premium:sword','premium:fullrotation'])out+=`| ${key} | ${row(data.tables.normal,key)} | ${row(data.tables.rush,key)} |\n`;
out+='\n| 月の実表示信号 | 設計信頼度 | 通常 当選/出現 | 標準RUSH 当選/出現 |\n|---|---|---|---|\n';
for(const cue of MOON_CUES){const key=`moon:${cue.phase}:${cue.color}`;out+=`| ${cue.phase}/${cue.color} | ${cue.expectation}% | ${row(data.tables.normal,key)} | ${row(data.tables.rush,key)} |\n`;}
out+='\n変動前予告はfamily単位、発展予告は色単位で集約（それぞれ1記録に1family/1色）。以下は当選/出現。\n\n';
for(const mode of ['normal','rush']){
 out+=`${mode}: `;
 const groups={};for(const [key,c] of Object.entries(data.tables[mode])){
  const parts=key.split(':'),group=parts[0]==='before'?`before:${parts[1]}`:parts[0]==='development'?`development:${parts[2]}`:null;if(!group)continue;
  const g=groups[group]??={seen:0,wins:0};g.seen+=c.seen;g.wins+=c.wins;
 }
 out+=Object.entries(groups).map(([key,g])=>`${key} ${g.wins}/${g.seen}`).join('、')+'。\n\n';
}
for(const mode of ['normal','rush']){const r=data.repeats[mode];out+=`${mode}の連続battle同variant ${r.repeats}/${Math.max(0,r.battles-1)} (${pct(r.repeats/Math.max(1,r.battles-1))})。`;}
out+='\n\n';
out+=`獲得経路: 通常大当たり ${data.counters.normalJackpots}／チャージ ${data.counters.chargeBonuses}／RUSH個別獲得 ${data.counters.rushBonuses}／V入賞 ${data.counters.vEntries}。払出帳簿は全stepで整合。獲得数は制御入賞callbackで到達した数であり、自然な球軌道の獲得性能を示さない。\n\n`;
out+=`プレミア早期漏れ検査 ${data.counters.premiumLeakChecks.toLocaleString()}、復活早期漏れ検査 ${data.counters.revivalLeakChecks.toLocaleString()}。これらと予告信頼度はheadlessのpose/descriptor可視判定で、画面の画像を全件評価した意味ではない。rareSamplesに赤/金外れ例のdrawId・保存roll・表示ラベルを記録。希少信号の母数は小さく、観測100%を確定演出へ変更する根拠にしない。\n\n`;
out+=`読込開始から終了まで変更されたファイル: ${data.changedFiles.length?data.changedFiles.join('、'):'なし'}。開始時のmodule snapshotを使用し、画面の並行更新は別の画像/動画検証へ分ける。\n`;
await writeFile(path.replace('controller-check.json','summary.md'),out);console.log(out);
