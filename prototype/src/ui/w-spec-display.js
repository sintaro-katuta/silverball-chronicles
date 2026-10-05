import {TOKYOGHOUL_W as W} from '../domain/tokyoghoul-w-spec.js';

// Display published categories independently; the combined hit rate is not
// the symbol-alignment rate and charge must not disappear from the UI.
export function wSpecRows(){
 return [
  ['図柄揃い・チャージ昇格',`合算 約1 / ${W.normal.symbolOdds}`],
  ['チャージ',`約1 / ${W.normal.chargeOdds} · ${W.normal.chargePayout}個`],
  ['図柄揃い払出',`${W.normal.symbolPayout.toLocaleString('ja-JP')}個`],
  ['RUSH',`${W.rush.draws}回 · 約1 / ${W.rush.odds}`],
  ['RUSH払出','3,000個以上'],
  ['プレイ料金','0枚'],
 ];
}
