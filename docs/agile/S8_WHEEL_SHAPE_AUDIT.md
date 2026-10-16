# S8：風車の共通形状1案・独立監査

## 最新状態：写真訂正による3枚羽根1案（2026-10-16）

ユーザーの新写真と「風車はひし形じゃないでした」に従い、旧4羽根＋固定菱形案を撤回しました。PMが新しい写真対応の試作図を実見し、3枚/120度・丸いhub半径3.5・羽根先端半径9.5近傍・非接触前面plate半径10・軸半径.2の1案を受入済みです。[最新計画](S8_WHEEL_SHAPE_PLAN.md)と`wheel-shape/photo-three-vane-proposal/{proposal.png,proposal.json}`を確認しました。新案の実装read監査/関連50件/旧oracle/両preflightを確認し、HEAD2b95c95/source25f905…e980c（187入力）で正式凍結済みです。正式phase0旧/新各250の独立監査が完了しました。ヘソ13→9で低下し、最大無ヘソ30.926→70.189秒へ悪化したため、追加3条件へ進まずPMは性能不採用・既定維持としました。

試作PNGを実見し、JSONの3枚/120度・丸hub/非solid外周・盤面→羽根と球の層→前面円盤→ガラスの表示と一致することを確認しました。これは写真に基づく未校正の設計近似で、写真同型/実寸/実断面を認定しません。JP2009112334Aは計画で別型式の構造例として位置づけられており、本監査は同型/実寸の裏付けにしていません。

新重点は次のとおりです。

- 3羽根と円hubを共通形状にし、旧固定菱形を残さない。中央はローターと一体とし、軸対称の法線接触から不要なトルクを生まない。旧固定capの面速度0/torque0という例外を新案へそのまま適用しない。
- 外周plateは球より前・羽根は球より後の実描画層で確認する。透過表現だけを奥行の実装とせず、rendererの親/順序と実画像を照合する。外周R10を全面solid円ガイドへしない。
- 元101全属性/狙い/中心/初期回転/球と係数/発射.18/レール/口20を保持し、両比較側の皿/取付板は表示接触ともなし。形状以外の条件を緩めない。
- 同じ新計測実装でガイドなし旧形状fresh基準と新案を各250＋45秒測定する。旧皿あり15/250や4羽根案の51成功/旧oracle一致は履歴だけで、新案の性能/安全/CIへ転用しない。

新PLAN/manifest/source/HEADの正式凍結後、専用validator・union露出輪郭/円hub境界・相対面速度・旧枝互換/計数/保存guardをread監査し、PM開始の新rawと同時刻媒体を独立照合します。目標60/750と各条件非悪化/安全/副作用の未達は維持、新台本未承認、本編採用/公開は未実施です。商品ソース/Git/試射の操作はしていません。

## 以下：旧4羽根案の検討履歴（最新案の合格根拠へ転用しない）

## 旧案の準備時点（2026-10-16）

ユーザーの「了解、修正する方針にしたい」により、羽根・中央部を表示と接触で共通形状定義から作る1案の実装と実250発比較が承認されました。sprint/S08内で継続します。計画/具体的形状/正式source凍結はPM確定待ち、新形状試射は0件です。新台本は未承認です。

前回観測は[統合結果](S8_ROUTE_RESULTS.md)と[S8_ROUTE_AUDIT.md](S8_ROUTE_AUDIT.md)が正本です。元250＝ヘソ15/一般6/OUT229、全原記録と受動トレースの非作用・全球集計は独立監査済みです。道変更なしOUT203、左下降OUT180の包絡内進入/反発71/変更接触なし109は観測対応で、羽根の透過・不足の原因・共通化の性能改善を確定していません。実写真の外装/可動面/奥行・実寸は未確定です。

## 固定条件・新旧の分離

