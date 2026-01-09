# フェーズ1 タスク一覧（基盤セットアップ）

対象: `docs/Plan.md` の「フェーズ1: 基盤セットアップ」

## Task 1: プロジェクト基盤（Next.js 14 + App Router + TypeScript）の初期化
- 目的: 以降の実装を進めるための土台を用意する。
- 作業内容:
  - Next.js 14 の App Router でプロジェクト構成を準備する。
  - TypeScript 設定を整備し、型チェックが有効な状態にする。
- 受入基準（Gherkin）:
  - シナリオ: 開発サーバーが起動し型チェックが通る
    - 前提: Next.js 14 + App Router + TypeScript の構成が整っている
    - もし: 開発サーバーを起動する
    - ならば: エラーなく起動できる
    - かつ: TypeScript の型チェックが通る

## Task 2: VSA 方針に基づくディレクトリ骨格の作成
- 目的: Vertical Slice Architecture に沿った拡張しやすい骨格を作る。
- 作業内容:
  - `src/features/<module>/<slice>/` 形式のスライス配置ルールを用意する。
  - `src/shared` に横断関心と共有ドメイン（シミュレーション等）を置く方針を明示する。
  - REPR 雛形（request/endpoint/response）を作成し、1エンドポイント=1クラスのルールに従う構成を整える。
- 受入基準（Gherkin）:
  - シナリオ: VSA 構成の骨格が存在する
    - 前提: `docs/Guideline.md` に VSA と REPR の方針が定義されている
    - もし: `src` 配下の構成を確認する
    - ならば: `src/features/<module>/<slice>/` の雛形が存在する
    - かつ: `src/shared` に横断関心と共有ドメインの配置方針が示されている
    - かつ: REPR の request/endpoint/response の雛形が確認できる

## Task 3: Transport と Application の責務分離の指針整備
- 目的: Endpoint と Handler の責務を明確化し、REPR 構成を破綻させない。
- 作業内容:
  - Endpoint は入力受付と認証に限定し、ビジネスロジックは Handler に委譲する方針を明文化する。
  - 1エンドポイント=1クラスの運用例を最小限で示す（雛形レベル）。
- 受入基準（Gherkin）:
  - シナリオ: Endpoint/Handler の責務が明確である
    - 前提: `docs/Guideline.md` に Endpoint/Handler の責務分担がある
    - もし: スライス雛形を確認する
    - ならば: Endpoint が入力受付のみを担う構成になっている
    - かつ: ビジネスロジックは Handler に委譲される構成になっている

## Task 4: Tailwind / shadcn/ui の導入とグローバル UI 整備
- 目的: UI 基盤を統一し、以降の画面実装を円滑にする。
- 作業内容:
  - Tailwind と shadcn/ui を導入し、テーマ設定を整備する。
  - グローバルレイアウト・ヘッダー・トーストの基盤を用意する。
- 受入基準（Gherkin）:
  - シナリオ: 共通 UI がアプリに反映される
    - 前提: Tailwind と shadcn/ui が導入されている
    - もし: アプリを表示する
    - ならば: グローバルレイアウトが適用されている
    - かつ: ヘッダーが表示される
    - かつ: トースト表示の基盤が組み込まれている

## Task 5: Supabase クライアントと環境変数テンプレートの整備
- 目的: Supabase 連携の基盤を整え、開発者が迷わずセットアップできるようにする。
- 作業内容:
  - Supabase JS クライアントを `@/shared/cross-cutting/infrastructure/supabase` に配置する。
  - `.env.example` に必要なキーを記載する。
  - 型生成の手順（`supabase gen types typescript`）を利用できる状態にする。
- 受入基準（Gherkin）:
  - シナリオ: Supabase 接続準備が整っている
    - 前提: Supabase の利用方針が `docs/Design.md` に記載されている
    - もし: `@/shared/cross-cutting/infrastructure/supabase` と `.env.example` を確認する
    - ならば: Supabase クライアントの初期化が用意されている
    - かつ: `.env.example` に必要な環境変数が揃っている
    - かつ: 型生成コマンドの実行手順が示されている

## Task 6: Lint / Format / Unit Test の最小 CI 構成
- 目的: 開発初期の品質ゲートを確立する。
- 作業内容:
  - Biome による lint/format と TypeScript の型チェックを設定する。
  - Vitest を用いた unit テスト実行環境を整備する。
  - GitHub Actions で lint + typecheck + unit を必須化し、Supabase 依存の integration/E2E は別コマンドとして分離する。
- 受入基準（Gherkin）:
  - シナリオ: 最小 CI が機能する
    - 前提: `docs/Plan.md` に最小 CI の方針が定義されている
    - もし: CI ワークフローを確認する
    - ならば: lint と typecheck と unit が必須として実行される
    - かつ: integration/E2E は別コマンドとして分離されている

## Task 7: README へのセットアップ手順記載
- 目的: 新規参加者が迷わず開発を開始できるようにする。
- 作業内容:
  - `.env.example` を利用したセットアップ手順を README に記載する。
  - `pnpm lint` と `pnpm test:unit` の実行方法を明記する。
- 受入基準（Gherkin）:
  - シナリオ: README にセットアップ手順が明記されている
    - 前提: `.env.example` と開発コマンドが用意されている
    - もし: README を確認する
    - ならば: 環境変数設定の手順が記載されている
    - かつ: `pnpm lint` と `pnpm test:unit` の手順が記載されている
