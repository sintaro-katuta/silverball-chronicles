import { readFileSync, writeFileSync } from 'node:fs';

const snapshot = JSON.parse(readFileSync('data/steam-playtime.json', 'utf8'));
const classification = JSON.parse(readFileSync('data/game-genre-classification.json', 'utf8'));
const positions = {
  shooter: [190, 220], survival: [510, 120], simulation: [760, 105],
  rpg: [985, 125], rogue: [475, 335], factory: [665, 335], other: [900, 330],
};
const names = {
  shooter: 'FPS・TPS', survival: 'サバイバル<br/>クラフト',
  simulation: 'シミュレー<br/>ション', factory: '工場・<br/>自動化',
  rogue: 'ローグライク<br/>ローグライト', rpg: 'アクション<br/>RPG', other: 'その他',
};
const seen = new Set();
const groups = classification.groups.map(group => {
  for (const appid of group.appIds) {
    if (seen.has(appid)) throw new Error(`Duplicate genre assignment: ${appid}`);
    seen.add(appid);
  }
  return { ...group, minutes: snapshot.games.filter(game => group.appIds.includes(game.appid)).reduce((total, game) => total + game.minutes, 0) };
});
if (snapshot.games.some(game => !seen.has(game.appid) && !classification.excludedAppIds.includes(game.appid))) {
  throw new Error('Some games are neither classified nor excluded');
}
const maximum = Math.max(...groups.map(group => group.minutes));
const circles = groups.map(group => {
  const diameter = 360 * Math.sqrt(group.minutes / maximum);
  const [x, y] = positions[group.id];
  const fontSize = group.id === 'shooter' ? 38 : group.id === 'rogue' ? 17 : diameter < 140 ? 20 : 25;
  return `<div class="genre-bubble" style="left:${(x - diameter / 2).toFixed(2)}px;top:${(y - diameter / 2).toFixed(2)}px;width:${diameter.toFixed(2)}px;height:${diameter.toFixed(2)}px;background:${group.color};font-size:${fontSize}px" aria-label="${group.label.replaceAll('\n', '・')}：累計約${Math.round(group.minutes / 60)}時間"><span>${names[group.id]}</span></div>`;
});
const chart = `<div class="genre-bubbles" role="img" aria-label="ジャンル別の累計プレイ時間。円の面積が時間に比例し、FPS・TPSが最も大きい。">\n${circles.join('\n')}\n</div>`;
const source = readFileSync('slides.md', 'utf8');
const chartPattern = /<div class="genre-bubbles"[\s\S]*?\n<\/div>/;
if (!chartPattern.test(source)) throw new Error('Genre chart is missing');
writeFileSync('slides.md', source.replace(chartPattern, () => chart));
console.log('ジャンル別の円を更新しました（面積∝累計分）。');
