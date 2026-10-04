# 毛束コマの試作

参照：https://saraemi.com/1609nabiki/ （原画の動きと時間配分を参考にし、画像自体は使用していない）

組込みimage_genで作成。元画像：public/assets/lcd/moon-castle-v1.png。

- 毛束アトラス：../../public/assets/lcd/hair-strands-v1.png
- 毛束の生成指示：../../public/assets/lcd/hair-strands-v1.prompt.txt
- 固定画：../../public/assets/lcd/character-static-v1.png
- 固定画の生成指示：../../public/assets/lcd/character-static-v1.prompt.txt
- 拡大動画：hair.mp4
- 液晶全体：lcd.mp4

12コマの輪郭を切り替える。背景・顔・鎧は固定。今回、瞬き・呼吸・マントは止めて髪の検証に絞った。
検証：髪の表示範囲外の画素差0、アルファ輪郭差7025。ページエラーなし、一時停止画像一致。2テスト・ビルド成功。
