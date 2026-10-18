# スプリント8の試射記録

短比較3件の全原始データと条件、事前不実行の理由、媒体検証を保存しています。結果と採否はdocs/agile/S8_RESULTS.mdを参照してください。

大きな媒体検証JSONは差分を読みやすくするため、実行したbytesを変えずgzipで保存しています。対応する元パス・圧縮/展開SHAとサイズはMEDIA_ARCHIVES.jsonです。これらのJSONを読むツールを再実行する場合、まず次で元の場所へ展開してください。既存ファイルは上書きせず、一致を検査します。

```python
import gzip, hashlib, json
from pathlib import Path
root = Path("prototype/reference-review/s8-20261016")
for item in json.loads((root / "MEDIA_ARCHIVES.json").read_text())["files"]:
    raw = gzip.decompress((root / item["archive"]).read_bytes())
    assert hashlib.sha256(raw).hexdigest() == item["sha256"]
    path = root / item["path"]
    if path.exists():
        assert path.read_bytes() == raw
    else:
        path.write_bytes(raw)
```

MP4原素材とPNGはローカルに保持し、最終説明MP4はPRへ掲載する運用です。失敗した媒体取得は成功証拠へ混ぜず、ローカルの別フォルダに保持しています。
