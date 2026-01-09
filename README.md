# Life Plan Simulator

人生設計をシミュレーションし、資産やイベントの変化を可視化するための Web アプリです。

## プロジェクト概要 / 主な機能

- ライフイベントに応じたシミュレーションの実行。
- 資産・収支の管理と推移の可視化。
- Supabase を用いた認証とデータ永続化。
- 仕様・設計ドキュメントは `docs/` に集約。

## ドキュメント

- 要件: `docs/Requirements.md`
- 設計: `docs/Design.md`
  - 図解: `docs/Diagrams.md`
- 実装: `docs/Plan.md`
  - ガイドライン: `docs/Guideline.md`
- デプロイ: `docs/Vercel.md`
- オンボーディング: `docs/Onboarding.md`

## 技術スタック

- Next.js (App Router) / TypeScript
- Supabase (認証 / DB)
- Tailwind CSS
- Biome (フォーマット / リント)
- Vitest (ユニット / 統合)
- Playwright (E2E)

## 前提 / セットアップ

1) 依存関係をインストールします。

```bash
pnpm install
```

2) 環境変数ファイルを作成します。

```bash
cp .env.example .env
```

3) `.env` を更新します。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (サーバー専用)
- `SUPABASE_PROJECT_ID` (型生成用)
- `SUPABASE_ACCESS_TOKEN` (Supabase CLI 未ログイン時のみ任意)

4) 開発サーバーを起動します。

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開いてください。

## 開発

- 開発サーバー: `pnpm dev`
- ビルド: `pnpm build`
- 本番サーバー: `pnpm start`
- フォーマット: `pnpm format`
- リント: `pnpm lint`
- 型チェック: `pnpm typecheck`

## テスト

- ユニット: `pnpm test:unit`
- 統合: `pnpm test:integration`
- E2E: `pnpm test:e2e`

統合テストで Supabase を利用する場合、`.env` に以下が必要です。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

### E2E 認証ショートカット

Playwright は以下のサーバー専用エンドポイントで認証できます。

- ルート: `POST /__e2e/login`
- 有効条件: `E2E_ENABLED === "true"`
- ボディ: `{ "email": "optional@example.com" }` (省略時: `e2e@example.com`)
- 実装: `src/app/e2e/login/route.ts` (rewrite 経由)

例:

```bash
curl -X POST http://localhost:3000/__e2e/login \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e@example.com"}'
```

## データベース / Supabase ワークフロー

- マイグレーションは `supabase/migrations` に追加します。

1) Supabase CLI にログインします。

```bash
pnpm supabase login
```

2) プロジェクトを紐づけます（project ref を指定）。

```bash
pnpm supabase link --project-ref <project-ref>
```

3) マイグレーションを反映します。

```bash
pnpm supabase:push
```

4) スキーマ変更後に型を再生成します。

```bash
pnpm supabase:gen-types
```

## リポジトリ構成

本プロジェクトでは **Vertical Slice Architecture (VSA)** を採用しています。
機能ごとに UI・ロジック・データアクセスを凝集させることで、変更の影響範囲を最小化し、AI 支援開発におけるコンテキスト制御（レビュー/生成時のスコープ分離）を容易にしています。

- `src/app`: App Router のページ/ルートハンドラ。
- `src/features`: ドメイン単位の UI/ロジック。
- `src/components`: 再利用 UI コンポーネント。
- `src/shared`: 横断ユーティリティや共通 UI/ロジック。
- `src/lib`: 補助ヘルパー群。
- `src/types`: 共有型（Supabase 型は `src/types/supabase.ts` を自動生成）。
- `tests/unit`: Vitest ユニットテスト。
- `tests/integration`: Vitest 統合テスト。
- `tests/e2e`: Playwright E2E。
- `supabase/migrations`: DB マイグレーション。
- `docs`: 仕様/設計ドキュメント。
