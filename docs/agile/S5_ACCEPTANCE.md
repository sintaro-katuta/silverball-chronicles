# S5 #22 設計・検証と受入記録

2026-10-10。#22開始承認済み。[実行計画](S5_PLAN.md)の6ACに対応する。現在は設計/実装進行、全AC未判定。進行表はユーザーのPRレビューを代替しない。

## 接続契約と担当

基準101点は自動丸めしない。釘ID/群/役割/半径/反発を持つ配置と、地点・禁止領域・固定部材・制約版を分ける。移動は座標だけを変え、描画と自然衝突へ同一配置を渡す。地点間隔/原点/編集群/安全通路の値はLeadの読取根拠とDesigner表示案をPMが確認して確定し、未確定値をここで補わない。

Leadはschema・拒否・保存/復元・自然試射/会計・直接tests、Designerは許可地点/固定部材・拒否理由・差分/比較UIと実画面/動画、SMは契約/条件/生ログの照合、PMは設計/AC判定とGit/正本Issue/PR管理を担当。商品JS所有はLead/Designerが直接調整し、SMはdocsのみ編集する。

|AC|必要な提出証拠|現在|
|---|---|---|
|1 基準/属性共有|元101点のID/属性/座標と基準SHA、無編集roundtrip、描画/物理の同配置接続|未検証|
|2 地点/拒否|採用制約版/根拠、101本/ID保持、重複・盤面外・禁止領域・干渉・未定義地点の負例、理由の実表示|未検証|
|3 保存再現|配置/制約版・実効SHA・差分の保存読込/復元、不正schema/欠落/改変時の適用拒否|未検証|
|4 同条件比較|基準/候補ID、実code/tool SHA、固定物理/発射/観測条件、条件別自然試射生ログ/集計、欠測区別|未検証|
|5 製品ルール保持|抽選/保存当落/保留/賞球の非変更根拠と必要回帰、強制入賞/吸引/消去なし、発射/排出/残球整合|未検証|
|6 説明/PM判定|同条件実プレイ比較・差分/拒否/保存再現、利点/悪化/限界を説明する承認台本・Remotion/VOICEVOX動画、PR冒頭掲載とPM AC判定|未検証|

## 実行と失敗時の手順

1. 実branch/HEAD・dirty所有・source/基準配置/制約版を保存し、候補の編集IDと属性保持を確認する。未確認の既存変更を取り込まない。
2. 不正入力を負例で確認し、拒否後に既存有効配置が保持されることを確かめる。UIは未定義値を勝手に修復しない。
3. 基準→候補保存→読込→基準復元を行い、実効配置SHAと差分を照合する。比較する両者に同じ物理/発射/観測条件を設定する。
4. 自然試射を実行し、初期球・発射・入賞/賞球・排出・残球と無入賞観測窓を分けて記録。300秒+45秒等の計画値は実ハーネス/実終端へ照合し、有限玉終了やcensorを完走へ付け替えない。
5. 生ログ/集計・sourceguard・終了codeを保全する。guard不一致、計数不整合、未取得条件は失敗/未検証のまま原因と修正対象を記録し、前成功へ換算しない。
6. 必要全回帰/今回build/browserとUI/比較動画を対応させ、SMが不足を報告、PMがAC別判定。目的別commit、短いIssue bulletの非Draft Sprint PRでレビューする。PR作成だけで集約完了としない。

コマンド・artifact名・比較条件の最終値はLead提出時に追記する。まだ実行成功を示すコマンド/ログはない。private素材/logは用途別保存しPRへ同梱せず、run/HEAD/候補/日時/生ログの対応を記録する。過去qa05ログ・図解だけで今回の試射成功としない。

## 手待ちを避けるReady

- backend接続待ち：Designerは拒否理由・固定部材/地点の識別・差分/基準復元の表示案、Leadは属性保持/保存roundtrip/無効配置fixtureを準備。
- 試射待ち：SMは条件台帳/数式・計数境界のレビュー、Designerは比較動画の構成・台本案を準備。重い収録/回帰のquietは担当間で調整。
- 成果提出後：SMが新証拠だけ照合しPMへ不足を報告、担当へ承認範囲内の差戻しを渡す。対象が尽きれば要求整理に移り、新PBI/#11補修を勝手に実装しない。

終了は合意AC・必要検証・PM受入・Sprint集約PRのユーザーマージ。本編への候補採用、実機同等性、自動探索、公開は本Sprintの成功から拡張しない。

## 実API draftへの接続メモ（未完成・未検証）

2026-10-10読取時の `prototype/src/dev/pin-layout-model.js` は `getPinLayoutModel`/`createBaselineLayout`/`validateLayout`/`validateMove`/`applyMove`/`resolvePins`/`diffLayout`/`serializeLayout`/`parseLayout`/`layoutHash`/`constraintHash` を公開。UIは同じmodelの群・地点・固定部材を使い、保存JSONのplacementsはpinId/siteIdで対応する。baselineHashはdraftでは基準pinsのcanonical JSON文字列、実効配置SHAはlayoutHashで算出するため、baselineHashを暗号学的SHAと表記しない。最終APIはLead完成通知後に照合する。

PM採用はpitch4/原点[22,180]/heso2固定。制約版draftはestimated-board-grid-v1。Leadの次提出は群別site population・基準valid・拒否負例と実属性保持。Designerは地点選択と拒否理由・保存再現の接続を準備できる。他群境界とminimumPinDistance/fixedClearanceは提出/判定前なので合格へ付け替えない。比較測定API・起動/試射の実コマンドは完成通知待ち、新測定結果はまだない。ナレーション承認はpending、動画完成/掲載は未検証。
