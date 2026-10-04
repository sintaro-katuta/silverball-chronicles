# 公開Unityパチンコ5件と現行SAO Unityの比較

2026-09-26。GitHub公開README、再帰ファイル一覧、ProjectVersion、主なC#、選択Prefab/Sceneを取得して静的確認。ogg17とSpriteのREADME掲載画像を目視。外部プロジェクトをUnityで実行してはいない。コードは /tmp/pachinko-repo-review に調査用保存し、現行ゲームへ取り込んでいない。

|対象|Unity|実際に確認した内容|現行との差|
|---|---|---|---|
|[JackallDigital/Pachinko](https://github.com/JackallDigital/Pachinko)|2021.3.23f1|3D Rigidbody/SphereColliderの球、100球の落下、サイズ別得点、箱で集計。SceneはCube/Cylinder中心|日本の液晶機の保留・ST・賞球を再現する設計ではない。物理基盤は現行と同じ3D系|
|[ogg17/Pachinko-Game](https://github.com/ogg17/Pachinko-Game)|2022.3.17f1|2D球、赤/緑の穴、状態機械、DI、イベントバス、玉プール、移動障害物。作者はグラフィックより構造の参考と説明|筐体モデルとして最も近いという紹介は不適切。サービス分割と球再利用の設計に参考価値|
|[EjderAysun/Sprite-Pachinko](https://github.com/EjderAysun/Sprite-Pachinko)|2021.3.4f1|2D色付き球・多数の板、周期的生成、画面外破棄。作者も非現実的な物理テストと説明|金属・透明樹脂・筐体造形の参考ではない。最小の2D衝突例|
|[tanabee/pachinko](https://github.com/tanabee/pachinko)|5.0.1f1|3Dの力を加える球、回転障害物、Goalで位置を戻す。機能ごとにSceneが分離|個別機構の実験方法は有用。現代機の完成モデルではない|
|[AmanpreetSingh-GitHub/Pachinko-2D](https://github.com/AmanpreetSingh-GitHub/Pachinko-2D)|2021.3.1f1|2D素材、Obstacle/FallingBalls/CatchersのScene構成、Prefab。公開ツリー内のC#は0件|素材配置によるサンプル。保留からRUSHまでのコード基盤は確認できない|

5件とも調べたツリーにFBX/OBJ/Blend/GLBファイルはなし。ただしその事実だけで3D表示なしとは判断しない（Unity組込形状やScene内データで3Dは可能）。確認した内容にはSAOの透明成形部品・FAIR・現代筐体の精密モデルはなかった。

## 今の実装との差

- 現行はUnity6000.4.6f1、3D Rigidbody/SphereCollider/PhysicsMaterial。金属玉と物理の基盤はすでにある。2Dサンプルへ置換しても筐体の造形は改善しない。
- 現行はRulesで保留・抽選・ST53/70・入賞賞球・BONUS後演出待機を管理。5件の主目的は落下先スコアや物理練習であり、対象ルールが異なる。
- 現行の通常球は物理運動。ただしFAIR搬送はFairGuidedBallがisKinematicを有効にし指定経路を移動する近似。表示された成形通路との整合性が別途必要。
- 現行の球はYozoraMachineでInstantiate、BallBodyでDestroy。ogg17の玉再利用という方針は学べるが、そのObjectPool.CreatePoolは生成物を管理リストへ登録していない。無検証で丸ごと流用しない。性能改善が必要なら現行のreset/消費/FAIR状態を消去する独自プールとして実装・計測する。
- 現行の筐体はBuilderで基本形状と手続きメッシュを生成する。近似形状のまま溝やネジを増やしても根本のシルエットは変わらない。専用メッシュの輪郭・曲面・肉厚・接合を参照画像から合わせる工程が不足している。

## 採用候補と採用しないもの

参考にするのは、部品単位の独立Scene、球の再利用、表示/入力/ルールの責務分離。現在の目的で優先するのは、FAIR専用造形と固定カメラ比較。DOTween/UniRx/UniTask導入や基盤の全面置換は、筐体外観改善の直接手段ではない。

## ライセンス確認範囲

SpriteはREADMEとルートLICENCEでMITを確認。含まれる第三者素材の条件は個別確認が必要。他4件は今回の公開ツリーにルートライセンスを確認できなかった。公開閲覧できることと、そのまま組み込めることは分ける。今回は調査のみで移植なし。

## 読んだ主なコード

- [Jackall SpawnPachinkoBalls](https://github.com/JackallDigital/Pachinko/blob/main/Assets/Scripts/SpawnPachinkoBalls.cs)、[CountPachinkoBalls](https://github.com/JackallDigital/Pachinko/blob/main/Assets/Scripts/CountPachinkoBalls.cs)
- [ogg17 Balls](https://github.com/ogg17/Pachinko-Game/tree/master/Assets/_App/Scripts/Game/Balls)、[ObjectPool](https://github.com/ogg17/Pachinko-Game/blob/master/Assets/_App/Scripts/Core/ObjectPoolModule/ObjectPool.cs)
- [Sprite Scripts](https://github.com/EjderAysun/Sprite-Pachinko/tree/main/Assets/Scripts)
- [tanabee Ball](https://github.com/tanabee/pachinko/blob/master/Assets/BallUp/Ball.cs)、[Goal](https://github.com/tanabee/pachinko/blob/master/Assets/Goal.cs)
- [Amanpreet Assets](https://github.com/AmanpreetSingh-GitHub/Pachinko-2D/tree/main/Assets)
