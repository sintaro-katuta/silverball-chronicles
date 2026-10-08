# S3 #9 / #15：最新構図の観察と最小改修

## PM最新判定（2026-10-08）

#9はAC1〜4合格、#15は全AC合格、Sprint集約待ち。CI3 run37749380053（head3741844/refddf05719/source3bc39486）の全461テスト・build・必要browserと候補の507入力/45資産SHAをLead・SM・PMが照合し一致。Designerは新Linux UI13画像を確認。本書の後続にある先行提出・差戻し・CI待ち欄は各時点の履歴で、最新判定は本節とGitHub Issuesを参照する。実Sprint merge・main Release PR・本番CD・#7実聴取は未完。

| 対象AC | PM判定と根拠 |
|---|---|
| #9 AC1 | 合格。通常/RUSH3系統勝外れ・復活・flashの28phaseと、直接96PNG・内容同定抽出42PNGで全source cutの場面/主役/出口を確認。Designer全sheet実見、SMの時刻/stage/source/guard独立照合、PMの代表原PNG実見を対応。指定fixtureの観察であり、自然抽選や全予告cueの証明ではない。 |
| #9 AC2 | 合格。新旧画像、実見、連続取得、動画時刻推定、未聴取/実機未検証を分離。 |
| #9 AC3 | 合格。pressure24〜33の最小構図案、既素材再利用、timeline/view2files、前後/描画列/必要経路/操作の方法と実結果を提出。 |
| #9 AC4 | 合格。開始承認と内部設計判定後の表示改修に限定し、ゲーム・物理・出玉の仕様を改変していない。実装のCI総合受入は#15 AC4へ。 |
| #15 AC1 | 合格。#9の観察と対象cut/実装前後/差戻し・採用を対応。 |
| #15 AC2 | 合格。両幅で字幕背景の競合を抑え、顔/握り/刃/意匠を保持。初稿の水平段差をfeatherへ差戻し、保留・PUSH・操作との新重複がないことを確認。 |
| #15 AC3 | 合格。新100frameの約0.2秒列で入り/保持/抜け、12必要条件の場面比較で勝敗・復活・flashへの非残留を確認。全動画鑑賞とは区別。 |
| #15 AC4 | 合格。CI3の全461tests/build/必要browserとclean候補の全source/資産SHA、実head/ref/treeを照合。Mac対象中盤visual・両幅pause/PUSHとLinux UI13画像のscopeを対応。Linuxの中盤比較画像・成功runの実GL backendは未記録で、実機/聴感/本番CDへ拡張しない。旧2失敗と補修はS3_CI_REVIEWで保持。 |
| #15 AC5 | 合格。製品2files＋直接testsの実装commit3b502a0、新画面/意図/本AC別判定を提出。helper補修2a26e61は別の目的別commit。 |

下端減光は32.2〜33秒で戻り、厳密に0になるのは33秒。32.8秒の観察を厳密ゼロの計測へ換算しない。全動画鑑賞・全瞬間動作・実機・聴感・指定fixtureにない予告・自然RUSH入賞/出玉は未検証。#7/#11の未受入を本判定へ含めない。


S3 #8/#9/#15はユーザー開始承認済み。#9の調査→PM内部レビュー→Leadの#15実装→Designer確認を同S3内で進める。本書は新baselineの場面観察、実改修の差戻し/採用、改修後視覚確認を記録する。AC別最終受入はPMが行う。

## 新規baselineの出所と確認範囲

基点は`c989ee8ba5427fd1cc03ac29b2037c008e5b9206`。`src/public`301ファイルを`/private/tmp/silverball-s03-before/prototype`へ固定コピーし、元とのSHA一致を確認。inventory SHAは`5737d7c33658a46eee278ee9f078d74c8d91576e9240cb98db63f7c4b04f2be3`（S2とはinventory形式が違うのでdigest文字列を直接比較しない）。専用`127.0.0.1:5211`、依存のみ既存node_modules参照。元worktreeのLead改修は固定baselineを更新しない。

