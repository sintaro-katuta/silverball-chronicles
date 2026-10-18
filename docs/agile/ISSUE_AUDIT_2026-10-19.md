# GitHub Issue全件整理 — 2026-10-19

ユーザー依頼により、既存Issueを全件調査し、実装済み・受入済み・未着手・重複・大きすぎる範囲を整理した。正本はGitHub Issues。これは今回の調査時点の写しであり、その後の最新状態はGitHubで確認する。

## 調査対象と確認方法

- 初回取得は39件（Open21、Closed18）。新規切り出しも含む最終照合は52件（Open27、Closed25）。件数削減ではなく、一件の完了条件を小さくすることを優先した。
- 全Issueの本文・状態、関連PR15件の状態とマージ先、既存受入資料、選択した実装箇所を照合した。
- 初回はPR #39がOpenだったが、更新直前にユーザーの受入とマージを再取得した。最終HEADは `09fc6e0c548d098853a2c7b1198a568753f21d82`、release/0.3.0は `56401a1e6adc01fec10e5ee08d234b2af4df0f85`、mainは `72958cc9c21b09e75473d358892ecf1854464497`（いずれも調査時点）。ローカル原workspaceのmainを最新リリース候補として扱っていない。
- [PR #39](https://github.com/sintaro-katuta/silverball-chronicles/pull/39)と[CI39141743475](https://github.com/sintaro-katuta/silverball-chronicles/actions/runs/39141743475)をAPI照合。最新runのunit/browser/verifyは全成功。前の失敗・cancelled runも別記録として存在し、全履歴が成功したとは扱わない。
- 新しいゲーム実装、ゲームのテスト再実行、画面の再撮影、今回の実聴取は行っていない。受入済み判定は保存記録とユーザーによる受入・マージ状態に基づく。未着手の顔修正・物理修正などを既存CIで合格にしていない。

## 変更した内容

1. #26・#37・#38は調査中に完了・Closedとなったため、その最新状態を維持した。こちらで新たに閉じたとは数えない。
2. #27を #57（遊技・保存）／#58（演出・画面の採用状態）へ分割。盤面表 #29 と音のS9資料は既存成果を再利用する。
3. #28を #59（効果部品の再生成）→#60（代表一撃への統合）→#61（別演出で再利用）へ分割。人物・粒度は #46〜#53等、最終通し受入は #25 を参照する。
4. #43は筐体のみ、店内は #65。#50は先手のみ、互角は #64。#51は通常待機のみ、人物予告は #62。#52は復活のみ、RUSH即告知は #63。
5. #7の古い聴取待ちは、現行音 #37/#38 の受入へつないだ。#11の診断実装・集約は完了と明示し、未確定原因 #66 とロールバック検証 #67 を分離した。
6. #25は新しい人物・効果の実装を抱えず、採用版で代表一本を通し確認するIssueへ絞った。#42には現行3枚羽根の描画分岐、#46には分割後の工程を補記した。
7. 初回取得時の未受入状態から作った #55/#56 は、更新直前に試聴受入が確認できたため取り下げた。不要な再試聴のタスクを残していない。
8. #27/#28は `not_planned`（分割先へ移管）、#55/#56も `not_planned`（重複）として閉じた。完成していない実装をCompletedとして閉じていない。元本文は折りたたみの履歴として保存した。

## 作業順の入口

- 物理・遊技の報告：#40・#41・#42・#44。各Issueの再現と修正を個別に受け入れる。
- 人物・ドットの規格：#46 → #47 → #48 → #49。先手 #50／互角 #64 は #49後。通常待機 #51、予告 #62、復活 #52、即告知 #63、上部 #53 は対象別の受入。
- 効果制作：#46/#47 → #59、#49/#59 → #60、#60/#63 → #61。人物制作と効果制作を二重管理しない。
- 最終代表受入：#49・#52・#60 → #25。
- 台選択：筐体 #43 → 店内 #65。払出体験は #45。
- 現行条件の索引：#57・#58。盤面・音は既存表を参照。
- 運用の残件：#66・#67。今回の整理では本番を操作しない。
- ローグライク：#54。パチンコ単体の試遊受入後に最小ループを設計し、旧仕様の一括復活や全美術・運用タスクの一律完了を条件にしない。

Issue整理は新スプリント・素材制作・実装・公開の開始承認ではない。次の開始対象はユーザーが選べる。

## 全件の判定

| Issue | 最終状態 | 判定の根拠・次の作業 |
|---|---|---|
| [#2](https://github.com/sintaro-katuta/silverball-chronicles/issues/2) 右道釘の横断テスト失敗を切り分け、現行品質を回復する | Closed（既存完了） | PR #12。釘隙間の試験分離と回帰を受入済み。今回の道釘反跳は #44 で別に追跡。 |
| [#3](https://github.com/sintaro-katuta/silverball-chronicles/issues/3) 消化回数の意味を明確にし、スマホ結果画面の折返しを直す | Closed（既存完了） | PR #12。消化回数の文言と結果表示の改修を受入済み。 |
| [#4](https://github.com/sintaro-katuta/silverball-chronicles/issues/4) 通常・休止・右打ち・体験の操作案内を状態別に検証する | Closed（既存完了） | PR #12。対象UI状態と体験復帰の検証を受入済み。 |
| [#5](https://github.com/sintaro-katuta/silverball-chronicles/issues/5) 5台の自然入賞・無入賞時間・排出を同条件で測定する | Closed（既存完了） | PR #14。固定条件の自然入賞計測が完了。最新の反跳解消や任意条件の率を保証しない。 |
| [#6](https://github.com/sintaro-katuta/silverball-chronicles/issues/6) 高DPI本編の端末負荷と採用基準を定義する | Closed（既存完了） | PR #14。PC計測の範囲で完了。スマホ実機・発熱は未検証の制限として保持。 |
| [#7](https://github.com/sintaro-katuta/silverball-chronicles/issues/7) 通常・期待・当落・復帰の音を実聴取で評価する | Closed（既存完了） | 旧聴取待ちは履歴と明示。現行音は #37・#38／PR #39の試聴受入済みへ接続。 |
| [#8](https://github.com/sintaro-katuta/silverball-chronicles/issues/8) 3スプリントの受入成果をPRとリリース候補へまとめる | Closed（既存完了） | PR #18・#21／0.1.0。対象3スプリントの集約・公開を受入済み。 |
| [#9](https://github.com/sintaro-katuta/silverball-chronicles/issues/9) 戦闘中盤の構図を全尺でレビューして改善要件を定義する | Closed（既存完了） | PR #16。戦闘中盤のレビューと要件定義は完了。顔潰れは #48 で追跡。 |
| [#10](https://github.com/sintaro-katuta/silverball-chronicles/issues/10) 検証済みreleaseを同一成果物のまま公開できる仕組みを作る | Closed（既存完了） | PR #12と0.1.0/0.2.0の実運用。固定成果物のリリース基盤を保持。 |
| [#11](https://github.com/sintaro-katuta/silverball-chronicles/issues/11) PRマージを起点にGitHub ActionsでCloudflareへ自動公開する | Closed（既存完了） | PR #21・#32の公開と再開、#33の診断追加は完了。残件は #66・#67 に移管。 |
| [#13](https://github.com/sintaro-katuta/silverball-chronicles/issues/13) 5台の釘配置設定と本編の固定配置の整合を定義する | Closed（既存完了） | PR #20。5台の固定釘配置説明を受入済み。 |
| [#15](https://github.com/sintaro-katuta/silverball-chronicles/issues/15) 戦闘中盤の構図と字幕の見せ方を改善する | Closed（既存完了） | PR #16。中盤構図・字幕の対象改修を受入済み。全人物統一の完了ではない。 |
| [#17](https://github.com/sintaro-katuta/silverball-chronicles/issues/17) RUSH短尺演出の顔・握りと保留の余白を改善する | Closed（既存完了） | PR #20。RUSHの顔・握りと保留の余白改修は完了。新しい粒度統一は #63。 |
| [#19](https://github.com/sintaro-katuta/silverball-chronicles/issues/19) CI・リリース候補検証を計測し、検証範囲を保って短縮する | Closed（既存完了） | PR #20。CI工程計測と検証分割を受入済み。 |
| [#22](https://github.com/sintaro-katuta/silverball-chronicles/issues/22) コード上で釘配置を変えて比較できる仕組みに整理する | Closed（既存完了） | PR #24。コードによる釘微調整・比較手順は完了。 |
| [#23](https://github.com/sintaro-katuta/silverball-chronicles/issues/23) ヘソへ届く経路を調べ、根拠を持って釘配置を改善する | Closed（既存完了） | PR #35・#36。S8の採用条件と67/750の受入・集約は完了。新報告 #44 を未解決として保持。 |
| [#25](https://github.com/sintaro-katuta/silverball-chronicles/issues/25) 人物・効果の改修後に「決意の一閃」一本を通しで受け入れる | Open | 改修作業を含めず、#49・#52・#60後の代表一本の通し受入に限定。 |
| [#26](https://github.com/sintaro-katuta/silverball-chronicles/issues/26) 映像・音・筐体の光を同じ演出表で確認できるようにする | Closed（既存完了） | 調査中にユーザーの受入・PR #39集約を再確認。Closed維持。こちらで閉じたと報告しない。 |
| [#27](https://github.com/sintaro-katuta/silverball-chronicles/issues/27) 採用状態一覧の全体整理（分割先 #57・#58 で継続） | Closed（分割・重複） | 全一覧の完成とはせず、盤面 #29・音の既存成果・残る #57/#58へ分割。not_plannedで閉鎖。 |
| [#28](https://github.com/sintaro-katuta/silverball-chronicles/issues/28) ドット絵の演出改善ロードマップ（個別Issueへ分割済み） | Closed（分割・重複） | 全演出改善を完了扱いにせず、#46〜#53・#59〜#64・#25/#45へ移管。not_plannedで閉鎖。 |
| [#29](https://github.com/sintaro-katuta/silverball-chronicles/issues/29) 釘の比較に使う盤面条件と採用状態を一覧にする | Closed（既存完了） | PR #30。盤面条件表は完成済み。#57/#58で同じ表を再制作しない。 |
| [#31](https://github.com/sintaro-katuta/silverball-chronicles/issues/31) 左打ちの狙い位置と玉の流れを修正する（ブッコミ・強め打ち） | Closed（既存完了） | PR #33。左上の狙い位置の限定採用と検証を受入・集約済み。 |
| [#37](https://github.com/sintaro-katuta/silverball-chronicles/issues/37) 場面に合った音楽を作り、遊技中に流す | Closed（既存完了） | 調査中に試聴・導入プレイ受入、PR #39集約を再確認。Closed維持。 |
| [#38](https://github.com/sintaro-katuta/silverball-chronicles/issues/38) 演出に合った効果音を作り、映像と合わせて鳴らす | Closed（既存完了） | 調査中に試聴・導入プレイ受入、PR #39集約を再確認。Closed維持。 |
| [#40](https://github.com/sintaro-katuta/silverball-chronicles/issues/40) リールの停止順を役あり・なしに関係なく統一する | Open | 条件付き表示列交換が現行系にも残る。停止順統一の検証・修正は未着手。 |
| [#41](https://github.com/sintaro-katuta/silverball-chronicles/issues/41) 液晶下の当たり判定がない白い二重線を撤去・整理する | Open | 描画の白い二重線と輪郭colliderを区別。修正・実画面での再検証は未着手。 |
| [#42](https://github.com/sintaro-katuta/silverball-chronicles/issues/42) 玉の接触で風車が回るように回転応答を修正する | Open | 3枚羽根の現行分岐を補記。回転処理があるだけでは報告解消とせずOpen維持。 |
| [#43](https://github.com/sintaro-katuta/silverball-chronicles/issues/43) 台選択用の筐体ドット絵を改善する | Open | 対象を台選択用筐体に限定。店内は #65へ分割。 |
| [#44](https://github.com/sintaro-katuta/silverball-chronicles/issues/44) 右下へ下がる釘列で玉が上流へ跳ね返る挙動を修正する | Open | 下り釘列上の反跳を、発射レーン逆戻り集計と区別。未再現・原因未確定として保持。 |
| [#45](https://github.com/sintaro-katuta/silverball-chronicles/issues/45) 1500玉の払出中の液晶演出に動きと祝福の盛り上がりを加える | Open | 払出中の液晶改善は未着手。人物は #46→#47を使い、既存音の再制作を要求しない。 |
| [#46](https://github.com/sintaro-katuta/silverball-chronicles/issues/46) 月影の人物デザインとドット絵の粒度を制作基準として定義する | Open | 定義のみで閉じられる範囲を維持。分割後の #62〜#65等の参照を更新。 |
| [#47](https://github.com/sintaro-katuta/silverball-chronicles/issues/47) 定義した人物デザインと粒度に沿って制作コンテキストの参照素材を作る | Open | #46の採用後に参照素材を作る。演出差替えを含めない。 |
| [#48](https://github.com/sintaro-katuta/silverball-chronicles/issues/48) 共通デザインと粒度の基準を使い、一閃の顔アップの潰れを修正する | Open | #46→#47の後に一閃の顔アップだけを修正・受入。 |
| [#49](https://github.com/sintaro-katuta/silverball-chronicles/issues/49) 共通素材を使い「決意の一閃」の人物描写を全カットで揃える | Open | #48後に決意の一閃の人物カットを揃える。 |
| [#50](https://github.com/sintaro-katuta/silverball-chronicles/issues/50) 「先手」の戦闘人物カットを共通デザインと粒度で揃える | Open | 先手一経路に限定。互角は #64へ分割。 |
| [#51](https://github.com/sintaro-katuta/silverball-chronicles/issues/51) 通常待機の人物を共通デザインとドット粒度で揃える | Open | 通常待機の人物だけに限定。人物予告は #62へ分割。 |
| [#52](https://github.com/sintaro-katuta/silverball-chronicles/issues/52) 復活専用区間の人物を共通デザインとドット粒度で改善する | Open | 復活専用区間の人物だけに限定。即告知は #63へ分割。 |
| [#53](https://github.com/sintaro-katuta/silverball-chronicles/issues/53) 上部装飾の人物像を液晶と共通のデザイン・粒度に揃える | Open | 上部人物像だけの改修として保持。 |
| [#54](https://github.com/sintaro-katuta/silverball-chronicles/issues/54) パチンコ単体の受入後に加えるローグライク要素の最小ループを設計する | Open | パチンコ単体の試遊受入後。完了済みS9音や全美術・CD保守を一律の開始条件にしない。 |
| [#55](https://github.com/sintaro-katuta/silverball-chronicles/issues/55) S9のBGM4曲を本編で試聴し、迫力・テンポ・疲れにくさを判定する | Closed（分割・重複） | 初回取得時の試聴待ち案。更新直前の #37受入を確認し、重複としてnot_plannedで閉鎖。 |
| [#56](https://github.com/sintaro-katuta/silverball-chronicles/issues/56) S9の効果音13用途を実際に聴き、打点・音色・連続発音を判定する | Closed（分割・重複） | 初回取得時の試聴待ち案。更新直前の #38受入を確認し、重複としてnot_plannedで閉鎖。 |
| [#57](https://github.com/sintaro-katuta/silverball-chronicles/issues/57) 遊技ルール・保存・ローグライク旧仕様の現在の採用状態を一覧にする | Open | #27から遊技・保存・旧ローグライク仕様の現状索引を分離。 |
| [#58](https://github.com/sintaro-katuta/silverball-chronicles/issues/58) 演出・画面操作の採用状態と未完成の表現を一覧にする | Open | #27から演出・画面操作の索引を分離。音はS9既存表、盤面は #29を再利用。 |
| [#59](https://github.com/sintaro-katuta/silverball-chronicles/issues/59) 斬撃・衝撃部品を定義したドット粒度で再生成できる制作手順を確立する | Open | #28から斬撃・衝撃部品の再生成手順だけを分離。#46/#47後。 |
| [#60](https://github.com/sintaro-katuta/silverball-chronicles/issues/60) 「決意の一閃」の最終攻撃へ斬撃・衝撃部品を統合して比較する | Open | #28から代表一撃への効果統合を分離。#49/#59後、受入は #25へ。 |
| [#61](https://github.com/sintaro-katuta/silverball-chronicles/issues/61) 斬撃部品の制作・再生手順をRUSH即告知一本で再利用する | Open | #28から別演出一本での制作手順再利用を分離。#60/#63後。 |
| [#62](https://github.com/sintaro-katuta/silverball-chronicles/issues/62) 5種の人物予告素材を共通キャラクターデザインと粒度で揃える | Open | #51から既存5種の人物予告素材群を分離。#46→#47→#48後。 |
| [#63](https://github.com/sintaro-katuta/silverball-chronicles/issues/63) RUSH即告知の人物カットを共通デザインとドット粒度で改善する | Open | #52からRUSH即告知の人物だけを分離。#46→#47→#48後。 |
| [#64](https://github.com/sintaro-katuta/silverball-chronicles/issues/64) 「互角」の戦闘人物カットを共通デザインと粒度で揃える | Open | #50から互角一経路を分離。#49後、共有atlasの二重制作を避ける。 |
| [#65](https://github.com/sintaro-katuta/silverball-chronicles/issues/65) 台選択の店内・椅子・小物のドット絵を筐体の規格に揃える | Open | #43から店内・椅子・小物を分離。採用筐体の規格を使用。 |
| [#66](https://github.com/sintaro-katuta/silverball-chronicles/issues/66) 公開後確認の台選択待ち失敗を保存診断から再現・原因特定する | Open | #11の台選択待ち失敗の未確定原因を分離。診断追加の実装は作り直さない。 |
| [#67](https://github.com/sintaro-katuta/silverball-chronicles/issues/67) 公開版を以前の検証済み版へ戻す手順を検証し、実運用の確認条件を定める | Open | #11のロールバック未実証を分離。隔離検証と具体的な実運用許可を区別。 |

## 照合結果と更新先

最終再取得で、予定したOpen/Closed状態と主要な移管リンクに欠落0。#27/#28の移管、#43/#50/#51/#52の範囲、#46の依存、#11の残件リンクを確認した。

バックログの入口は [BACKLOG.md](BACKLOG.md)。今回以降の個別更新はGitHub Issueを正本とし、必要時に本資料へ追記する。古い受入や公開記録を改変せず、今回の状態をその上に明示した。
