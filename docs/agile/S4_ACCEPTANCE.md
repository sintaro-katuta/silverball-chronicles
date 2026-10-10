# S4受入台帳

## 最新PM判定：受入・集約完了（2026-10-10）

ユーザーが[PR #20](https://github.com/sintaro-katuta/silverball-chronicles/pull/20)を `release/0.2.0` へマージ。実マージ `1b0c889fe26e959f7a9b4864e35ee36b9bb49573` のtreeは `3ef03b9d49deff7d06ec73b9127164b6a71f444b` で、受入済みCI対象head/merge-refと一致する。

- 実CI [37876851107](https://github.com/sintaro-katuta/silverball-chronicles/actions/runs/37876851107) のunit/browser/verifyは全成功。488件/111単体testfiles、45資産14,902,484Bの全集合/size/SHAとsource511入力を独立照合済み。source SHA `3f5a5dbdde05e57223a2d98e8f96fe773292e1fae6e86022267b6e7d2d235682`。
- #17は両幅の6〜8秒構図・入り抜け・関連回帰、#13は5台の固定配置と説明・台対応・非変更、#19は検証保持・実並列実行・費用/効果からの採用判断が合格。
- #19はcritical path7分16秒、runner合計12分04秒。unit/browserの4分50秒重複を確認し、独立工程の直列待ちを解消する最小構成を採用。PR18との時間差はrunner/入力差も含み、全差分を並列化だけの効果へ換算しない。artifact総ZIPは約2倍で、保存コストの留意点も記録。
- 承認済み7文・ずんだもんnormalのRemotion動画はPR冒頭へ掲載済み。音の実聴取・スマホ実機・CD checkpoint再開は別の残件でありS4合格へ代用しない。

証拠は原workspace `prototype/reference-review/s4-2026-10-09/pr20-ci/index.json` と生artifact/log。S4は合意対象の検証・PM受入・ユーザー集約マージで終了した。本編公開はS6まで集約したrelease→mainの段階で行う。

以下の局所受入・実CI待ち・動画待ちはPR作成時点までの履歴。現在の判定には上記を優先する。

S4 #17/#13A/#19は開始承認済み。隔離sprint/S04の継承元はrelease `7ec4c6ad733b47174463b5e1967c224487111db8`。本書の最新AC表を現在状態とし、過去の取得/待機は証拠資料へ分離する。Git/Issue・最終受入はPM担当、固定期限なし。原dirtyworkspaceは実装/検証へ使わない。

## 最新AC表

| 対象・AC | 提出済み証拠と判定範囲 | 残る未検証/次の証拠 |
|---|---|---|
| #13A 本編5台の仕様限定 | docs/pachinko.md commit4107831をPM文書合格。固定5台、同当落/成績保証なし、非LCDseed/他機種へ固定採用を拡張しない | 実集約/PM全AC判定は後続 |
| #13A catalogと実説明 | Lead商品説明修正済み。Designer/PMが2幅×5台の既detail-specs小hintを採用。SM実records10条件で全文「月影機関の1〜5番台は、釘配置が共通です。」/台番号/非overflow・errors0を確認 | 詳細画面以外の表示を合格へ拡張しない |
| #13A 台番号の一覧→詳細→本編 | Designerは2幅×5台の一覧クリック/詳細台番号を提出済み（390台5は次ページ操作） | 新catalog-gameplay実5台で一覧→詳細→開始→本編panel1〜5→pause→退出を確認、errors0。実catalogIDs/seed101〜105一致。mountseedはpublic snapshot未公開なのでmain selected→mountunit→runtime/factory/Physicsのsource受渡し＋既物理baselineを根拠とし、直seed観測とは称さない。ローカル対応合格 |
| #13A 物理/抽選・非LCDseed保持 | Lead基準比較でcatalogのnote5文以外ID/unit/pegSeed/他15units保持、physics/domain全bytes不変、migration-prep4成功。仕様/説明変更に限定し固定釘/接触/入口/受け皿/道rail・確率/FIFO賞球会計発射を保持する資料を提出 | 新headの依存閉包・必要CI/実集約の確認は別。説明変更を新しい物理性能保証にしない |
| #17 視覚/入り保持抜け | PMが新390/7秒before-after原画、Designer両幅52caps/13境界frameからflash限定camera+4yを採用。局所視覚部合格、関連12test提出済み | 全フレーム動画鑑賞・人間音・実機性能へ拡張しない。新head/Linux/集約は別検証 |
| #17 非対象pose/時間境界 | 固定before/after/toolSHAと保存oracle一致。10,440=18options×580時点、allowed120/actual114。全actual差はflash6<t<8、camera.y以外のfield同一をtoolassertで確認 | 最終57.90000000000055で58exact未sample、motionFrames=true限定。6/8exactは直接unitの別証拠。actual114を全環境保証へ換算しない |
| #19 設計/局所guards | helper/YAML・関連76guardの実ログ成功。always verifyは25依存状態を拒否、同commit/source/test inventory/count/browserchecks/assetsをjoin、欠落/改変/不正UUID/pathでmanifest削除。browser-onlyverify/publish拒否、元operationerror保持、preparestdout互換維持 | Linux実job・欠落/取消運用・短縮効果/runner総コストと採否は未検証 |
| 共通 ローカル全split/join | 下の8c5候補でunit488/111filesと全browser成功、source/固定45資産・aggregate/verifyの独立照合合格 | dirty=trueを保持。現新headのclean Linux成功/新候補/実集約は未証明 |

#13Aの本編受渡しは新実操作5台とsource接続で局所照合済み。snapshot表示modeはboard、LCD領域存在/入口幅20/paused=trueを確認し、view=lcdを操作したとは称さない。guardは固定after/src inventoryで全実hash一致、publicを新しく測ったとはしない。#17/#19の商品/CIコードはLead所有、SMは台帳/証拠読取を担当する。

## 検証世代とheadの対応

**受入済み局所証拠**：候補 `f00a4443-41d8-4bf5-8ac5-fefeadc333f2`、head `8c5d4f782a858886766edf9ed055619e5096c33d`、source `81ddf54148020bd89877ef75742bb7a5a4bcb203c76ea315a1edec5b42e587b6` /511入力。unit/browser全entriesと検査時sourceは完全一致、111testfiles/全args、488pass/0fail/skip/cancel。全build/release2幅/controls/UI2幅/体験3/復帰成功、verified joinとverify成功。45資産14,902,484Bは全path集合/size/SHA不一致0。

実candidate.git.dirty=trueは未tracked2docsとdesigner-catalog-review.mjs。harnessは開始から511sourceへ含まれ不変、docsはfingerprint外。ローカル逐次unit wall151.652秒/browser173.78秒はLinux並列の効果ではない。phaseはunit151.354/build8.089/preview0.231/release9.373/controls5.372/feedback150.710秒で全成功。

**後続のQA helper commit**：`ba710240c48b0386c1570174787cfd6e1dadb27e` はQA可搬helper designer-catalog-review.mjsへ3行追加した新commit。旧8c5/511候補はその後のhelper bytesの検証結果ではない。現headのsource/候補/clean実CIは到着後に記録し、旧candidate.git/sourceへ付替えない。後続で受入済みmain4744を取り込み、README追加だけを継承した。これらの後続headを旧候補のgitへ付け替えない。次版0.2.0/remotebranchは回答・準備状況をPMが確定する。

## 根拠資料と履歴の扱い

- ローカル全split/join：原 `prototype/reference-review/s4-2026-10-09/local-split-8c5d4f7/` のindex/artifact/full logs（private/PR非同梱）。
- #13実表示：原 `prototype/reference-review/s4-2026-10-09/catalog-a/records.json`、関連 `/private/tmp/s04-catalog-regression.log`。
- #17：原 `flash-before/`・`flash-after/` と `pose-oracle/{oracle.mjs,result.json,oracle.log}`。120の旧表記はallowed数、actual変更114へ訂正済み。
- #19設計/費用：[S4_CI_DESIGN](S4_CI_DESIGN.md)、担当提出：[S4_ENGINEERING_REVIEW](S4_ENGINEERING_REVIEW.md)、局所guards `/private/tmp/s04-ci-tests.log`。

初稿の仕様/商品/画像待ち、browser進行中、oracle証拠待ちは過去進行であり、現在のAC未提出欄へ残さない。全回帰の過去成功は新headの成功へ転用しない。新測定・重複tests・商品/CI編集を台帳整理のために実行していない。

## 現在の担当キューと残件

- Lead：#13本編受渡し証拠、現head clean CI・unit/browser/verify全coverageと時間/費用の提出。
- Designer：承認7文/7WAVを使ったS4動画制作と完成motion、#7環境確保後の既承認聴取支援。
- SM：#13残AC→新CI同head/source/assets/guards/採否資料の独立照合。
- PM：#19有効性が妥当なら採用、妥当でなければ現状維持で終了判断。数値目標/固定試行回数なし。次版/branch/集約・Issue管理。

#8/#11は現releaseの別キュー、人間聴感・CD/Secrets/公開は未完。動画は制作中で完成/掲載は実結果待ち。合意AC・検証・PM受入・Sprint集約PRmergeで終了し、残件を回数で完了扱いしない。

追加証拠：原catalog-gameplay/records.json・unit-gameplay.executed.mjs・gameplay.log。実操作/独立metadata合格とDesigner画像品質、Linux/実集約を分離する。
