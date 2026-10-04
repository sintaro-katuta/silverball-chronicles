# 毛束の曲線を描き直した版

組込みimage_genで16コマを生成。入力：character-coherent-v1.png。

- 拡大動画：character.mp4
- 液晶全体：lcd.mp4
- 素材：../../public/assets/lcd/character-flow-v1.png
- 生成指示：../../public/assets/lcd/character-flow-v1.prompt.txt

4列4行、8fps、2秒で一周。人物全体が同じコマ、背景は固定。髪の曲がりを根元から毛先へ送る構成。
検証：背景の画素変化0、髪上辺平均の変化幅16.4px、停止時画像一致、ページエラーなし、2テスト・ビルド成功。
動きの自然さ・振幅・細部の採用はユーザー確認待ち。
