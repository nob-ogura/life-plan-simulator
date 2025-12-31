# Vercel デプロイ手順（プレビュー/本番）

## 目的
- PR でプレビュー、`main` で本番デプロイが自動で動作するようにする。
- Vercel のデプロイステータスを GitHub の必須チェックに含める。

## 1. GitHub ↔ Vercel 連携
1) Vercel にログインし、右上の **Add New → Project** を開く。
2) GitHub アカウントが未連携の場合は **Connect GitHub** を選び、対象リポジトリへのアクセス権を付与する。
3) Import 画面で `life-plan-simulator` リポジトリを選択し **Import** を押す。
4) 「Configure Project」画面で Framework が **Next.js** と自動判定されていることを確認する。
5) Build & Output Settings はデフォルトのままにする（必要時のみ変更）。
6) 「Git」セクションで **Production Branch** が `main` になっていることを確認する。
7) ここではまだ Deploy しない場合は **Cancel** で閉じ、環境変数の登録を先に行う。
8) 環境変数を設定したら **Deploy** を実行して初回デプロイを完了する。

## 2. 環境変数の登録（Vercel Project Settings）
Vercel の Environment Variables に以下を登録する。

必須（Preview / Production の両方）:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

任意（導入時に追加）:
- `NEXT_PUBLIC_SENTRY_DSN`（Sentry Browser を使う場合）

補足:
- Preview は本番と別 Supabase を使う場合、Preview 環境に別の URL/Key を設定する。
- `E2E_ENABLED` は Vercel では不要。未設定のままにする。

## 3. プレビュー/本番デプロイの確認
- PR を作成すると Vercel が Preview Deploy を実行し、PR にプレビュー URL が表示されることを確認する。
- `main` へマージすると Production Deploy が実行されることを確認する。

## 4. Vercel ステータスチェックを必須化
1) GitHub の Repository Settings → Branches → Branch protection rules を開く。
2) `main` の保護ルールで「Require status checks to pass before merging」を有効化する。
3) 直近のデプロイ後に表示される Vercel のチェック（Preview / Production）を必須チェックに追加する。

メモ:
- チェック名は Vercel の統合で自動生成されるため、初回デプロイ後に選択できるようになる。