証拠は原`prototype/reference-review/s3-2026-10-08/before/`。`provenance.initial.json`、実行した`capture09.executed.mjs`、`capture.log`、各経路の`record.json`/WebM/PNG。DOM+canvasの全viewport動画で音off、指定presentation経路、自然進行時計でseek/freeze/時間倍率/PUSH押下なし。通常/RUSH×pressure/initiative/exchange×勝ち/外れ12条件＋通常pressure復活＋RUSHflashの計14経路を2幅で取得済み。指定RUSH表示fixtureは自然RUSH入賞/出玉の証明ではない。

初回sandbox Chrome起動失敗と固定snapshotのVite fs.allowフォント拒否を成功取得から分離保存した。サーバーconfigのcacheDir/tmpと依存読取り許可だけを訂正し、製品src/publicは不変。失敗WebMは`failed-font-allow/`、ログは`launch-sandbox-failed.log`/`snapshot-font-allow-failed.log`。成功撮影は再起動後の別WebM。

先行`{390,1440}-normal-pressure-loss/`の代表25.3/29.5/32.5 PNG6枚を原寸で目視。23.8〜33.2秒の各52画像は実取得前後演出秒付きの`dense-sheets/sheet-{1,2,3,4,5}.png`（計10枚）から順序通り全104フレームを確認した。約0.2秒の離散連続列で、before取得演出秒の最大gapは両幅0.20833秒。全フレーム動画の鑑賞とは区別する。矩形/細字/色の最終読取りには原PNGを用い、縮小一覧を原寸品質の根拠へ拡張しない。

390全尺収録はfixture起点から59.230秒、1440は55.009秒で、54秒の演出時計に対して撮影負荷/フレーム進行の差がある。演出秒/壁時計/PNG前後時刻を記録し、実機fpsや無負荷性能の証拠にしない。連続WebMの取得は確認したが、動画を全尺鑑賞したとは報告しない。音聴感/実スマホは未検証。

## 先行pressure 24〜33秒の観察

| 演出秒 | 実見した事実 | #15へ渡す判断 |
|---|---|---|
| 23.8→24 | 広い攻防構図からgatherの人物/握りへcutが切り替わり、字幕がfadeで入る | 既存cutの意味を維持。追加camera offsetは境界で0へ戻して既存cutに別の跳びを足さない |
| 24〜25.3 | 白字幕/黒縁が次第に明瞭。月/雲と刀先が同じ上部へ集まり、顔と握りは中央下 | 欠字不具合としない。背景側局所減光で白字幕/刃の読み取りと視線を分離する |
| 25.3〜31付近 | 顔/握り/刃/字幕は読取可。構図は少し寄り続け、髪と月光収束が変化。明るい月/雲と字幕が競合 | 主役『字幕→刃/握り→顔』の順を構図と背景輝度で明確にする。新斬撃を足さない |
| 31.8〜33.2 | 字幕が薄く抜け、33秒で既存の広い攻防構図へ戻る。目/刀/透過の破綻は一覧の確認範囲で見られない | 文字の保持時間/退出を延長しない。追加offset/減光は33秒で0へ戻し、surgeへ残さない |

## PM内部レビューへ渡す最小案

pressure gather24〜33秒だけ、camera中心/寄りを少し調整して顔・両手・刀先を斜めの主役線上に保つ。既存cameraを丸ごと置換せず、追加offset/scale量は24秒開始と33秒終了で0、入り/抜けにsmooth包絡を使う。刀先や顔が液晶開口/保留へ欠ける拡大は避ける。

字幕背後の月/雲に限定した薄い背景減光layerを既存背景と人物の間へ追加する。既存の全画面dimを強めると人物/刀まで暗くなるため採用しない。字幕/白銀刀/人物/粒子/PUSH/保留を上に保ち、長方形の説明カードを作らない。局所範囲と最大alphaはLeadの最小初稿を同条件で比較しPMが内部判定する。新素材・字形・台詞・音は追加しない。

