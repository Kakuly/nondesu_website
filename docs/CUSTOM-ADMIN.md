# カスタム admin（おもちゃ箱 admin）

> Decap CMS の代わりに、のんです専用の pastel UI + ユーザー名/パスワードログインで本番編集する。

---

## 概要

| 項目 | 値 |
|------|-----|
| **入口** | `https://admin.nondesu.com/` → `/admin/` |
| **認証** | 2 アカウント（`ADMIN_USER_1` / `ADMIN_PASS_1` など）→ HttpOnly セッション Cookie |
| **保存** | Cloudflare Functions が `GITHUB_TOKEN` で GitHub Contents API に commit |
| **公開サイト** | `https://nondesu.com`（変更なし） |

**のんです本人に GitHub アカウントは不要。**

---

## アーキテクチャ

```
編集者ブラウザ
  └─ /admin/  (Astro 静的 UI)
       └─ POST /api/admin/login  → セッション Cookie
       └─ GET/PUT /api/admin/content/*  (Pages Functions)
            └─ GitHub Contents API (GITHUB_TOKEN)
                 └─ Cloudflare Pages が main をビルド → nondesu.com 更新
```

---

## Cloudflare 環境変数

Dashboard → **Workers & Pages** → プロジェクト → **Settings** → **Environment variables**

| 名前 | 必須 | 説明 |
|------|------|------|
| `ADMIN_USER_1` | ✓ | 1人目のログイン用ユーザー名（例: `nondesu`） |
| `ADMIN_PASS_1` | ✓ | 1人目のパスワード（平文で OK — 外側に Access PIN あり） |
| `ADMIN_USER_2` | ✓ | 2人目のログイン用ユーザー名（例: `kakuly`） |
| `ADMIN_PASS_2` | ✓ | 2人目のパスワード |
| `SESSION_SECRET` | ✓ | セッション署名用ランダム文字列（32+ 文字推奨） |
| `GITHUB_TOKEN` | ✓ | repo write 権限の PAT（Fine-grained または classic） |
| `GITHUB_REPO` | | 省略時 `Kakuly/nondesu_website` |
| `GITHUB_BRANCH` | | 省略時 `main` |
| `CONTACT_EMAIL` | | 依頼フォーム用（admin とは無関係） |

### 2 アカウントの例（Kakuly 向け）

Cloudflare Dashboard → Environment variables に次の 4 つを追加（Production / Preview 両方）:

```env
ADMIN_USER_1=nondesu
ADMIN_PASS_1=<のんです用パスワード>
ADMIN_USER_2=kakuly
ADMIN_PASS_2=<運用者用パスワード>
```

- **のんです** — ユーザー名 `nondesu` + 本人用パスワード
- **Kakuly（運用者）** — ユーザー名 `kakuly` + 運用者用パスワード
- ログイン後、セッション Cookie にユーザー名が入る（どちらのアカウントか区別可能）
- 外側の **Cloudflare Access（メール PIN）** が先にかかるため、平文パスワードでも運用上問題ない想定

### 旧 1 アカウント設定（後方互換）

移行前の `ADMIN_USERNAME` + `ADMIN_PASSWORD`（または `ADMIN_PASSWORD_HASH`）も引き続き動作する。  
**新しい 4 変数のどれか 1 組でも設定されている場合は、新設定が優先**され旧変数は無視される。

### Cloudflare Access（メール二段階・推奨）

admin は公開サイトを書き換えられるため、**Access で外側からも守る**ことを推奨。

