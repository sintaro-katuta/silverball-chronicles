# PixiJS移行準備（素材判断待ち）

2026-09-29。ユーザーは素材を持ち帰って検討する。最終目標は全面ドット絵／PixiJSの描画統一。現在の折衷表示は比較用として保持し、今回その色・形・素材・書体は変更しない。クラウド更新なし。

## 今回実施したこと

1. `src/runtime/frame-loop.js` を導入し、遊技更新の起点を `machine.app.on('update')` からブラウザのフレームへ分離。ゲーム画面の開始／終了で一つのループを所有し、終了時は予約フレームを解除する。PixiJSへの交換後も同じ更新起点を使える。
2. 既存 `frame()` 内の120Hz物理、dt上限50ms、最大24ステップ、発射制御、イベント処理、停止条件は維持。Game/Physics/保存・抽選・出玉計算を変更していない。
3. `MACHINE_VIEW` を `src/machine-layout.js` へ分離。mainから座標だけを使う場合にPlayCanvasのsceneモジュールを経由しない。旧sceneのexportは既存検証ツールの互換性のため残す。
4. 物理↔表示座標の相互変換を用意し、従前PlayCanvasの投影との一致を5個体でテスト。
5. 旧3コースとフロア5個体の釘・球路・入賞口・風車、通常／RUSH／大当り／ラウンド間の扉端点を `physical-baseline.json` に保存。新レンダラーと位置合わせするための比較基準。旧3コースを今後の新仕様として採用する意味ではない。
6. 素材の棚卸し。[素材検討一覧](ASSET_LIST.md)、[画像55件の詳細](IMAGE_FILES.md)、[画像閲覧ページ](materials/index.html)。画像を変更せず持ち帰り用に複製した。

## 次の描画実装が守る境界

| 所有者 | 所有するもの | 描画移行時の扱い |
|---|---|---|
| Game / physics / shot-control | 抽選結果、保留、賞球、玉座標、釘、入賞判定、扉の接触線 | 再利用。描画側で再抽選・丸め・物理更新しない |
| main / frame-loop | 入力、120Hzステップ、イベントの取り出し、保存、一時停止 | 一つの更新元。PixiのTickerから二重にtickしない |
| machine-layout | 現行の盤面540×880、液晶矩形、物理原点との関係 | 素材寸法と独立。描画だけピクセルへ丸めても物理座標を書き換えない |
| Machine描画アダプター | mount(host), render(game), resize(), diagnostics(), dispose() | 次にPixiJSで置換する対象。現在はPlayCanvas版を使用 |
| cinematic / reels / moon-mechanism-state | 時刻と結果に基づく表示状態 | 再利用候補。game.time／presentation.timeを参照し、画像再生時間で当落を決めない |
| sound / profile persistence | 効果音、保存キーtsukikage-profile-v1、チケット | 維持。デバッグ再生と本番報酬を混ぜない |

## 残る移行作業（今回の準備で完了扱いにしない）

- 実際のPixiJS遊技描画、筐体・玉・機構・液晶・演出文字・HUD・メニューの交換。
- 読み込みがまだ `Machine.create` のGLB／`glyphData`／`TitleSculpture` に依存する。素材が決まったら、起動前ロードをアセットマニフェストと描画アダプターのprepareへ置き換える。
- 現在のMachine.renderはGame/Physicsを直接読む。将来は必要な表示情報を明示するが、未告知の当落・ラウンド数を新UIへ漏らさない。
- `parts.html` の部品プレビューは独立した既存PlayCanvasループを使用する。今回の遊技ループ分離の対象外。
- DOM/Canvas戦闘、PixiJSフロア、PlayCanvas遊技の各層がまだ共存。PlayCanvas依存削除や全画面移行完了は未実施。
- ピクセル解像度、パレット、書体、アニメ枚数、シート分割、同時デコード数とメモリ目標は素材検討後に決める。現時点で勝手に固定しない。
- ステージ廃止・新しいコース進行は別作業。描画移行に同梱しない。

## 検証

- `npm test`：148件成功（既存144件＋今回追加4件）。

- コード変更前に現在の通常画面を新規撮影。変更後の390×844の全画面PNGと盤面PNGが、それぞれファイルSHA-1で完全一致。
  - 全画面：`f5b6cf0b0c1577d6084e010dfb97fedacfca79bc`
  - 盤面：`fd0043d2765be4d16853a4f985f951580d6d9cf9`
- `migration-prep/verify.mjs`：実球の発射・入賞／アウト、ポーズ／再開、4サイズの盤面と液晶位置、リーチ→4R大当り、アタッカー開放、RUSHを今回のコードで確認。エラー／失敗リクエスト0。結果 `verification.json`。
- `tests/migration-prep.test.js`：フレームの停止・再開・破棄中の再予約防止、座標往復、5個体の投影一致、保存した8配置と4機構状態を検証。
- `migration-prep/lifecycle.mjs`：精算→フロア復帰→再プレイで時計の二重更新なし。素材閲覧ページ55件の表示・検索・元画像読み込みも確認。実行時エラー0。
- 本番ビルド成功。既存の大きいchunk・node worker外部化の警告は継続。
- 音の実聴・スマートフォン実機の負荷・全演出分岐は今回未検証。PixiJS版の性能はまだ計測できる段階ではない。

## 再現コマンド

`prototype/` で `npm test`、`npm run build`。ローカルdevサーバーを起動したうえで `node migration-prep/verify.mjs`。

`node tools/migration-inventory.mjs` は現存画像を収集し、寸法・SHA-256・用途を出力し、物理比較基準も更新する。物理仕様を変更していない移行作業では、比較基準を無条件に更新して差分を消さないこと。
