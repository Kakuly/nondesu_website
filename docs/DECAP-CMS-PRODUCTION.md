# Decap CMS 本番運用（Phase B）

> Mac を常時起動せず、GitHub OAuth → 編集 → commit → Cloudflare Pages 自動デプロイ。  
> Phase A（SITE ハブ iframe / ローカル dev）は**開発用**として残し、本番編集は Phase B を使う。

---

## Phase A vs Phase B

| | Phase A（dev） | Phase B（production） |
|--|----------------|----------------------|
| **用途** | Kakuly Site Studio の iframe、ローカル `npm run dev` | のんです本人・運用者がブラウザから本番編集 |
| **URL** | `http://127.0.0.1:4321/admin/`（dev 必須） | `https://admin.nondesu.com/`（→ `/admin/`）· MVP: `*.pages.dev/admin/` |
| **認証** | なし（dev）または本番 OAuth を dev から試す | GitHub OAuth（Cloudflare Functions） |
| **保存先** | ローカルファイル / 手動 commit | GitHub リポジトリへ直接 commit |
| **デプロイ** | 手動 push | Cloudflare Pages 自動ビルド |

**SITE ハブ（`Kakuly.github.io/admin/`）は Phase A のまま触らない。** Phase B は追加であり、置き換えではない。

---

## アーキテクチャ

```
編集者ブラウザ
  └─ /admin/  (Decap CMS UI)
       └─ Login → /api/auth  (Pages Function)
            └─ GitHub OAuth
                 └─ /api/callback  (Pages Function → token を CMS に返す)
                      └─ Decap CMS が GitHub API で commit
                           └─ Cloudflare Pages が main をビルド → 公開サイト更新
```

- **backend**: `github`（Netlify Identity / git-gateway は使わない）
- **OAuth プロキシ**: 同一 Pages プロジェクトの `functions/api/auth.ts` / `callback.ts`
- **公開サイト**: `site_url` / `display_url` は `https://nondesu.com`（プレビュー用）

---

## 事前準備チェックリスト

