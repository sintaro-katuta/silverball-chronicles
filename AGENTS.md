# silverball-chronicles

液晶演出中心の現代的パチンコを、Web技術で実装するプロジェクト。

画面・演出・図柄・保留・演出文字・筐体連動・音の設計、参考機種調査、見た目のレビューでは、[web-pachinko-design](.agents/skills/web-pachinko-design/SKILL.md) を読み、対象に必要な参照資料だけを利用する。

仕様は `docs/pachinko.md` の冒頭にある優先関係と最新追記、見た目の採用方針は `docs/prototype/DESIGN.md` を確認する。参考機種の方式を理由に、確定したゲームルールを無断で置き換えない。過去のレビュー・スクリーンショットを現在の検証結果として扱わない。

一般Webサイト向けの装飾ルールを演出へ一律適用しない。物理・保存・出玉計算だけの変更ではデザインスキルを読む必要はない。

PlayCanvasの実装・移行では、公式の [build-app](.agents/skills/build-app/SKILL.md) と [apply-conventions](.agents/skills/apply-conventions/SKILL.md) を読み、GLB・照明・状態管理など対象に必要な公式スキルだけを追加で利用する。現在の移行範囲とEditor側の残作業は `docs/prototype/PLAYCANVAS_MIGRATION.md` を確認する。

クラウド運用（2026-09-25 ユーザー指示）：開発・見た目調整はローカルで進める。クラウドへのアップロード・更新は最後にまとめる方針とし、ユーザーの新たな明示許可があるまで行わない。以前の3ファイル送信許可は今後の送信許可として扱わない。

ドキュメント配置：仕様・設計・調査・レビュー・文字起こしなどのプロジェクト資料は `docs/` 配下へ追加する。索引は [docs/README.md](docs/README.md)。画像・動画・実行用HTML・検証ログ・設定ファイル、スキル定義は用途に応じて既存の場所に保持する。
