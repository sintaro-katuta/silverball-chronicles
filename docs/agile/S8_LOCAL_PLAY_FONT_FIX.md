# ローカル試遊の盤面起動エラーを修正

## やりたいこと

ユーザーが案内済み http://127.0.0.1:5437/ から通常遊技を開始し、今回の釘配置で玉を打てること。ページのHTTP200だけを起動確認にしない。

## 原因と修正

隔離checkoutのnode_modulesを既存作業場所と共有したため、フォントの実パスがViteのworkspace外になり、4つのwoff/woff2要求が403になっていました。document.fonts.loadのNetworkErrorでmountBoardが失敗し、ユーザーとChrome再現の両方で盤面起動が止まりました。

Viteの既存workspace範囲を保持し、@fontsource/dotgothic16/filesの解決済み実パスだけをserver.fs.allowへ追加。strictを無効化したり親ディレクトリ全体を許可しません。設定根拠は[Vite公式](https://vite.dev/config/server-options#server-fs-allow)。残ったfavicon.icoの404は空のdataアイコン指定で解消しました。釘/球/狙い/物理・資産loaderの挙動は変更していません。

## 今回の検証

- 実装HEAD 1c584b70ff8a4cc2678deb24b77fa6da71ea011a。
- 通常URL（review指定なし）を1440×900と390×844で実操作し、各5発の実発射・5球のinFlight・font ready・通常modeを確認。停止/再開成功、console/page/HTTPエラー0。
- 同じ2幅で採用101釘の全属性/位置・3枚/皿なし、0.18→0.24→0.18の実発射、停止の時刻凍結、退出/再入場後の非累積を別途確認。全4枚PNGを保存、源/資産/設定/HTML/runner/HEAD始終一致。
- PMは通常遊技のPC画面PNGを実見し、盤面・外枠・操作欄・3枚風車と発射状態を確認。初回の失敗記録は保持。
- 関連5テスト成功、releaseビルド成功。全680unitと旧CIの成功は前の製品srcに対する記録として保持し、今回config/HTML版の全unit/新CIは未実行・確認待ち。

証拠は prototype/reference-review/s8-20261018/ の user-play-load-repro（元403）、user-play-font-fixed（favicon404を残した中間）、user-play-normal-fixed（通常2幅成功）、user-play-visual-fixed（配置/操作2幅成功）。測定済み67/750を今回再試射した扱いにはしません。ローカル設定更新のみで本番公開なし。PR動画の新台本は承認待ち。
