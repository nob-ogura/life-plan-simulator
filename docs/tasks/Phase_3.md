# フェーズ3 タスク一覧（データモデル & CRUD スライス）

対象: `docs/Plan.md` の「フェーズ3: データモデル & CRUD スライス」

## Task 1: Supabase マイグレーションでコアテーブルを作成
- 目的: 入力データを永続化する最小スキーマを用意する。
- 作業内容:
  - `children`, `income_streams`, `expenses`, `rentals`, `assets`, `mortgages`, `life_events` を作成。
  - `docs/Design.md` のデータモデルに沿ったカラム/型/デフォルト値を定義する。
  - `mortgages.target_rental_id`（NULL 可、`rentals(id)` 参照）を追加する。
  - `life_events` に `auto_toggle_key`/`repeat_interval_years`/`stop_after_occurrences` を含める。
- 受入基準（Gherkin）:
  - シナリオ: コアテーブルが設計通りに作成されている
    - 前提: Supabase migration が適用済みである
    - もし: 各テーブルのスキーマを確認する
    - ならば: `docs/Design.md` に定義された主要カラムとデフォルト値が存在する
    - かつ: `mortgages.target_rental_id` が `rentals(id)` を参照している

## Task 2: 制約と日付正規化ルールの実装
- 目的: データ品質を DB 側で担保する。
- 作業内容:
  - すべての日付が月初（`YYYY-MM-01`）であることを check constraint で強制する。
  - `amount >= 0`、`repeat_interval_years > 0` などの制約を付与する。
  - `children` は `birth_year_month` または `due_year_month` のいずれか必須とする。
  - `profiles` の本人/配偶者の生年月必須チェックを追加するかを検討し、必要なら実装する。
- 受入基準（Gherkin）:
  - シナリオ: 不正データが保存できない
    - 前提: 制約が有効化されている
    - もし: 月初以外の日付や負の金額を保存しようとする
    - ならば: DB が保存を拒否する
    - かつ: `children` の日付が両方 NULL の場合は保存できない

## Task 3: インデックス設計の反映
- 目的: RLS 環境下でも読み書き性能を確保する。
- 作業内容:
  - 全テーブルの `user_id` に BTREE インデックスを付与する。
  - `life_events(year_month)` にインデックスを付与する。
  - `mortgages(user_id, target_rental_id)` の複合インデックスを追加する。
- 受入基準（Gherkin）:
  - シナリオ: 必須インデックスが作成されている
    - 前提: migration が適用済みである
    - もし: インデックス一覧を確認する
    - ならば: すべてのテーブルに `user_id` インデックスが存在する
    - かつ: `life_events(year_month)` と `mortgages(user_id, target_rental_id)` が存在する

## Task 4: RLS 有効化とポリシー作成
- 目的: ユーザー単位でデータを隔離する。
- 作業内容:
  - 本フェーズで作成する全テーブルで RLS を有効化する。
  - `auth.uid() = user_id` の select/insert/update/delete ポリシーを作成する。
- 受入基準（Gherkin）:
  - シナリオ: 認証ユーザーが自分のデータのみ操作できる
    - 前提: RLS とポリシーが有効である
    - もし: 自分の `user_id` のデータを操作する
    - ならば: CRUD が成功する
    - かつ: 他ユーザーの `user_id` を指定した操作は拒否される

## Task 5: CRUD スライスの実装（RER + CQRS）
- 目的: 入力データの取得・更新をスライス単位で提供する。
- 作業内容:
  - 各テーブルに対して Request/Endpoint/Response の RER 構成を用意する。
  - Endpoint は入力受付と認証のみ、Handler がオーケストレーションを担う。
  - CQRS を採用し、書き込みは Command、読み取りは Query に分離する。
  - データアクセスは各スライス内の Repository/Infrastructure に限定する。
- 受入基準（Gherkin）:
  - シナリオ: CRUD がスライス構成で分離されている
    - 前提: 各スライスに RER と Handler が実装されている
    - もし: コマンドとクエリのコードを確認する
    - ならば: Endpoint は処理委譲のみでビジネスロジックを持たない
    - かつ: データアクセスはスライス内に閉じている

## Task 6: Zod バリデーションと HTTP ステータス統一
- 目的: 入出力の安全性と一貫したエラーハンドリングを確保する。
- 作業内容:
  - Server Action は `createAction` を利用し、zod で入力検証する。
  - バリデーションエラーは 400、正常系は 200/204 を返す。
- 受入基準（Gherkin）:
  - シナリオ: バリデーションエラー時に 400 が返る
    - 前提: Zod スキーマが適用されている
    - もし: 不正な入力を送信する
    - ならば: 400 が返る
    - かつ: 正常な入力では 200 または 204 が返る

## Task 7: CRUD + RLS の統合テスト整備
- 目的: RLS と CRUD の動作を統合テストで保証する。
- 作業内容:
  - `tests/integration` に CRUD と RLS を検証するテストを追加する。
  - `pnpm test:integration` で実行できるようにする。
- 受入基準（Gherkin）:
  - シナリオ: 統合テストで CRUD と RLS が検証できる
    - 前提: Supabase ローカルでテストが実行できる
    - もし: `pnpm test:integration` を実行する
    - ならば: CRUD と RLS のシナリオがすべてパスする
