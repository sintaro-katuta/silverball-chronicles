// Presentation snapshots only. No random numbers, prizes, or lottery decisions.
const STYLE_SKILLS = {
 assault: ['twin', 'split', 'salute', 'double', 'back', 'opening'],
 fortify: ['gold', 'large', 'pocket', 'grow', 'polish', 'combo', 'bonus', 'extend', 'after'],
 counter: ['return', 'bank', 'revive', 'last', 'wind'],
};

export function moonBuildStyle(skills = {}) {
 // Compare purchased levels, not percentages / ball counts with incompatible units.
 const scores = Object.entries(STYLE_SKILLS).map(([style, ids]) => [style,
  ids.reduce((sum, id) => sum + Math.max(0, Math.min(5, Number(skills[id]) || 0)), 0)]);
 const highest = Math.max(...scores.map(([, score]) => score));
 const leaders = scores.filter(([, score]) => score === highest);
 return highest > 0 && leaders.length === 1 ? leaders[0][0] : 'balanced';
}

export function moonOrigin(source = 'debug', mode = 'normal', input = {}) {
 input = input || {};
 const fallback = source === 'opening-skill' ? 'opening' : source === 'back-skill' ? 'normal'
  : source === 'debug' ? 'debug' : mode === 'rush' ? 'rush' : 'start';
 const kind = ['start', 'rush', 'normal', 'opening', 'debug'].includes(input.kind) ? input.kind : fallback;
 const origin = {kind, mark: ['plain', 'gold', 'large', 'echo'].includes(input.mark) ? input.mark : 'plain'};
 if (Number.isFinite(input.pocketId)) origin.pocketId = input.pocketId;
 if (Number.isFinite(input.x) && Number.isFinite(input.y)) {origin.x = input.x; origin.y = input.y;}
 return Object.freeze(origin);
}

export function moonBallOrigin(ball, kind, pocketId) {
 return moonOrigin(kind, kind === 'rush' ? 'rush' : 'normal', {kind, pocketId, x: ball.x, y: ball.y,
  mark: ball.gold ? 'gold' : ball.large ? 'large' : ball.extra || ball.after ? 'echo' : 'plain'});
}
