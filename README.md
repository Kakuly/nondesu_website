# nondesu 公式サイト

歌い手／作家／イラストレーター **のんです** の公式サイトです。Astro で構築し、GitHub 経由で Cloudflare Pages にデプロイします。

## サイト構成

| ページ | URL |
|--------|-----|
| ホーム | `/` |
| プロフィール | `/profile` |
| ポートフォリオ | `/portfolio` |
| 依頼 | `/commissions` |
| EP 特設 | `/releases/internet_friends_EP/` |
| 苺茶かのん | `/ichiyakanon/` |
| CMS | `/admin/` |

## 必要なもの

- [Node.js](https://nodejs.org/) 20 以上
- [GitHub](https://github.com) アカウント
- [Cloudflare](https://dash.cloudflare.com/) アカウント

## ローカル開発

```bash
cd "/Users/kakuly/Documents/portfolio/nondesu"
npm install
npm run dev
```

http://127.0.0.1:4321 を開きます。

ビルド:

```bash
npm run build
npm run preview
```

Cloudflare Pages と同じ Functions 付きプレビュー:

```bash
npm run build
npm run pages:dev
```

## Cloudflare Pages デプロイ

GitHub に push 後、Cloudflare Dashboard で設定します。

| 項目 | 値 |
|------|-----|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

### Environment variables

Cloudflare Pages の **Settings → Environment variables** に設定:

| 名前 | 用途 |
|------|------|
| `GITHUB_CLIENT_ID` | Decap CMS — GitHub OAuth（Phase B 本番 CMS） |
| `GITHUB_CLIENT_SECRET` | Decap CMS — GitHub OAuth |
| `CONTACT_EMAIL` | 依頼フォームの宛先 |
| `PUBLIC_TURNSTILE_SITE_KEY` | （任意）Turnstile サイトキー |
| `TURNSTILE_SECRET_KEY` | （任意）Turnstile シークレット |

`.env.example` を参照してください。

### 独自ドメイン（nondesu.com）

1. ドメインを取得
2. Cloudflare Pages プロジェクト → **Custom domains**
3. `nondesu.com` を追加し、DNS 案内に従う

ドメイン取得前は `https://nondesu.pages.dev` などの `*.pages.dev` URL で公開できます。

## Decap CMS（/admin）

のんです本人もブラウザから内容を更新できます（**Phase B — 本番**）。Mac 常時起動は不要。

| Phase | 用途 | URL |
|-------|------|-----|
| **A（dev）** | Site Studio iframe・ローカル開発 | `http://127.0.0.1:4321/admin/`（`npm run dev` 必須） |
| **B（production）** | GitHub OAuth → commit → 自動デプロイ | MVP: `https://<project>.pages.dev/admin/` → 将来 `https://admin.nondesu.com/admin/` |

**セットアップ手順（OAuth App・環境変数・検証・ドメイン移行）**: [docs/DECAP-CMS-PRODUCTION.md](docs/DECAP-CMS-PRODUCTION.md)

要点:

1. [public/admin/config.yml](public/admin/config.yml) の `YOUR_USER/nondesu` を実リポジトリに変更
2. GitHub OAuth App — callback は **`{CMS origin}/api/callback`**（`/admin/` ではない）
3. Cloudflare に `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` を設定
4. `/admin/` から Login with GitHub → 編集 → Publish

保存すると GitHub に commit され、Cloudflare Pages が自動再デプロイします。

## コンテンツの編集（開発者向け）

| 種類 | 場所 |
|------|------|
| プロフィール | [src/content/profile/nondesu.yaml](src/content/profile/nondesu.yaml) |
| 作品 | [src/content/works/](src/content/works/) |
| EP | [src/content/releases/](src/content/releases/) |
| 苺茶かのん イベント | [src/content/events/](src/content/events/) |
| 苺茶かのん グッズ | [src/content/goods/](src/content/goods/) |

## ミニゲーム（EP ページ）

`/releases/[slug]/` は `GameShell` + `CollectGame` の構成です。新しい EP は:

1. `src/content/releases/` に Markdown を追加
2. `slug` フィールドで URL を指定（例: `internet_friends_EP`）
3. 必要なら `src/components/games/` にゲームコンポーネントを追加

## 依頼フォーム

`/commissions` から `/api/contact`（Cloudflare Pages Function）へ POST します。X DM / メールリンクも併設しています。

本番でメール自動転送を有効にする場合は、Cloudflare Email Routing や MailChannels 連携を [functions/api/contact.ts](functions/api/contact.ts) に追加してください。

## プロジェクト構成

```
.
├── src/
│   ├── components/     # UI・ゲーム・フォーム
│   ├── content/        # 作品・プロフィール等
│   ├── layouts/
│   ├── lib/games/
│   ├── pages/
│   └── styles/         # デザイントークン・テーマ
├── public/
│   ├── admin/          # Decap CMS
│   └── assets/
├── functions/api/      # 依頼フォーム + Decap OAuth (auth, callback)
├── astro.config.mjs
└── wrangler.toml
```

## 初回 Git push

```bash
git add .
git commit -m "nondesu 公式サイト: Astro + おもちゃ箱デザイン"
git remote add origin git@github.com:YOUR_USER/nondesu.git
git push -u origin main
```

`YOUR_USER` は自分の GitHub ユーザー名に置き換えてください。