保持条件：pressure通常/RUSH/勝ち/外れ/復活で同じ公開前構図。54/58/12秒、PUSH46.5〜49.9と任意押下/自動決着、復活前敗北/55.7告知、当落/図柄/抽選/FIFO/保留/賞球/物理を変えない。先手/互角/flashには減光やpressureの溜めを一律適用しない。銀長髪/青眼/紺金衣装/刀、高DPI/採用補間を維持する。

#15の確認は新しい両幅同条件原PNG＋23.8〜33.2の実時刻連続列で、入り/保持/抜け/文字/顔握り刀/透過/PUSH保留dockを改修前後比較する。必要全尺経路の新証拠を別途照合する。未取得/未鑑賞のscopeを合格扱いしない。Git/公開はPM担当。

## #15内部試作レビューと差戻し（2026-10-08）

PMが先行新PNGを直接確認し、pressure gather24〜33限定のcamera追加scale+.06/x-2/y-1×smooth包絡、背景限定alpha.22を試作承認。Leadの`after-prototype/{390,1440}-normal-pressure-loss/`の25.3/29.5原PNG4枚と境界を含む8frame×2の一覧を実見した。

判定：字幕背後の月/雲が落ち着き、全文と顔/握り/刃を読める。小さいcamera寄りが主役線の意図に合い、人物/刀の暗化や重要crop/操作との新しい重なりは見られない。改修前も字幕は読めていたことを維持する。ただし背景減光の一枚矩形の下端が月/雲を水平に切り、特に1440で帯として見えるため、この試作は最終受入にしない。

PMは下端4〜6logical pxだけ静的alpha減衰で0へなじませる最小修正を採用。camera量/最大alpha.22/時間包絡/原字幕fade/人物と刀の上層/他cutは保持。再確認は`after-prototype-feather/`の両幅成熟原PNG＋23.8〜33.2の実時刻0.2秒列で、帯の切れ目、主役の維持、入り/保持/抜けを読む。新しいユーザー再承認を工程内に挟まない。

取得負荷を分離するためbeforeを完成record境目で2回停止し、未完だけ`interrupted-for-after-quiet/`と`interrupted-for-feather-quiet/`へ隔離。Ctrl-Cのexit130は意図的なquiet提供であり、取得済8→13recordを削除/失敗扱いにしない。専用Chrome終了はpsで確認、各termination JSON/logを保存。固定snapshotの完成済経路をskipするretry実行版を別SHAで保持し、before残り取得をafter終端後に再開する。静止/離散描画列/全尺動画取得/動画鑑賞/聴感を引き続き分ける。

## 下端feather修正版：代表案の採用推薦

新`after-prototype-feather/{390,1440}-normal-pressure-loss/frame-{25.3,29.5}.png`原PNG4枚と、23.8〜33.2の各50描画frame（各5sheet、計100frame）を順序通り実見した。対応recordの最大演出gapは両幅0.20833秒、成熟frameは39025.3167/29.5167、144025.3083/29.5083秒。全尺動画の鑑賞とは区別する。

判定：初稿の水平な下端が背景へなじみ、白字幕の抜けと顔/眼/両手/白銀刃の主役を保持。人物/刀を暗くせず、字穴/黒縁、重要crop、透過矩形、保留/dockとの新しい重なりに問題は見られない。列では24秒の既存cut後に減光/寄りが入り、32.2〜33秒で追加量が滑らかに減衰し、32.8秒付近でほぼ戻り、33秒で追加量0となって既存cutへ抜ける。観察した離散列で追加の構図跳び/帯点滅は見られない。24秒と33秒の元からあるcut自体を新しい不具合としない。

代表pressure外れの対象24〜33秒のデザイン案として採用を推薦する。これは#15全AC受入ではなく、必要全経路/他表示/休止操作/結果・PUSHの関連確認は後続。原画の意匠/高DPI/補間/既字幕fade/尺保持は関連source/testsも照合する。全尺鑑賞/聴感/実スマホは未検証。PM内部判定へ提出済み。

## #9の先行AC提出：28経路の場面レビューと不足cut

