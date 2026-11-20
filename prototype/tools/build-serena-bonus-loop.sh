#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Join the already approved charge and bonus clips. Repeating both inputs makes
# it possible to trim between matching points in the transition at the loop seam.
ffmpeg -v error -y \
  -i src/assets/video/serena-charge.mp4 -i src/assets/video/serena-bonus.mp4 \
  -i src/assets/video/serena-charge.mp4 -i src/assets/video/serena-bonus.mp4 \
  -filter_complex '[0:v]fps=24,trim=duration=5,setpts=PTS-STARTPTS,format=yuv420p[a0];[1:v]fps=24,trim=duration=8,setpts=PTS-STARTPTS,format=yuv420p[b0];[2:v]fps=24,trim=duration=5,setpts=PTS-STARTPTS,format=yuv420p[a1];[3:v]fps=24,trim=duration=8,setpts=PTS-STARTPTS,format=yuv420p[b1];[a0][b0]xfade=transition=fade:duration=0.4:offset=4.6[ab];[ab][a1]xfade=transition=fade:duration=0.4:offset=12.2[aba];[aba][b1]xfade=transition=fade:duration=0.4:offset=16.8,trim=start=4.6:end=16.8,setpts=PTS-STARTPTS,format=yuv420p[v]' \
  -map '[v]' -an -c:v libx264 -preset medium -crf 17 -movflags +faststart src/assets/video/serena-bonus-extended.mp4
