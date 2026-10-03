# 盤面へ入る玉：遊技者視点への修正

ユーザー指摘を受け、発射装置・上昇レーンを見せる前案を撤回。現在のlauncher-pixi.htmlは盤面上部だけを表示し、固定の筐体開口で玉・釘をクリップする。共通28px銀玉・倍率3、既存Physicsの発射点・速度・軸・レール判定は維持。下から出現する玉や発射装置自体は描画しない。枠は確認用の仮表示。

- 最新動画: player-view-demo.mp4
- 最新画像: entry.png / player-view.png
- 最新検証: verification-player-view.json
- capture.mjs: 内部で発射中でも盤面に玉が出る前は表示0、盤面への流入、隠れたレーンを進む玉の存在、発射定義・レール座標の維持、ポーズ、エラーなしを確認

古いlower.png / upper.png / launcher-demo.mp4とverification.jsonは内部機構を見せた旧案の履歴であり、現在の遊技者視点の検証として扱わない。internal-mechanism-demo.mp4 / internal-preview-source.txtも旧案の記録。

資料：
- https://patents.google.com/patent/JP6195742B2/ja — 前面扉で覆い隠される設置部に発射装置
- https://patents.google.com/patent/JP2004313429A/ja — 誘導レールの一部が前面枠で覆い隠される構成
- https://www.sammy.co.jp/japanese/factory/pachinko/photo/ — 盤面と発射装置などの外枠の組立工程

これらは構造例の根拠。全機種の視認範囲を一律に断定するものではない。今回の台では発射機構を枠裏に隠す方針。独立描画試作であり、本編への組込み・賞球・保存は含まない。