beforeの28recordはすべて正常取得、固定runtime不変、専用Chrome終了exit0、専用Vite停止済み。Designerは全28の`phase-sheet.png`を実見（通常/RUSH×3variant勝外れ＋通常復活/RUSHflash、両幅）。全尺動画を取得したことと、次の離散場面を実際に見たことを分ける。

| 系統 | 実見した演出秒の代表と主役/出口 | 観察/改善/未確認 |
|---|---|---|
| pressure標準（通常/RUSH・勝外れ、両幅） | 2.3対峙→6.5/14.7敵圧力→19.5構え→24.1/25.3/29.5/32.5刃と集光字幕→39.5顔と決意字幕→43.5溜め→47PUSH→50.3一閃→51.9/53.3当り表示または敗北 | 中盤の月/雲と字幕/刃の競合を#15最小改修へ。保存winによる出口差を観察。動画の全フレーム/実再生鑑賞ではない。 |
| initiative標準（通常/RUSH・勝外れ、両幅） | 2.3「道を切り拓く」→6.5先手の接触→14.7敵の反撃→19.5両者→24.1/25.3握りと「隙を、見極めろ」→29.5/32.5両者→39.5顔/「もう一度、前へ」→43.5構え→47PUSH/「月影の一閃」→50.3接触→51.9/53.3勝敗 | pressureの溜めを一律移植しない。攻撃/相手の反応を読める場面、顔/刃/字幕の保持を観察。短い動きの全過程はこの疎な列では未検証。 |
| exchange標準（通常/RUSH・勝外れ、両幅） | 2.3「刃が、交わる」→6.5刃の接触→14.7圧力→19.5敵の斬り込み→24.1/25.3「次の一撃を待つ」→29.5/32.5両者→39.5「この刃に、懸ける」両者構図→43.5構え→47PUSH→50.3接触→51.9/53.3勝敗 | 39.5で顔寄りへ統一せず両者の対立を保持。文字/刃/人物は確認場面で分離。pressure限定改修の回帰対象。 |
| pressure復活（通常・両幅） | 標準と共通の中盤/PUSH/一閃→51.9/53.3敗北→54.5「まだ、終われない」/再起→55.9当り→57.5元背景の当り | 最初の敗北で当り虹色を先行させない場面を実見。復活の告知/既素材再利用と出口は改修範囲外で維持。 |
| flash（RUSH・両幅） | .3リーチ図柄→2.2対峙→4.5構え→8.5一閃→9.8/11.5当り/元背景 | 54秒gatherとは別時間割。新減光/寄りの非適用確認対象。既存の当り拡大意匠は今回変更対象外。 |

対応sourceはpressure=`RESOLVE_CUTS`、initiative/exchange=`REACH_CUTS`、flash=`FLASH_CUTS`。先行phaseだけではreach/短い攻防/一部surge/flash vowが未被覆だったため、`coverage.initial.json`で不足を明示し、以下の新しい補助確認で閉じた。最終対応は`before/coverage.final.json`。先行不足を全尺取得だけで合格に読み替えていない。

| #9正本AC | 現時点の判定 |
|---|---|
| AC1：通常/RUSH勝外復活を場面・主役・出口で確認 | 合格推薦：28phase列＋28補助sheetをすべて実見。実source cutごとの離散場面観察を完了。直接自然時計/抽出内容同定の範囲は後段参照。全動画鑑賞・全フレーム動作保証ではない。 |
| AC2：新旧資料/音/全尺の区別 | 合格：最新beforeと旧S2資料を区別、全尺WebM取得/実見phase/対象0.2列/動画鑑賞/聴感/実機を分けて記録。 |
| AC3：最小案/タイムライン/素材再利用/files/確認方法 | 合格：本書最小案と#15試作差戻し/feather比較、24〜33限定camera/背景層、既atlas/背景/字形、timeline/viewの2files、両幅前後原PNG/描画列を提出。 |
| AC4：当落/出玉/54・58・12維持、実装は確認後 | 要件/設計の分離は合格。S3開始/PM内部設計承認後Leadが表示2filesだけ改修。Designerはゲーム/物理/音を編集していない。実装の全関連回帰は#15側で後続照合。 |

