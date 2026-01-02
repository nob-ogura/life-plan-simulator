# フェーズ2 タスク一覧（認証・RLS基盤）

対象: `docs/Plan.md` の「フェーズ2: 認証・RLS基盤」

## Task 1: Supabase 認証プロバイダ（GitHub OAuth）の有効化と TLS 強制
- 目的: 認証方式を GitHub OAuth に限定し、通信の安全性を確保する。
- 作業内容:
  - Supabase プロジェクトで GitHub OAuth を有効化する。
  - メール/パスワード認証は無効化する。
  - Supabase 設定で `Enforce TLS` を有効化する。
- 受入基準（Gherkin）:
  - シナリオ: 認証プロバイダが GitHub のみに限定されている
    - 前提: Supabase プロジェクトに複数の認証方式が存在する
    - もし: Supabase の認証設定を確認する
    - ならば: GitHub OAuth のみが有効になっている
    - かつ: メール/パスワード認証が無効になっている
    - かつ: `Enforce TLS` が有効になっている

## Task 2: ログイン/ログアウト UI とフローの実装
- 目的: ログイン必須要件を満たし、ユーザーが認証を完了できるようにする。
- 作業内容:
  - `/login` 画面を用意し、GitHub OAuth でログインできる UI を実装する。
  - ログアウトの導線を用意し、セッションを破棄できるようにする。
- 受入基準（Gherkin）:
  - シナリオ: ログインとログアウトが正常に機能する
    - 前提: `/login` 画面に GitHub OAuth のログイン導線がある
    - もし: 未ログインの状態でログインを実行する
    - ならば: 認証成功後にダッシュボードへ遷移する
    - かつ: ログアウトを実行すると `/login` に戻る

## Task 3: 保護ルートガードの実装（未ログインは `/login` へ誘導）
- 目的: 認証済ユーザーのみがアプリの主要画面にアクセスできるようにする。
- 作業内容:
  - ルートガード（middleware または layout での保護）を実装する。
  - 未ログイン時は `/login` にリダイレクトする。
- 受入基準（Gherkin）:
  - シナリオ: 未ログインユーザーが保護ルートにアクセスできない
    - 前提: 保護ルート（例: `/` や `/inputs`）が存在する
    - もし: 未ログイン状態で保護ルートにアクセスする
    - ならば: `/login` にリダイレクトされる
    - かつ: ログイン後は同じルートにアクセスできる

## Task 4: `profiles` と `simulation_settings` のスキーマ作成（Supabase migration）
- 目的: 認証後に必要な初期データ構造を用意する。
- 作業内容:
  - `profiles` と `simulation_settings` を migration で作成する。
  - `profiles` に本人/配偶者の生年月（year/month）と `pension_start_age` を含める。
  - `simulation_settings` に `start_offset_months`, `end_age` と係数（年金額・諸経費率・固定資産税率・評価額掛目）を含める。
- 受入基準（Gherkin）:
  - シナリオ: 必要な初期テーブルとカラムが作成されている
    - 前提: Supabase migration が実行済である
    - もし: `profiles` と `simulation_settings` のスキーマを確認する
    - ならば: `profiles` に `user_id`, `birth_year`, `birth_month`, `spouse_birth_year`, `spouse_birth_month`, `pension_start_age` が存在する
    - かつ: `simulation_settings` に `start_offset_months`, `end_age`, `pension_amount_single`, `pension_amount_spouse`, `mortgage_transaction_cost_rate`, `real_estate_tax_rate`, `real_estate_evaluation_rate` が存在する

## Task 5: `on_auth_user_created` トリガーによる初期レコード作成
- 目的: 新規ユーザー登録時に初期設定を自動作成する。
- 作業内容:
  - `on_auth_user_created` トリガーで `profiles` と `simulation_settings` の初期レコードを作成する SQL を migration に含める。
  - 初期値は DB 定義のデフォルト値を利用する。
- 受入基準（Gherkin）:
  - シナリオ: 新規ユーザー登録で初期レコードが自動作成される
    - 前提: `on_auth_user_created` トリガーが有効化されている
    - もし: 新規ユーザーを作成する
    - ならば: `profiles` に user_id が一致するレコードが作成される
    - かつ: `simulation_settings` に user_id が一致するレコードが作成される

## Task 6: `profiles` と `simulation_settings` の RLS 有効化とポリシー作成
- 目的: ユーザーごとにデータを隔離し、他人のデータにアクセスできない状態にする。
- 作業内容:
  - 両テーブルで `enable row level security` を有効化する。
  - `auth.uid() = user_id` の select/insert/update/delete ポリシーを作成する。
- 受入基準（Gherkin）:
  - シナリオ: 認証ユーザーが自分のデータのみ操作できる
    - 前提: `profiles` と `simulation_settings` に RLS が有効である
    - もし: 認証ユーザーが自分の `user_id` のデータを操作する
    - ならば: select/insert/update/delete が成功する
    - かつ: 他ユーザーの `user_id` を指定した操作は拒否される

## Task 7: 認証状態取得とセッション更新の一貫化
- 目的: フロント全体で認証状態の取得と更新が安定して動作するようにする。
- 作業内容:
  - Supabase Auth のセッション取得を共通化し、アプリ起動時にユーザー状態を復元する。
  - 認証状態の変更（ログイン/ログアウト/トークン更新）を全体に反映する。
- 受入基準（Gherkin）:
  - シナリオ: セッション状態がアプリ全体に一貫して反映される
    - 前提: 認証状態の取得と更新が共通化されている
    - もし: ログインまたはログアウトを行う
    - ならば: 画面全体で認証状態が即時に反映される
    - かつ: ページ再読み込み後も認証状態が復元される