- 元101釘の全中心と属性、左上の狙い/発射.18/間隔、球半径1.8と既定表示、重力・既存反発等の係数、従来レール/壁・口20・抽選/保留/賞球を維持します。最新ユーザー仕様に従い、両比較側ともleftAdmissionGuides:falseでヘソ左右の皿/背面取付板を描画・接触とも撤去します（後述）。
- 風車の中心(64,476.5)、腕長/初期角/初期角速度、回転減衰/トルク/角速度上限などは維持します。変更を許すのは合意した羽根/中央部の共通形状と、その輪郭に合わせる接触です。未知外装のsolid化、誘導力、無条件捕球や位置探索を混ぜません。
- 同じ新計測実装・ガイドなしでlegacy形状fresh基準と新形状1案を各実250＋45秒取得します。旧ガイドあり15/250は履歴/互換oracleに限定し、新sourceの採否基準へ流用しません。正式比較前にPMがsource/PLAN/cases/HEADを凍結します。

## 実装後readレビューと試射guard

| 項目 | 受入監査で必要な確認 | 状況 |
|---|---|---|
| 共通形状 | 頂点/輪郭の単一正本・中心/回転角/拡縮・中央部と羽根の重なりが描画と接触で一致。写真の推定と設計値を区別 | 未提出 |
| legacy互換 | 無指定/旧仕様の挙動維持。同じ計測でfresh legacyと旧oracleの全既存値を比較し、除外metadataを明示 | 未実行 |
| 条件固定 | 全101/全fixedと風車の位置以外を含む非形状属性、左右/表示/球/係数をfactory oracleで厳密照合。形状以外の変更を許す包括的な除外をしない | 未検証 |
| 形状選択 | legacy/承認済み共通形状1案だけ。未承認profile/不正形/同時offsetや釘移動を拒否し、config/geometryの実値とSHAを保存 | 未検証 |
| contact | 元solver呼出し回数と順序、位置補正/反発、pair/壁と回転表面速度の扱いを明示。細い突抜け/二重補正/中央重なり/境界/詰まりを直接テスト | 未検証 |
| 観測非作用 | 短ON/OFF全既存値一致と実raw再現。実substep・solver接触・幾何crossの意味を維持し、最後changed接触と未知を区別 | 未検証 |
| 実250/失敗 | 250spawn step停止・45秒排出・300秒上限・非grid実終点、全固有shot/outcome/残保存。未達は実分母/失敗raw/provenance保持 | 未実行 |
| 保存/版 | 入力全SHAと始終source/HEAD、実行PLAN/manifest/runner、原gzip圧縮/展開SHA/bytesとtrace保全・上書き拒否 | 未検証 |
| 表示/映像 | 同じ実角度・部材geometryを重ねて比較、元rawと時刻/座標/計数対応。PM実見と等速自然終端。新台本承認は別 | 未検証 |

比較はfresh基準→PM実画面/条件受入→新1案とし、単条件の有望判定を元の目標達成へ拡張しません。有望なら未選別3開始条件でfresh基準と各250発、合算750発60ヘソ以上・各条件基準非悪化・逆戻り比非悪化・残球/滞留/LCD4区分0・一般/最大gap等の未解決悪化を別表で判定します。正式計画で入口/採否を実行前に確定し、結果後に規則を変えません。

改善なし/安全不成立はそのまま報告し、本編の新形状採用を認定しません。実装/観測の完成と入賞目標達成は別です。追加候補探索や本番公開/mainマージを今回の比較承認に含めません。

## 既存CIと次Ready