PMも新beforeの1440normal-pressure-win、390normal-pressure-revival、1440rush-pressure-flashのphase-sheetを直接実見した。PMの離散場面レビューを全動画鑑賞と書き換えない。比較galleryはPMがIABで390の両列実表示確認済み、原`comparison.html`の描画確認待ちは解除。

## #15必須6経路・操作の視覚提出

`after-final/`の12record（通常pressure標準勝/外れ/復活、RUSH pressure標準勝/外れ/flash、各2幅）のphase-sheetを全12枚実見し、before同条件と比較した。25.3/29.5で字幕の抜け・顔/握り/刃の主役分離を保持し、当落別の先行構図差はない。勝敗/復活/flashの出口に新しい背景帯や寄りが残らず、旧当り拡大意匠は今回の変更外。PMも新4条件の25.3原PNGと復活51.9/55.9、flash9.8を直接確認した。これは離散場面の視覚比較であり、全動画鑑賞ではない。

全尺12は自然進行/未PUSH、固定after301ファイル不変、errors0、captureexit0/OWNED_CHROME_CLOSED。after固定は`after-prototype-feather/after-snapshot.json`のsourcePublic SHA `c6a4c77990448c5d42ea2b1621f6de46ee69da5e599dc47f3e98329f2ad4c8a1`へ対応する。snapshot config参照helper不足の初回接続失敗は`after-server-missing-helper.log`で分離、コピーした既存helperはdev設定依存で製品src/publicを変えていない。成功recordが指すWebMだけを取得成功の根拠にする。

`after-operations/{390,1440}/record.json`は実DOMのwhole/board/lcd切替、pause→700ms保持→resume、任意PUSHクリックを記録。Designerは390whole/boardと1440pause/resume/PUSH前後の原PNGを追加実見、PMは1440whole/boardと390pause/resume/PUSH前後を実見した。全体表示は顔の細部を液晶拡大と同じ実寸で読めるとはしないが、字幕/刃/主役と筐体/操作の配置関係を保持。盤面では字の抜けと顔/刀を読め、dockへ重ならない。休止の全景暗化は既存overlayであり、字幕背後減光と混同しない。復帰後の原画/文字/構図に破綻なし。

状態照合：390pause26.0417→hold26.0417→resume26.3333、1440pause25.9083→hold25.9083→resume26.2083。PUSHは保存`pushInput.pressedAt`が39047.0333/144046.8333で受付46.5〜49.9内、クリック後49.92は既releaseAtへ進む正規処理。id/drawId100とwinfalseを維持、決着後presentation null。tool自体はクリック戻り値assertを持たないが、SM/PMが保存fieldと`pressDecisionPush`sourceで成功受付を独立照合した。撮影したPUSH文字/顔/保留/dockは非重複。自然当落/自然RUSH入賞/大当り実賞球の証明ではない。

`lcd-gather.png`は2回のlcd撮影で最後のものへ上書きされているため、最初のlcd actionの時刻の原画像として扱わず、最後のlcd action（39025.8667/144025.7583）へ対応させる。操作state前後は全10eventのJSONに保持されている。撮影全体はerrors0/exit0/Chrome閉、ownedafterVite5213停止。実機/音聴感/負荷性能は未検証。

| #15正本AC | Designerの提出判定とscope |
|---|---|
| AC1：対象cut/観察/最小案と前後対応 | 対象pressure24〜33の新baselineと実装前後対応は合格。#9は後段の補助で全cut離散場面観察を完了。対象0.2秒列の動き確認と全cutの離散観察を区別する。 |
| AC2：両幅の主役/意匠/非重複 | 合格推薦：同条件原PNGと100frame列で字幕の背景競合減/顔握り刀の小寄り、字穴/意匠保持。矩形下端は差戻し後featherで解消、PUSH保留dockの重複なし。 |
| AC3：入り保持抜け・必要経路 | 対象23.8〜33.2の新描画列と全尺場面phase12条件比較の範囲で合格推薦。各条件は自動等速連続再生を取得。全動画を鑑賞済みとはしない。未改修cutの瞬間動作/実機の全連続作画は保証しない。 |
| AC4：尺/当落/ゲーム/停止/必要tests/build/CI | 視覚の告知・保存field・実pause/PUSHは合格推薦。Leadの直接test/oracleとCIの最終判定はPMへ。最新CIの必須検証完了前は本AC全体をAcceptedにしない。 |
| AC5：実製品差分/直接test/新画面/意図/PM判定 | Leadの表示2files＋直接tests、実装commit3b502a0、PM試作差戻し/採用と本書/新証拠を提出。PMのAC別最終受入待ち。調査文書だけの成果とはしない。 |


