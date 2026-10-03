# 2026-10-03 左接触・液晶配置：統括確認

今回の最終対象は source-sha256.txt の11製品ファイル。最終録画・root関連試験・build後に全hash一致を確認。クラウド送信、SE、保存追加なし。

## 修正内容と原因範囲

- pair分離後にsegmentだけを再解決し、pinを再解決していなかった。既存101釘への共通resolvePinsを後段からも使用。高速1万unit/sの接触、実釘2球の意図配置、自然高密度を別々に検証。自然通常.2/.24/.28の短い比較は旧処理も侵入0、高密度.24/.05だけ旧後pin処理無効で2件→最終0。これを全ての見える重なりの原因とは断定しない。
- 後方発射planeの玉を描画背面へ置く。球素材・径・tint・alphaを変更せず、front釘を非接触で通過する既存別planeが前面を通ったように見える問題を改善。実機奥行きの認定ではない。
- 追加.25自然60秒＋排出30秒で1球残る条件を発見。釘近傍でなく、既存normal-rimの2端capが球の通れる隙間を閉じていた。一般口のみ壁深さ+5→約+1.38へ、既存spriteサイズ/anchor/前面cutに合わせた共有policyで変更。球1.8・釘軸.2・口中心幅とstart/fuzu壁を維持。実機壁深さは未測定。停止位置の物理球と自然.25の回帰を追加。
- active/queue保留描画を右22logical pxへ。最大5queue＋activeの移動bbox/帯がLCDpolygon内にあることを検証。通常図柄中心63、RUSH65.5へ、777の配置と拡大支点・陰影も同期。背景/人物/抽選/保留容量を維持。

## 最終検証

root-final-targeted.log: 最終rim修正後の接触、入賞口、自然排出、左道、右樹脂、W自然3000、LCD安全域、保留動作、normalflow、cameraを含む35/35成功。build-after-rim.log成功（既存chunk>500kB注意は継続）。lead-final-regression.log21/21、PM最終自然10条件/ライブ連続性も独立確認。

全体試験の初回273件は271成功/2失敗。自然ヘソ頻度依存とfixture後のリール停止状態の採取漏れを修正し、入賞口と停止順の責務を残した。root-final-full-tests.log274/274は追加rim修正前の記録であり、最終コード全件実行済みと読み替えない。rim修正後は上記35件を実行した。

| 最新動画 | 固定・操作条件 | 最終観測 |
| --- | --- | --- |
| left-mobile.mp4 | 本編、外れ固定のみ。自然.24を20秒→UIで.25を40秒→発射停止後30秒。玉配置なし | 82発/82計数、残0、一般口1・ヘソ1、収支一致 |
| dense-mobile.mp4 | 同SessionGame/製品rendererのlocal harnessで発射要求.05秒。外れ固定、20秒発射＋30秒排出、玉配置なし | 254発/254計数、残0、一般口4・ヘソ3 |
| rush-mobile.mp4 | 本編、初期RUSH/最初の結果固定のみ、全発射自然 | lastBonus.payout3000、画面3000/3000、収支一致 |

全3動画pageerror0、最終11製品hash一致。before-rim-fixは旧rim版動画/JSONを隔離。wrong-modeとdense-before-harness-fitも失敗/非採用履歴として残す。

rootは録画をローカルbrowserで再生し、left前版と最終denseの進行/終端、最終left35/60/90秒とRUSH40/171秒のデコード画像を独立目視した。各全frameの手動連続観察という主張はしない。root-left-final-*.png、root-rush-final-*.png、root-dense-final-sheet.pngが対応。3000完了は見た目だけでなくlastBonus/収支JSONで照合。

DesignerはPC/スマホ×3view×7表示位相42画像を確認。最大保留はpause＋identity/time設定の表示fixtureで、自然入賞成功の根拠にしない。PMは代表画像の保留輪郭と図柄中央を独立確認。rootは実ブラウザーで本編→液晶切替→操作情報→発射停止も確認した。

自然ヘソ到達率の実機一致、実開放秒数、低確普図、特図2直撃、V内部、ワープ/ステージ、実機奥行き、普図容量、W固有completeは今回未認定。PM固定power sweepで自然ヘソ0の条件と、本編録画でヘソ1/3に入った条件は別条件として残す。今回の修正範囲の合格をW完全再現へ拡大しない。
