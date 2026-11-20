// The last completed real play on each machine, stored separately from tickets.
export const SLUMP_KEY='tsukikage-floor-slump-v1';
export function slumpRecord(game){
 const points=[...game.balanceHistory,{time:game.time,value:game.stock-game.initial}]
  .filter(p=>Number.isFinite(p.time)&&p.time>=0&&Number.isFinite(p.value));
 return {points:points.slice(-1801)};
}
export function validSlump(record){
 return Array.isArray(record?.points)&&record.points.length>0&&record.points.length<=1801&&record.points.every((p,i,a)=>Number.isFinite(p.time)&&p.time>=0&&Number.isFinite(p.value)&&(i===0||p.time>=a[i-1].time));
}
const signed=n=>`${n>0?'+':''}${Math.round(n).toLocaleString('ja-JP')}`;
export function slumpMarkup(record){
 if(!validSlump(record))return '<div class="slump-empty">まだ遊技データがありません</div><p class="slump-note">この台の遊技を終えると、直近の差玉を表示します。</p>';
 const points=record.points,end=points.at(-1),duration=Math.max(1,end.time),values=points.map(p=>p.value),limit=Math.max(10,...values.map(Math.abs)),x=t=>45+t/duration*291,y=v=>15+(limit-v)/(2*limit)*120;
 const path=points.map((p,i)=>`${i?'L':'M'}${x(p.time).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
 const minutes=Math.floor(end.time/60),seconds=Math.floor(end.time%60);
 return `<div class="slump-current"><span>直近の遊技</span><strong>${signed(end.value)}<small> 玉</small></strong></div><svg class="slump-chart" viewBox="0 0 350 164" role="img" aria-label="直近の遊技の差玉推移、最終 ${signed(end.value)} 玉"><path class="slump-grid" d="M45 15H336 M45 75H336 M45 135H336"/><path class="slump-line" d="${path}"/><circle cx="${x(end.time).toFixed(1)}" cy="${y(end.value).toFixed(1)}" r="3" fill="#ffe38c"/><g><text x="39" y="19" text-anchor="end">${signed(limit)}</text><text x="39" y="79" text-anchor="end">0</text><text x="39" y="139" text-anchor="end">${signed(-limit)}</text><text x="45" y="157">開始</text><text x="336" y="157" text-anchor="end">${minutes}分${String(seconds).padStart(2,'0')}秒</text></g></svg><p class="slump-note">差玉＝持ち玉 − 開始時の持ち玉。直近1回の遊技を表示しています。</p>`;
}
export async function readSlump(preferences,id){try{const raw=(await preferences.get({key:SLUMP_KEY})).value;const data=raw?JSON.parse(raw):{};return validSlump(data[id])?data[id]:null;}catch{return null;}}
export async function writeSlump(preferences,id,game){
 const raw=(await preferences.get({key:SLUMP_KEY})).value;let data={};try{data=raw?JSON.parse(raw):{};}catch{};
 if(!data||typeof data!=='object'||Array.isArray(data))data={};data[id]=slumpRecord(game);
 await preferences.set({key:SLUMP_KEY,value:JSON.stringify(data)});
}