## #9最終補助確認・#15提出の確定scope

Designerは最新`cut-coverage-sheet.png`を全28枚実見した。補助138画像の内訳は、silence16.6/attention18の直接52枚、dodge11.5/clash34.5/pressure surge36/flash vow7の直接44枚、内容から同定した動画抽出42枚（reach26枚＋先手/互角surge16枚）。既phase28枚と合わせ、実source cutごとに場面・主役・出口を観察済みとして`coverage.final.json`へ対応を残す。復活は既phase54.5/55.9/57.5も別記した。

直接画像では、先手/互角dodgeの両者の刀と体勢、silence/attentionの対峙、clashの両者構図、pressure surgeの上段刀と光、flash vowの顔/握り/刃を確認した。両幅で銀髪/青眼/衣装/刀を保持し、保留と主役の配置を分離している。flash vowは両幅とも顔が液晶下寄りで保留帯に近い既存構図として確認した。#15非対象で新しい重複とはしない。次候補では顔/握りの下端余白と保留からの視線分離を要件整理できるが、S3への追加実装/新測定は行わない。短い無字幕場面は人物配置だけで秒を推定せず、recordの前後演出秒・actual snapshot stage・source pose cutの一致で対応させた。`predictionPlan=null`の指定fixtureには固有予告cueがなく、予告の全パターン確認へ拡張しない。

抽出reachは「リーチ」の図柄文字、先手surgeは「ここで退けない」、互角surgeは「まだ終わらない」の固有表示からcutの内容を同定した。抽出時間は近傍markerと動画起点offsetからの推定であり、exact演出秒とはしない。曖昧だった短cutとpressure surge/flash vowは抽出だけで閉じず、上記直接確認へ置換した。短い攻防の瞬間動作を全フレーム連続鑑賞したことにはしない。

`short-cut-summary.json`は26条件/52枚、errors0/exit0/Chrome閉。専用batch開始guardは記録されていないため、旧mid guardをその開始証拠へ改称しない。固定before初期301と撮影後の`snapshot-guard-final.json`一致の限定対応を開示する。最終`remaining-cut-summary.json`は28条件/44枚、errors0/exit0/Chrome閉、専用開始07:49:04Z/終端07:57:15Zの301 inventory SHAが初期`5737d7…f2be3`と一致。2 viewport contextの同時取得は補助観察条件であり、性能/無負荷fpsの保証へ使わない。専用Vite5211は正常Ctrl-C終了130。再実行用toolの正確な版は各executed.mjs、sheet/最終coverage helperも原証拠へ保存した。

最終提出：#9 AC1〜4は本書の観察/要件整理scopeで合格推薦。#15 AC2/3は両幅原画像・対象100frame列・必要12経路phase・実操作の視覚scopeで合格推薦、AC5の実改修/意図/新証拠は提出済み。AC4のtests/build/最新CIを含む総合受入、AC5のPM最終判定はPM担当。最新CIの未終端を完了へ換算しない。

未検証：全動画の実再生鑑賞、全フレームの動作、実スマホ端末、音聴感、指定fixtureにない予告cue、自然RUSH入賞/出玉の証明。全尺WebMはDOM+canvas連続取得/音offで、各動画取得と実際の離散観察は別扱い。#7の人間試聴も未評価を維持する。製品source/音/素材/ゲームルールの追加変更はしていない。本書のDesigner更新をここで止め、PMの隔離取込み/最終AC判定へhandoffする。
