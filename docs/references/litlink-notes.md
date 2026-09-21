# lit.link 監査メモ — https://lit.link/non_desu

> 2026-09-21 取得。公式サイト設計の参照用。**lit.link の鏡写しにしない**。

---

## ページ概要

| 項目 | 内容 |
|------|------|
| タイトル | のんです lit.link |
| 表示名 | - Nondesu - |
| 自己紹介 | 2004.08.16 しし座♌︎ / 歌・イラスト・作詞・mix・動画・Live2Dモデリングなど / since2018 |
| ビジュアル | パステルピンク基調、リボン・ハート背景、⟡.· 装飾、縦スクロールのリンクカード |
| トーン | 非常にカワイイ・親しみやすい・情報密度高め |

---

## セクション構成（lit.link 上）

1. **プロフィールヘッダ** — アイコン、名前、SNS アイコン行、短い bio
2. **フィーチャー MV** — Colorful / Kakuly feat.のんです（YouTube 埋め込み）
3. **主要リンク** — YouTube / Skeb / piapro / BOOTH / Amazon ほしい物リスト
4. **苺茶かのん** — Melty Magic MV、X、lit.link 子ページ
5. **魔女方式** — MV、X、公式サイト
6. **Commission** — 依頼全文（料金・連絡先・支払い）
7. **イラスト tier A–D** — 各タイプ名・価格・サムネ
8. **Portfolio** — YouTube プレイリスト（Vocal / Lyrics / Cover）＋ 個別クレジット付き作品列
9. **Gallery** — イラスト・グッズ等の画像グリッド

---

## リンク一覧（抽出）

### のんです本体

| ラベル | URL |
|--------|-----|
| YouTube | https://www.youtube.com/@Nondesu |
| Skeb | https://skeb.jp/@_Non_desu_ |
| piapro | https://piapro.jp/N_Eda_mame_mame |
| BOOTH | https://nondesu.booth.pm/ |
| Amazon ほしい物 | https://www.amazon.jp/hz/wishlist/ls/2V8IRSI9B2KL7 |
| メール | nondesu0816@gmail.com |
| X（依頼 DM） | @_Non_desu_ |

### 関連名義

| 名義 | 主なリンク |
|------|-----------|
| 苺茶かのん | lit.link 子ページ、X @Ichiya-Kanon 系、YouTube |
| 魔女方式 | X @Majo_Hoshiki、公式サイト |

### Portfolio プレイリスト（YouTube）

- Vocal：のんです
- Lyrics：のんです
- Cover：のんです

（各プレイリスト URL は lit.link 上にあり。公式サイトでは `/portfolio` のカテゴリフィルタや外部リンク1本に集約する方がよい）

---

## 採用する（Adopt）— 公式サイト向き

| 要素 | 理由 | 反映先の目安 |
|------|------|-------------|
| 正しい X ハンドル `@_Non_desu_` | 連絡窓口として明記 | 依頼ページ、プロフィール、フッター |
| メール `nondesu0816@gmail.com` | 依頼・問い合わせの実アドレス | env / フォーム / mailto |
| スキル一覧の粒度 | 歌・作詞・mix・映像・Live2D・イラスト | プロフィール roles（段階的） |
| 依頼カテゴリ4分類 | ボーカル / 作詞 / 映像 / イラスト | `/commissions` 要約、フォーム種別 |
| 支払い方法・10% off 条件 | 依頼者が知りたい実務情報 | `/commissions` 要約 |
| YouTube・BOOTH | 既にサイト CMS に近い | profile SNS（既存） |
| Portfolio の **カテゴリ分け思想** | Vocal / Lyrics / Cover / Illustration 等 | `/portfolio` タグ・フィルタ設計 |
| 代表作の **クレジット表記** | 「♡ボーカル：のんです #…」形式 | 各 work の excerpt / links |
| 苺茶かのん・魔女方式は **別導線** | 名義が異なる | 既存 `/ichiyakanon/` ＋ 将来ユニットページ |
| 受付の流れ・相談歓迎の姿勢 | UX として自然 | 依頼ページ |

---

## 後で決める（Defer）

| 要素 | 理由 |
|------|------|
| lit.link 全作品リストの移植 | 件数が多く、公式サイトは curated 棚が目的 |
| イラスト A–D 料金表＋画像 | 参照画像未提供。lit.link から tier 名・価格はメモ済み |
| Skeb / piapro の扱い | 依頼経路が複数。公式で Skeb を primary にするか要方針 |
| Amazon ほしい物リスト | ファン向け。フッター1リンク vs 載せない |
| Gallery グリッド | ポートフォリオと重複。公式 `/portfolio` で代替可能 |
| 生年月日・星座 | プロフィールに載せるかは本人判断 |
| Colorful MV をトップフィーチャーにするか | ヒーロー vs 最新 works のどちらを主役にするか |
| 各作品の長いクレジット文 | work ごとに要約 vs 全文 |

---

## 載せない（Skip）— lit.link 専用でよいもの

| 要素 | 理由 |
|------|------|
| lit.link 自体への依存 | 公式サイトがハブになる |
| 縦長リンクカード50件超の一覧 | ナビ/ホームがリンクダンプになる |
| lit.link ログイン・QR・広告 UI | プラットフォーム機能 |
| ⟡.· 記号の全文装飾 | 公式はおもちゃ箱トーンだが可読性優先 |
| Commission 全文のコピペ | 参照メモに退避済み。ライブは要約のみ |
| 魔女方式 / 苺茶かのんの **詳細 discography** | 各名義の公式 or lit.link 子ページへ |
| TikTok / Instagram（スナップショットにアイコンあり） | URL 未確認。必要なら本人確認後 |

---

## デザイン・UX の借りどころ

**借りる**

- パステル・ステッカー感（サイト既存テーマと整合）
- カテゴリごとの短いキャッチ（「cover からオリジナル曲まで」等）→ カード excerpt に
- 依頼と作品を **別ブロック** に分ける情報設計

**借りない**

- 1ページにすべてを積む lit.link 型レイアウト
- 埋め込み動画の連続（公式は work 詳細ページで1本ずつ）
- 外部プラットフォーム色の強いボタン列

---

## 公式サイトとの対応表

| lit.link | 公式サイト（現状 / 方針） |
|----------|-------------------------|
| Commission | `/commissions`（要約公開、全文は docs） |
| Portfolio | `/portfolio` ＋ works CMS |
| Gallery | works `gallery` / illustration カテゴリ |
| Profile bio | `/profile` ＋ `profile/nondesu.yaml` |
| 苺茶かのん | `/ichiyakanon/` |
| 魔女方式 | 未作成 → defer（リンクのみ将来） |
| YouTube プレイリスト | profile or portfolio 外部リンク1本 |
| Skeb | defer（プロフィール SNS に追加するか要判断） |