1. [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → **Access** → **Applications** → Add
2. 種類: **Self-hosted**（SaaS / Infrastructure / Bookmark ではない）
3. Application domain: `admin.nondesu.com`（Path: `/` で全体）
4. Policy: のんです・運用者の **メールアドレス** のみ Allow
5. Identity: **One-time PIN**（メール）を有効化

流れ: **メール PIN（Access）** → **ユーザー名/パスワード（独自 admin）** → 編集。

> 独自 admin 内蔵のメール OTP は未実装。Access を使うと開発コストが最小。

### GitHub PAT

- 対象リポジトリ: `Kakuly/nondesu_website`
- 権限: **Contents: Read and write**
- のんです本人のアカウントではなく、運用者（Kakuly）の PAT を Cloudflare に置く

---

## ルーティング（admin サブドメイン）

[`functions/_middleware.ts`](../functions/_middleware.ts) により:

| リクエスト | 動作 |
|------------|------|
| `admin.nondesu.com/` | 302 → `/admin/` |
| `admin.nondesu.com/admin/*` | カスタム admin UI |
| `admin.nondesu.com/api/*` | Functions（login / content API） |
| `nondesu.com/admin/*` | 302 → `admin.nondesu.com/admin/*` |

---

## MVP で編集できるもの

| 画面 | ファイル |
|------|----------|
| プロフィール | `src/content/profile/nondesu.yaml` |
| 作品一覧 + 編集 | `src/content/works/*.yaml` |

### 将来拡張（未実装）

- releases / events / goods コレクション
- 画像アップロード（`public/assets/uploads/`）
- 新規作品の作成・削除
- プレビュー / 下書き
- 編集履歴・ロールバック

---

## ローカル検証

```bash
npm install
npm run build
npm run pages:dev
```

`.dev.vars`（git 忽略）例:

```env
ADMIN_USER_1=nondesu
ADMIN_PASS_1=dev-nondesu-password
ADMIN_USER_2=kakuly
ADMIN_PASS_2=dev-kakuly-password
SESSION_SECRET=local-dev-secret-change-me
GITHUB_TOKEN=ghp_...
GITHUB_REPO=Kakuly/nondesu_website
```

1. `http://127.0.0.1:8788/admin/login/` を開く
2. ログイン → プロフィールで shortBio を1文字変更 → 保存
3. GitHub に commit されること、Pages 再ビルド後に反映されること

> `pages:dev` では HTTPS なので `Secure` Cookie が効く。`astro dev` 単体では Functions が動かないため admin API は使えない。

---

## Decap CMS について

Decap（`public/admin/config.yml` + GitHub OAuth）は**本番パスから削除**済み。

- 旧 OAuth Functions（`/api/auth`, `/api/callback`）はコードに残っているが、admin UI からは参照しない
- 詳細な移行履歴 → [`DECAP-CMS-PRODUCTION.md`](./DECAP-CMS-PRODUCTION.md) 先頭の注記

Phase A（SITE ハブ iframe + ローカル dev）は Astro 開発用として引き続き利用可能。

---

## セキュリティ（現状と今後）

| 対策 | 状態 |
|------|------|
| HTTPS + HttpOnly セッション Cookie | ✓ |
| 2 アカウント（のんです + 運用者） | ✓ |
| タイミングセーフなパスワード照合 | ✓ |
| GitHub PAT はサーバー側のみ | ✓ |
| Cloudflare Access（メール PIN） | **運用者が Zero Trust で設定** |
| ログイン rate limit / CSRF トークン | 未実装（将来） |

---

## 関連ファイル

| ファイル | 役割 |
|----------|------|
| `src/pages/admin/` | ログイン・ダッシュボード・編集 UI |
| `src/layouts/AdminLayout.astro` | admin 共通レイアウト |
| `src/styles/admin.css` | pastel / おもちゃ箱トーン |
| `functions/api/admin/` | login / session / content API |
| `functions/lib/admin-users.ts` | 複数 admin アカウントの読み込み・照合 |
| `functions/lib/session.ts` | HMAC セッション Cookie |
| `functions/lib/github.ts` | GitHub Contents API |
| `functions/lib/yaml-content.ts` | YAML ↔ JSON（MVP スキーマ限定） |
| `functions/_middleware.ts` | admin サブドメインルーティング |
