# S9：演出と音の割り当て

2026-10-18。本編へ接続した音を整理する。新作音源の制作、本編での発音、実出力の検証、人の試聴、PMの採用は別の状態とし、最新の判定は[S9_ACCEPTANCE](S9_ACCEPTANCE.md)を参照する。

## 演出ごとの割り当て

表の「新作」「維持」は音源の扱いを表す。すべての演出へ固有の曲を新設する方式ではなく、通常・戦闘・BONUS・RUSHの曲を場面で切り替え、専用の打点を重ねる。

|場面|BGM|効果音|音源の扱い|
|---|---|---|---|
|通常待機・図柄変動|normal「月下の歩み」|spin / stopLeft / stopRight / stopCenter|曲は新作、停止音は維持|
|保留の変化|現在の曲を継続|holdBlue / holdRed / holdGold|既存の期待情報と音を維持|
|通常・RUSHの前予告|通常はnormal、RUSHはrush|serial / story / step / background / route / trail / approach / alert / search / resolve / moon / awakening / crest / identity / pursuit|既存を維持|
|リーチ入口と発展|長い戦闘への移行でbattle「一閃への決意」|reach / character / long / special / development|developmentは新作、他は維持|
|戦闘3種の各カット|共通のbattle。結果公開前は勝敗・復活で曲を変えない|arrival / enemy / dodge / pressure / gather / counter / clash / surge / rally / vow / final|既存を維持|
|上部剣・月・役物|現在のbattleを継続|attention / upperSword / moon|既存を維持|
|攻撃の接触|battleを継続し、重要音で音楽を引く|heroHit / enemyHit / decisiveHit|heroHit・decisiveHitは新作、enemyHitは維持|
|チャンスアップ|現在の曲を継続|chanceTitle / chanceDialogue / chanceResolve|既存を維持|
|決着PUSH表示・押下|battleの表示時計位置へ追従。PUSHで待ちを飛ばしても同期する|pushPrompt / pushPress|2用途とも新作|
|プレミア・全回転|現在の曲を継続し、告知音を優先|premiumMoon / premiumSword / fullrotation|既存を維持。既存の公開時刻で発音|
|当たり・外れ|結果を見せた後、実際の状態からBONUSまたは通常へ渡す|win / rushWin / loss|既存を維持。当たり識別音のPCM不変|
|復活|敗北までは外れと同情報。再起以降も現行の時計に従う|loss → silence → revival → winまたはrushWin|revivalは新作、敗北・確定音は維持|
|CHARGE|実際の状態に応じる|charge|既存を維持。新BONUS開始音と同一の割当とは扱わない|
|BONUS開始・開閉・ラウンド・払出|bonus「暁の祝祭」|bonusStart / open / close / roundReveal / payout / clear|bonusStartと曲は新作、他は維持|
|右打ち案内・RUSH突入6種|案内・演出中の実状態からRUSH曲へ渡す|rightGuide、moon / reflection / castle / slash / mechanism、castleのbreakthrough、復活突入のloss / silence / revival、rushStart|rushStart・revivalは新作。他は維持|
|RUSH中・継続・終了|rush「月影疾走」。終了後は実状態に従い通常へ戻る|rushReset / rushEnd|曲は新作、継続・終了音は維持|
|意図した間・一撃直前・敗北後の間|BGMを停止/抑制する|silenceで再生中のSEを止める|無音。空白を曲や残響で埋めない|

本編へ接続しているのは新作8用途のSEと新曲4用途。その他の70音名全体を作り直したという意味ではない。発射や釘の接触ごとに新たな音を加える作業は今回の8用途に含めない。

## 同じ定義を読む時間表

[試聴と時間表](../../prototype/dev/s9-audio.html)は、次の本編定義を直接importして代表「決意の一閃」の当たり・外れ・復活を表示する。

- [long-reach-timeline.js](../../prototype/src/pixi/long-reach-timeline.js)のRESOLVE_CUTS：画面の入り・保持・抜けと区間名。
- [reach-ending.js](../../prototype/src/pixi/reach-ending.js)のreachSchedule：当落公開と演出終端。
- [presentation-cues.js](../../prototype/src/pixi/se/presentation-cues.js)のreachAudioCues：SEの打点、PUSH、無音、復活。
- [music-player.js](../../prototype/src/pixi/se/music-player.js)のmusicPose：選曲と無音、表示時計の曲位置。
- [cabinet-light-motion.js](../../prototype/src/pixi/cabinet-light-motion.js)：筐体の実表示との照合元。

手書きの別タイムラインを再生に使用しない。実装の時間定義を直した場合は、同じ代表の全尺再生と表・画面の照合をやり直す。音源制作の打点・音程列は[S9_SOUND_DESIGN](S9_SOUND_DESIGN.md)と保存スコアへ対応づける。

既存の演出比較ページは決着直前までの描画比較用で、当落・抽選・保留・機構・新音楽の再生は本編と同じではない。表からのシークはその確認可能な範囲へ制限される。当落後・復帰・実ミックスは本編の専用検証とユーザー試遊で確認する。

## 音量と復帰

BGMとSEは別の音量・有効設定を持つ。重要SEでBGMを引き、確定音の再生途中を新SEで切らない。旧背景パッドはBGMと二重再生しない。設定・消音を戻しても好みの音量を保持し、停止中の打点をまとめて追い鳴らししない。

戦闘曲は表示時計の位置を使用し、通常・BONUS・RUSHは各状態の時計から反復位置を算出する。非表示・退出では止め、退出後に音源生成が完了しても発音しない。時計・曲位置・負荷と実出力の確認結果は受入記録へ残す。

## 更新する人と時機

リードが音イベント・選曲関数・公開境界を更新し、デザイナーが音源と画面の意図を照合する。スクラムマスターが表・実出力・保存版の対応を確認し、PMが採用状態を更新する。演出・音源・接続変更がまとまった時に本表と受入記録を照合し、試聴用の候補を未確認のまま採用済みへ変えない。