- [x] GitHub リポジトリ [`Kakuly/nondesu_website`](https://github.com/Kakuly/nondesu_website) — `main` に push 済み
- [x] [public/admin/config.yml](../public/admin/config.yml) の `repo: Kakuly/nondesu_website`
- [ ] Cloudflare Pages プロジェクトを GitHub リポジトリに接続
- [ ] GitHub OAuth App 作成（下記）
- [ ] Cloudflare 環境変数 `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` 設定
- [ ] 編集権限を持つ GitHub アカウントを Collaborator に追加（または owner 本人のみ）

---

## 1. config.yml の設定

```yaml
backend:
  name: github
  repo: Kakuly/nondesu_website
  branch: main
  auth_endpoint: api/auth   # → {CMS の origin}/api/auth

site_url: https://nondesu.com
display_url: https://nondesu.com
```

- **`repo` / `branch`**: commit 先。`main` 保護は後述。
- **`auth_endpoint`**: `base_url` 未指定時、CMS を開いた **同じ origin** の `/api/auth` を使う。
- **`site_url`**: 公開サイト URL（プレビューリンク）。ドメイン未取得時も `nondesu.com` のままで可（取得後に有効化）。

---

## 2. GitHub OAuth App

[GitHub → Settings → Developer settings → OAuth Apps → New OAuth App](https://github.com/settings/applications/new)

| 項目 | MVP（pages.dev） | 本番（ドメイン取得後） |
|------|------------------|------------------------|
| **Application name** | `nondesu CMS (dev)` など | `nondesu CMS` |
| **Homepage URL** | `https://<project>.pages.dev/admin/` | `https://admin.nondesu.com/admin/` |
| **Authorization callback URL** | `https://<project>.pages.dev/api/callback` | `https://admin.nondesu.com/api/callback` |

**重要**: callback は **`/admin/` ではなく `/api/callback`**。OAuth App には **callback URL を複数登録できない**ため、MVP と本番で **別 OAuth App** を作るか、本番 cutover 時に callback を差し替える。

推奨:

1. **MVP 用 App** — callback: `https://nondesu-website.pages.dev/api/callback`
2. **本番用 App** — callback: `https://admin.nondesu.com/api/callback`（cutover 時に Client ID/Secret を Cloudflare 側で差し替え）

作成後 **Client ID** と **Generate a new client secret** の **Client Secret** を控える。

---

## 3. Cloudflare Pages 環境変数

Dashboard → **Workers & Pages** → プロジェクト `nondesu` → **Settings** → **Environment variables**

| 名前 | 値 | Production | Preview |
|------|-----|------------|---------|
| `GITHUB_CLIENT_ID` | OAuth App の Client ID | ✓ | ✓（Preview CMS を試す場合） |
| `GITHUB_CLIENT_SECRET` | OAuth App の Secret | ✓ | ✓ |
| `CONTACT_EMAIL` | `nondesu0816@gmail.com` | ✓ | ✓ |

- Secret は **Encrypt** を推奨。
- `.env.example` を参照。`wrangler.toml` や git に secret を書かない。

---

## 4. Cloudflare Pages ビルド設定

| 項目 | 値 |
|------|-----|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

`functions/` は Pages が自動検出。追加設定不要。

---

## 5. MVP 検証（`*.pages.dev`）

Cloudflare Pages URL: **`https://nondesu-website.pages.dev`**（プロジェクト名 `nondesu-website`）。

### 手順

1. `config.yml` の `repo` を実リポジトリ名に更新して push
2. OAuth App（MVP）の callback を `https://<project>.pages.dev/api/callback` に設定
3. Cloudflare に `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` を設定
4. Pages がデプロイ完了するまで待つ
5. ブラウザで `https://<project>.pages.dev/admin/` を開く
6. **Login with GitHub** → リポジトリへの write 権限を許可
7. テスト: プロフィールの短い紹介を1文字変更 → **Publish** → GitHub に commit されること
8. Pages が再ビルドされ、数分後に公開サイトに反映されること

### トラブルシュート

| 症状 | 確認 |
|------|------|
| Login 後にエラー | callback URL が OAuth App と完全一致しているか（末尾スラッシュなし） |
| 500 on `/api/auth` | `GITHUB_CLIENT_ID` が未設定 |
| state 不一致 | サードパーティ Cookie ブロック、別タブで callback を開いていないか |
| commit できない | ログイン GitHub ユーザーに repo の write 権限があるか |
| ローカル `pages:dev` で OAuth 失敗 | `Secure` Cookie は HTTPS 必須。**本番 pages.dev で検証** |

---

## 6. admin.nondesu.com（本番 CMS）

同一 Pages プロジェクト・同一 `dist` に **`nondesu.com`** と **`admin.nondesu.com`** の両方を Custom domain として追加する（Option A）。

### 6.1 DNS / Cloudflare Pages

1. `nondesu.com` → 公開サイト
2. `admin.nondesu.com` → 同じ Pages プロジェクト（CMS 入口）

### 6.2 リダイレクト（`public/_redirects` + `functions/_middleware.ts`）

Cloudflare Pages の `_redirects` は **Host 条件非対応**（domain-level redirects 不可）。path だけの `/admin → admin サブドメイン` ルールを入れると **admin 側の CMS も巻き込んでループ**するため、実装は **`functions/_middleware.ts` のみ**。`public/_redirects` はルール一覧のドキュメント（コメント）として残す。

| リクエスト | 動作 |
|------------|------|
| `https://admin.nondesu.com/` | 302 → `/admin/` |
| `https://admin.nondesu.com/admin` | 302 → `/admin/` |
| `https://admin.nondesu.com/profile` 等 | 302 → `https://nondesu.com/profile` |
| `https://admin.nondesu.com/api/*` | そのまま（OAuth） |
| `https://admin.nondesu.com/admin/*` · `/assets/*` | そのまま（CMS · アップロード） |
| `https://nondesu.com/admin` · `/admin/*` | 302 → `https://admin.nondesu.com/admin/…` |

**CMS の入口 URL**: `https://admin.nondesu.com/`（ルートが `/admin/` へリダイレクト）

### 6.3 GitHub OAuth App（本番用）

新規 OAuth App または既存 App の callback を更新:

- Homepage: `https://admin.nondesu.com/admin/`
- Callback: `https://admin.nondesu.com/api/callback`

Cloudflare の `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` を本番 App の値に更新 → 再デプロイ。

### 6.4 config.yml

`site_url` / `display_url` は公開サイトのまま:

```yaml
site_url: https://nondesu.com
display_url: https://nondesu.com
```

`auth_endpoint` は変更不要（admin サブドメイン origin で `/api/auth` が動く）。

### 6.5 移行チェックリスト

- [ ] `nondesu.com` → Pages Custom domain、SSL 有効
- [ ] `admin.nondesu.com` → 同じ Pages プロジェクトに追加
- [ ] 本番 OAuth App の callback = `https://admin.nondesu.com/api/callback`
- [ ] Cloudflare env vars を本番 App に差し替え
- [ ] `https://admin.nondesu.com/`（→ `/admin/`）で Login → 編集 → commit 確認
- [ ] `https://nondesu.com` に変更が反映されること確認
- [ ] MVP 用 OAuth App は無効化または削除（Secret ローテーション）

---

## 7. セキュリティ

### 誰が編集できるか

- GitHub OAuth でログインしたアカウントが、**`repo` に write 権限を持つ場合のみ** commit 可能。
- Decap CMS 自体にユーザー管理はない → **GitHub の Collaborator / org メンバー管理**がアクセス制御。

### 推奨

| 項目 | 推奨 |
|------|------|
| 編集者 | のんです本人 + 運用（Kakuly）のみ Collaborator |
| OAuth App Secret | 漏洩時は GitHub で即 rotate、Cloudflare も更新 |
| `main` branch protection | 任意: CMS 以外の直接 push を制限。CMS は通常 `main` へ commit するため、protection ルールは **CMS 用 bot/ユーザーは allow** または protection なしで開始 |
| CMS URL | `robots noindex` 済み（[index.html](../public/admin/index.html)）。リンクを公開プロフィールに載せない |
| Preview デプロイ | Preview 用 OAuth App を分けるか、Preview env に別 Secret を設定 |

### CMS が commit する内容

- `src/content/**` の YAML / Markdown
- `public/assets/uploads/**`（メディアアップロード）
- commit メッセージは Decap CMS デフォルト（編集者名入り）

---

## 8. ローカル開発との関係

| 方法 | 用途 |
|------|------|
| `npm run dev` + SITE iframe | Phase A。UI 確認・Astro 開発 |
| `npx decap-server` + `local_backend: true`（一時的） | OAuth なしで CMS フィールド確認。**本番 config では `local_backend: false` のまま** |
| 本番 `*.pages.dev/admin/` | Phase B 検証・実運用 |

---

## 関連ファイル

| ファイル | 役割 |
|----------|------|
| [public/admin/config.yml](../public/admin/config.yml) | Decap コレクション定義 |
| [public/admin/index.html](../public/admin/index.html) | CMS エントリ |
| [functions/_middleware.ts](../functions/_middleware.ts) | admin / 公開ドメイン間リダイレクト |
| [public/_redirects](../public/_redirects) | CMS path リダイレクト（補助） |
| [functions/api/auth.ts](../functions/api/auth.ts) | OAuth 開始 |
| [functions/api/callback.ts](../functions/api/callback.ts) | OAuth 完了 → token |
| [.env.example](../.env.example) | 環境変数一覧 |