読み取り時点の[run38842666621](https://github.com/sintaro-katuta/silverball-chronicles/actions/runs/38842666621)はhead91285e48…・in_progressです。unitとbrowser一般条件stepが進行中で、verify未開始、全体成功は未確認です。これは新共通形状実装前の別版であり、仮に成功しても新形状の試射/回帰へ転用しません。

次ReadyはLeadの完成通知後、共通形状/solver/専用runnerとguard・関連テスト/legacy互換証拠をread監査することです。PM凍結前の正式測定、監査担当のコード/計画/manifest/HEAD変更・試射/重テスト/Git操作は行いません。編集は本監査票だけです。

## 最新ガイド撤去仕様の適用（2026-10-16・追補）

共有rootの`docs/pachinko.md`/`docs/prototype/DESIGN.md`冒頭にある、ユーザー指示「ヘソの周りのガイドをなくしたい」を直接読み取りました。共有rootの未コミット差分は保護し、cloneへの大量コピーや別件実装変更は行いません。

比較両側はガイドなし（leftAdmissionGuides:false）を共通条件とし、ヘソ左右の受け皿と背面取付板を描画/接触とも除外します。左右rim/口/命釘・右側ガイドやその他固定部材は維持します。見えない皿の接触や、見える板だけの残存がないことを新runtime/実画像でも確認します。

旧ガイドあり15/250との全JSON一致は、明示的に旧設定で行う無指定legacy互換の限定証拠です。ガイドなしfresh基準とは条件が違うため、同一軌道/成績の一致を要求せず、両者を採否表で混ぜません。新形状の効果はガイドなしfresh旧形状対新形状の同条件比較で分離します。撤去という仕様整合の影響を風車形状の改善に付け替えません。

共有rootの撤去記録に残る初期.20や当時180秒の10入賞を、今回S7採用済み.18/実250比較の値へ読み替えません。今回の発射.18と目標60/750はPMの新比較計画で維持する前提とし、正式票の確認待ちです。旧記録の仕様/検証事実は当時のまま保持します。

## 計画07be054と実装予備read（2026-10-16）

[S8_WHEEL_SHAPE_PLAN.md](S8_WHEEL_SHAPE_PLAN.md)を確認しました。比較は.18/ガイドなし、商品初期値は変更しない計画です。旧皿あり短窓oracleは互換確認だけ、新sourceのfreshガイドなし旧形状対新1案を性能比較とする位置づけに一致します。短窓oracle/直接テストは実装検証であり、PM凍結前の正式250を許可するものではありません。

編集中の`domain/windmill-shape.js`と`physics/windmill-shape-contact.js`、physics/board-flow/pin-adjustmentと旧比較guardを読みました。共通定義は4羽根polygonと固定中央diamond、各辺を他成分との交点で分割し外側probeで隠れた辺を除外するunion露出境界です。未知外装は追加していません。実接触は近い露出境界から球半径を離す補正で、羽根間の凹部は最大10回まで解決します。

capは面速度0・torque更新なし、羽根は接触点の回転面速度に対する相対法線速度を既存反発.3で扱い、既存トルク.0005/上限±7を維持する設計です。legacy枝は既定のまま、新profileは明示指定時だけです。旧s8-shotと旧風車位置比較はshapeProfileキー自体を拒否しています。

予備readで重大blockerは見えていませんが、完成/検証済みの判定ではありません。Leadへ、凹部/境界交点で10回後の残り重なり・内部edge二重反発、capにomegaがあっても面速度0/torque0、羽根の相対接近/離反、旧無指定全JSON一致の直接証拠を重点確認として連絡しました。専用runner/validator・関連test・表示同一輪郭/ガイド撤去画面は完成通知後に追レビューします。正式250は0件、監査担当はreadと本票追記のみです。

## 新比較module/runnerの完成分read（2026-10-16）

`src/dev/s8-wheel-shape-comparison.js`、`tools/s8-wheel-shape-comparison.mjs`、直接testとPMの2case manifestを確認しました。legacy/sharedともguides:false、口20/.18/legacy/offset0/moves空、profileだけが異なる宣言です。inspectは球径指定や釘移動/offset/ガイドありを拒否し、元101全属性を照合します。validatorは両factoryの全fixedと全replay/stop/endの機構profile/version/静止geometry、有限angle/omega、実250spawn停止/5400step排出・規則30Hzと実終点を区別して照合する設計です。

runnerは単条件/phase明示・凍結source/PLAN/cases一致、上書き拒否、圧縮rawをvalidation前にも保全し、未達/失敗実分母と始終source/HEADを残します。750合算/採否を自動実装したとは記さず、全paired rawの独立表で確認します。

完成分のread指摘として、validatorが`r.phase`の許可値[0,.175,.35,.525]を直接確認せずconditions.phaseとの一致だけだったため、明示guardと破損phase拒否testをLead/PMへ依頼しました。measure/CLIの許可phase guardは既にあります。対応・最終関連test/旧oracle/preflightを受領するまで最終完了とはしません。

直接test本文ではunion露出辺/凹部と中央からの外部への解決、cap面速度/torque0、blade相対速度/予測非作用、旧default/shapeキー拒否・ガイドなし・合成250/profile破損を確認しました。提出10/10成功は直接テストの範囲で、正式250性能試射ではありません。監査担当は再実行/修正していません。

## 3枚羽根案の実装read・凍結前指摘（2026-10-16）

新domain/contactは`photo-three-vane-v1`、3枚polygonと解析的円hubのunionを使い、露出line/arcを抽出しています。円弧の角度は0〜2πへ分割し、最近点の候補にarc両端も含めるためwrapを跨ぐ円弧を直線chordとして接触に使いません。hub内部と羽根重複の隠れた辺は除外し、plateはcontact:false、軸もhub内で追加接触なしです。

円hubもローターと回り、接触点の接線面速度を持ちます。法線が軸対称の放射方向に一致するときはトルク0を明示し、旧固定cap方式へ戻していません。羽根は既存の反発.3・トルク.0005・減衰/上限と相対面速度で扱います。新validatorのphase許可4値guardと.1/NaN拒否testは追加済みです。ガイドなし2case・元101/中心固定・旧比較のshapeキー拒否は維持しています。

`photo-three-vane-implementation/focused-v2.log`は10/10成功（1301.237834ms）、`related-v1.log`は50/50成功（4744.658292ms）です。本文で0/初期角/45/90度の露出line/arc・内部辺なし、隙間のphantom円なし、円hub面速度/放射法線トルク0、凹部dense sampleの投影後残り接触なし、S7観測ON/OFF、profile/phase破損拒否を確認しました。初版の二重部材テスト点失敗は履歴で、修正fixtureの成功へ消していません。

`compatibility-proof.json`は07be054事前oracleに対してguides:false/true両方のfactory・3秒発射＋3秒排出全JSON/events/replay一致を記録します。旧4枚候補51件や旧皿あり15/250を新案へ付け替えず、正式250は未実行です。

**凍結前の具体的指摘：** 新test冒頭がprivate `reference-review/.../photo-three-vane-proposal/proposal.json`を直接読んでおり、Git未登録を確認しました。このままではclean CIでファイルがなく失敗するため、承認比率/頂点を保った追跡可能な小fixtureまたは独立固定期待値へ置換するようLead/PMへ連絡しました。補修/最終coverage/renderer完成後に再確認します。監査担当はコード変更/テスト再実行/試射/Git操作なしです。

## 新3枚案の正式測定前・最終read（2026-10-16）

正式HEAD`2b95c95d27b52c9310bae8e4f68caa6f817ff58c`、source`25f905a27cf6efb2fe3ff43732cad40e18e76e7b53e391acd3d6eccb741e980c`、PLAN SHA`c275cded06e0eb761ae6a2bbf94d1f85dabe505ee90937d889703e56ae03d967`、manifest SHA`28a6756863871b3fea2afd5bd81ed8ced1d7d6c419d13312a81852716624be4e`を確認しました。source-readyはsource commit e094968時点、正式HEADのdocs commitとは区別します。

両preflightのsuccess/source始終とmeasurementStarted:false、187 unique入力現bytes、PLAN/cases SHAが一致しました。新fixtureは追跡済みで承認private proposalとbyte/SHA完全一致、testとsourceinventoryが追跡fixtureを参照し、先のclean CIのprivateファイル依存は解消しています。

関連50/50成功・失敗/skip/cancel0（4770.801083ms）は最終説明commentのみの編集前に実行され、source-readyに範囲が明記されています。旧oracleはguide有/無ともfactory/3+3秒全JSON/events/replay exactで、正式性能比較には転用しません。phase直接guard・profile2種・guidesfalse・offset0/moves空・全fixed/frame機構/実250停止+45・保存guardを再読し、正式測定開始を阻む未解決指摘はありません。

run-planの既存テンプレート「No new physics」は、今回新接触形状があるため字義通り物理変更ゼロの根拠にはしません。今回の変更は形状のみ、配置/係数/球/発射等は固定というPM結果説明と実差分を正本とします。正式250の結果・安全・映像実見・新CI・本編採用は未確認です。監査担当は再試験/正式試射/商品ソース/HEAD/Git操作なし、本票だけ更新しました。

## 正式phase0 pairの独立監査と性能不採用（2026-10-16・最新）

`wheel-shape/shot250/{legacy-phase0,shared-phase0}/`の全原gzipを照合しました。両側HEAD`2b95c95d27b52c9310bae8e4f68caa6f817ff58c`始終、source`25f905a27cf6efb2fe3ff43732cad40e18e76e7b53e391acd3d6eccb741e980c`と187 unique入力現bytes、PLAN/cases/実行版、圧縮/展開SHA/bytesが一致しています。両側ガイドなし・移動0・中心不変・元101全座標/属性、全fixedと機構の非形状属性をfactory/前後raw間で照合しました。違いを許したのは宣言profile/versionの形状だけです。

| 条件 | 実発射 | ヘソ | 一般 | OUT | 最大無ヘソ秒 |
|---|---:|---:|---:|---:|---:|
| ガイドなしfresh旧形状 | 250 | 13 | 3 | 234 | 30.926190 |
| ガイドなし3枚共通形状 | 250 | 9 | 4 | 237 | 70.189286 |

全shot/outcome各250固有IDと生分類を再集計し、保存計数/要約と一致しました。両側の全250発射ID/時刻は完全一致。全5938規則30Hzframeの時刻・球r1.8・機構の宣言geometry/有限回転・発射＝終点＋残保存、実250番目spawn停止152.916667秒・45秒排出後197.916667秒の非grid終点が整合しています。返却/残球/滞留/LCD4区分は全0です。gapも実発射窓のヘソadmission/先頭末尾から独立再計算しました。

新案はヘソ4減・最大無ヘソ悪化のため短比較のstrict増条件を満たしません。PMは性能目的で不採用、追加3条件の確認を行わず既定を維持としました。一般3→4と安全0をヘソ改善達成に置き換えません。目標60/750は未達で、今回750の確認実測はありません。形状の表示/接触整合の達成と入賞性能採否を分け、未観測条件や実機の改善/不可能を保証しません。

旧ガイドあり15/250とは条件が異なり、今回fresh基準は13/250です。撤去による差を風車形状の性能差へ付け替えず、旧原記録/sourceは保護します。現在のfull unitはPMが別途実行中で、今回pairを新CI・本編採用・媒体受入へ代用しません。監査担当は読み取り/本票更新だけで、新試射・撮影・source/HEAD/製品/Git操作を行っていません。

## 全単体と結果文書のread確認（2026-10-16）

`photo-three-vane-implementation/full-unit-receipt.json`と全log末尾・logSHAを独立照合しました。HEAD2b95c95/source25f905…e980c、Node26.11、633/633成功・fail/skip/cancel0、257297.145167msです。これはローカル全単体で、新リモートCI/動画/本編採用の成功ではありません。

[S8_WHEEL_SHAPE_RESULTS.md](S8_WHEEL_SHAPE_RESULTS.md)とS8_ACCEPTANCE最新節の13→9・一般3→4・OUT234→237・gap30.93→70.19、安全0、strict減で追加確認なし/性能不採用、旧皿あり15との条件分離は整合しています。元rawの終点差の最小IDは38（旧ヘソ→新OUT）で記述と一致しました。同じ球IDを同じ周囲軌道や単一接触原因の証明とはしません。

PMはwhole/near5s実画面を実見し、3羽根/丸hub/前面円盤・外枠/元配置・ガイドなしを局所受入済みです。SMはこの実見を代行したとは記さず、PM判定として受領しました。無音動画は制作中、新7文の台本案はPENDING・音声合成0です。結果文書の『実画面未確認』と『台本更新が必要』は、この静止局所受入/新台本案作成済みと分けるようPMへ語句更新を提案しました。本監査票以外を編集せず、原記録/source/HEAD/試射/Gitは変更していません。
