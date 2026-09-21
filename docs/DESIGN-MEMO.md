# nondesu 公式サイト — 設計メモ（一本化）

> 2026-09-21 作成。理念・ブランド・コンテンツ方針・lit.link 監査結果を1本に集約。  
> 詳細原文は各参照ファイルを見ること。

---

## 1. サイト概要（のんです / nondesu.com とは）

**のんです**（Nondesu）— 歌い手・作家・イラストレーター。可愛くて少し不思議な作品をつくる。

| 項目 | 内容 |
|------|------|
| 公開 URL | [nondesu.com](https://nondesu.com/) |
| 技術 | Astro + Decap CMS、GitHub push → Cloudflare Pages |
| 役割 | **公式ハブ** — lit.link の鏡写しではなく、作品の棚と遊べる部屋 |
| 主要ページ | `/` · `/profile` · `/portfolio` · `/commissions` · `/releases/[slug]/` · `/ichiyakanon/` |

---

## 2. 理念・コンセプト（おもちゃ箱）

> 「このサイトは、作品の棚と、遊べる部屋を兼ねた **おもちゃ箱** です。」  
> — `src/content/profile/nondesu.yaml`

- **作品の棚** — curated なポートフォリオ（全作品ダンプではない）
- **遊べる部屋** — EP 特設ページのミニゲーム（`GameShell` + `CollectGame`）
- **育て方** — 歌・言葉・絵を行き来し、インターネットの友だちと作品を育てる
- **名義の分離** — のんです本体 / 苺茶かのん（`/ichiyakanon/`）/ 魔女方式（将来リンクのみ）

lit.link は連絡先・依頼情報の参照源。**公式サイトがハブ**になる設計。

---

## 3. ブランド・ビジュアル

テーマ: `src/styles/themes/nondesu.css` · トークン: `src/styles/tokens.css`

**色** — パステル・ステッカー感。`--cream`/`--paper`（背景）、`--ink`/`--ink-soft`（本文）、`--strawberry`/`--strawberry-deep`（アクセント）、`--mint`/`--lemon`/`--lavender`/`--sky`（装飾）。radial-gradient 背景 + `--shadow-card` で軽い立体感。

**Typography** — 本文: Noto Sans JP / 見出し: M PLUS Rounded 1c（丸ゴ系）。

**トーン** — かわいい・親しみやすい（lit.link のパステル感と整合）。可読性優先（⟡.· 等の過剰装飾は Skip）。角丸・ステッカー風バッジで「おもちゃ箱」感。

---

## 4. コンテンツ構成

本番 CMS: カスタム admin · `https://admin.nondesu.com/` · 詳細 [`docs/CUSTOM-ADMIN.md`](CUSTOM-ADMIN.md) · コンテンツは `src/content/`

| コレクション | パス | ページ |
|-------------|------|--------|
| **works** | `src/content/works/` | `/portfolio` — music / illustration / writing、タグ・featured・embed |
| **profile** | `src/content/profile/nondesu.yaml` | `/profile` — bio・roles・SNS |
| **releases** | `src/content/releases/` | `/releases/[slug]/` — EP 特設 + ミニゲーム |
| **events** | `src/content/events/` | `/ichiyakanon/` — 苺茶かのん イベント |
| **goods** | `src/content/goods/` | `/ichiyakanon/` — 苺茶かのん グッズ |

`/commissions` は CMS 外 — 要約公開（全文は `docs/references/commissions-memo.md`）。Portfolio は Vocal / Lyrics / Cover カテゴリ思想でフィルタ。

---

## 5. 文案・トーン（依頼ページ・公開方針）

参照: `docs/references/commissions-memo.md`

**ライブ（`/commissions`）に載せる — 要約のみ**

- 受付状況 · 連絡先（X `@_Non_desu_` DM / `nondesu0816@gmail.com`）
- 支払い（PayPal · 銀行振込 · PayPay）· 10% off（納期2ヶ月以上＋前払い、目立ちすぎない1行）
- カテゴリ4分類 + 代表料金・納期: ボーカル / 作詞 / 映像 / イラスト
- 「お見積もりのみ・該当外も相談可」· 受付の流れ

**載せない / 後日** — Commission 全文、イラスト A–D 料金表（画像未提供 → 「準備中」）、⟡.· 多用、※ 注記全文。

**文案ルール** — かわいさは残しつつ読みやすさ優先。絵文字・記号は見出し・バッジ程度。料金は「〜」表記。フォーム種別: ボーカル / 作詞 / 映像 / イラスト / その他。

---

## 6. lit.link からの設計判断

参照: `docs/references/litlink-notes.md`（2026-09-21 監査）

**Adopt** — X `@_Non_desu_` · メール · 依頼4分類 · 支払い/10% off · Portfolio カテゴリ思想 · クレジット表記 · YouTube/BOOTH · 苺茶かのん/魔女方式は別導線 · 依頼と作品の分離。

**Defer** — 全作品リスト · イラスト tier 画像 · Skeb/piapro 役割 · ほしい物リスト · Gallery グリッド · 生年月日/星座 · トップ MV · 長いクレジット文。

**Skip** — lit.link 依存 · 50件超リンクダンプ · プラットフォーム UI · 過剰装飾 · Commission 全文 · 他名義 discography · 未確認 SNS。

**UX** — 借りる: パステル・ステッカー感、カテゴリ excerpt、依頼/作品分離。借りない: 1ページ全積み、埋め込み動画連続、外部ボタン列。

---

## 7. エージェント向け：参照ファイル一覧

| 用途 | パス |
|------|------|
| プロフィール・おもちゃ箱概念 | `src/content/profile/nondesu.yaml` |
| lit.link 監査 | `docs/references/litlink-notes.md` |
| 依頼文案・公開方針 | `docs/references/commissions-memo.md` |
| ブランド色・テーマ | `src/styles/themes/nondesu.css` |
| デザイントークン・フォント | `src/styles/tokens.css` |
| カスタム admin（本番 CMS） | `docs/CUSTOM-ADMIN.md` · `src/pages/admin/` |
| 依頼フォーム API | `functions/api/contact.ts` |
| 技術・デプロイ | `README.md` |
| エージェント境界 | `AGENTS.md` · `../WORKSPACES.md` |

**管轄**: `nondesu/` は **nondesuwebエージェント** 領域。Kakuly.github.io とは別 Git。

---

## 8. SITE / デプロイ

```bash
cd nondesu && npm install && npm run dev   # http://127.0.0.1:4321
```

- **SITE → のんです**: dev 起動時 CMS iframe（`:4321/admin/`）— Phase A
- **本番 CMS**: GitHub OAuth → commit → 自動デプロイ — Phase B（`docs/DECAP-CMS-PRODUCTION.md`）
- **本番**: GitHub push → Cloudflare Pages（`npm run build` → `dist`）
- **環境変数**: `CONTACT_EMAIL` · Turnstile（任意）· `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- **ドメイン**: nondesu.com（取得前は `*.pages.dev` → 取得後 `admin.nondesu.com`）
