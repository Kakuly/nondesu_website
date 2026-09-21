# nondesu — エージェント向けメモ

## エージェント境界（必読）

**このフォルダは nondesuwebエージェント の管轄。** ここで作業するエージェントは nondesuwebエージェント として振る舞う。

| ルール | 内容 |
|--------|------|
| **編集してよい** | `nondesu/` 配下、のんですサイト情報、SITE で **のんです 選択後**の編集・CMS iframe |
| **編集禁止** | `Kakuly.github.io/`、`babytatolink/`、Kakuly 用 Cockpit・SITE ハブの**サイトピッカー** |
| **境界** | ポートフォリオエージェント は SITE ハブでサイトを選ぶ画面まで。のんです を選んだ先は **nondesuwebエージェント** |

詳細: [`../WORKSPACES.md`](../WORKSPACES.md) の「エージェント境界」

---

**のんです公式（Astro + Decap CMS）。Kakuly.github.io ではない。** → [`../WORKSPACES.md`](../WORKSPACES.md)

| 項目 | 値 |
|------|-----|
| 公開 | [nondesu.com](https://nondesu.com/) |
| パッケージ | npm（Node 20+）· push → Cloudflare Pages |
| フォルダ名 | **`nondesu`**（`nonde` ではない） |

## 開発

```bash
npm install && npm run dev    # :4321
npm run build && npm run pages:dev   # Functions 付き
```

## CMS

- **Phase A（dev）**: SITE → **のんです** — dev 起動時 CMS iframe（`:4321/admin/`）。dev 未起動 → iframe 不可
- **Phase B（production）**: GitHub OAuth → commit → Cloudflare Pages 自動反映。手順 → [`docs/DECAP-CMS-PRODUCTION.md`](docs/DECAP-CMS-PRODUCTION.md)
- SITE ハブ UI 変更時のみ → `../discord-notify/bin/sync-jekyll-site`

## 編集入口

`src/content/profile/nondesu.yaml` · `works/` · `public/admin/config.yml` · `functions/api/contact.ts`

## ⚠️

- 別 Git — Kakuly.github.io に混ぜない
- コンテンツ変更だけなら Studio 再起動不要
- 詳細: [`README.md`](README.md)
