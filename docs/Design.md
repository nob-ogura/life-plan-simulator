# ライフプランシミュレータ 設計書

## 1. 目的とスコープ
- 要件定義に基づき、個人開発のMVPとして「月次キャッシュフローの可視化」を最短で届ける。
- 本設計書はMVPの機能境界、データ構造、画面設計、計算ロジック、非機能設計を示す。

## 2. 全体アーキテクチャ
- Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui。
- Supabase: Auth・PostgreSQL を利用。
- デプロイ: Vercel（FRONT） / Supabase（DB）。
- 計算配置: フロントで即時計算（MVP）。
- 認証: GitHub OAuth via Supabase Auth。ログイン必須でのみ利用可能。
  - 初期化フロー: Supabase Auth の `on_auth_user_created` トリガーを使用し、ユーザー登録時に `profiles` および `simulation_settings` の初期レコード（デフォルト値入り）を自動作成する。

## 3. 画面フロー / UI
1) ログイン: Supabase Auth。未ログインは `/login` へ誘導。
2) ダッシュボード (`/`)
   - サマリカード: 累計収支・平均月残高・資産寿命（枯渇月）。
     - 上部に `position: sticky; top: 0;` で固定し、スクロール時も常に表示。背景に半透明のバックドロップを敷き可読性を確保。
   - 表示範囲切替: 直近5年 / 全期間。
   - 資産推移グラフ: 月次ラインチャート（資産残高）。
   - キャッシュフロー表: 月次収入・支出・差分・残高をテーブルで表示、仮想スクロール。
3) 入力フォーム (`/inputs`)
   - セクション: 家族構成 / 収入 / ボーナス / 支出 / 住宅 / ライフイベント / 投資設定 / シミュレーション設定（start_offset_months, end_age, 年金・係数）。
     - 家族構成: 子供を複数行で追加できるフォームを用意し、各行に「出生済み (birth_year_month)」または「誕生予定 (due_year_month)」のいずれかを必須入力。
   - フォームはステップ別アコーディオン + AutoSave（ローカル状態→保存ボタンでDBへ現在の設定をUpsert）。
   - ※履歴保存機能は持たない（常に最新の設定のみを保持）。
4) イベント一覧: 繰り返しイベントを含む一覧と追加モーダル。
5) 設定: プロフィール（年齢、配偶者有無）とモデル年金・係数設定の確認。

## 4. データモデル（Supabase PostgreSQL）
- すべて `user_id uuid` を持ち、RLSで `auth.uid() = user_id` に限定。
- 型は省略時 `numeric(12,2)` を基本。
- 日付の扱い: `date` 型は常に「該当月の1日 (YYYY-MM-01)」として保存・取得する制約とする。

### 4.1 コア
- `profiles`: user_id (PK), birth_year, birth_month (1-12), spouse_birth_year (nullable), spouse_birth_month (nullable), pension_start_age default 65, created_at, updated_at。
- `children`: id, user_id, label, birth_year_month date nullable, due_year_month date nullable, note。出生済みは birth_year_month、誕生予定は due_year_month を設定し、両方 null を禁止する check constraint を付与。
- `income_streams`: id, user_id, label, take_home_monthly, bonus_months int[] default '{}', bonus_amount, change_year_month date nullable, bonus_amount_after nullable, raise_rate decimal default 0.01, start_year_month date, end_year_month date nullable。
- `expenses`: id, user_id, label, amount_monthly, inflation_rate decimal default 0.0, category, start_year_month date, end_year_month date nullable。
- `rentals`: id, user_id, rent_monthly, start_year_month date, end_year_month date nullable。※MVPでは1件のみを想定。
- `assets`: id, user_id, cash_balance, investment_balance, return_rate decimal default 0.03。
  - return_rate は investment_balance（運用資産）にのみ適用し、cash_balance は常に利回り0%として扱う。
- `mortgages`: id, user_id, principal, annual_rate decimal default 0.015, years, start_year_month date, building_price, land_price, down_payment。
- `life_events`: id, user_id, label, amount, year_month date, repeat_interval_years int nullable, stop_after_occurrences int nullable, category (housing/car/travel/etc), auto_toggle_key nullable, building_price nullable, land_price nullable, down_payment nullable, target_rental_id nullable。
  - auto_toggle_key: システム制御用。MVPでは `HOUSING_PURCHASE_STOP_RENT` (住宅購入時に家賃支払いを停止) のみを実装対象とする。
- `simulation_settings`: id, user_id, start_offset_months int default 0, end_age int default 100。
  - 係数設定（デフォルト値はDB定義）:
    - `pension_amount_single` (単身年金月額: def 65000)
    - `pension_amount_spouse` (配偶者分年金月額: def 130000)
    - `mortgage_transaction_cost_rate` (諸経費率: def 1.03)
    - `real_estate_tax_rate` (固定資産税率: def 0.014)
    - `real_estate_evaluation_rate` (評価額掛目: def 0.7)

### 4.2 結果
- MVPではシミュレーション履歴（スナップショット）は保存しない。
- ユーザー入力値（上記コアテーブル）に基づき、フロントエンドで都度計算を行う。

### 4.3 インデックス
- 各テーブル `user_id` にBTREE。
- `life_events(year_month)` にインデックス。

## 5. シミュレーションロジック（MVP フロント実装）
- 日付計算: タイムゾーンによるズレ（月ズレ）を防ぐため、`Date` オブジェクトの計算は行わず、文字列 (`YYYY-MM`) または「開始月からの経過月数（整数）」で管理・ループ処理を行う。
- 定数利用: 計算に使用する係数はハードコードせず、`simulation_settings` の値を利用する。

- タイムライン: 起点は「実行時の現在年月」。`simulation_settings.start_offset_months` を加算して開始月を決定し、そこから年齢100歳までの月配列を生成する。
- 収入計算
  - 有効期間 (`start_year_month`〜`end_year_month`) 内の月のみ計上。
  - 毎月: take_home_monthly × (1 + raise_rate)^(経過年数)。
  - ボーナス: 該当月に bonus_amount（`change_year_month` 以降は bonus_amount_after）。
- 支出計算
  - 有効期間 (`start_year_month`〜`end_year_month`) 内の月のみ計上。
  - 各 expense: amount_monthly × (1 + inflation_rate)^(経過年数)。
  - 賃貸: rent_monthly を rentals の期間だけ加算（`HOUSING_PURCHASE_STOP_RENT` イベント発生で停止）。
- 住宅ローン
  - 住宅イベント発生時: principal = (building_price + land_price) × `mortgage_transaction_cost_rate` - downpayment。
  - 元利均等: r = annual_rate/12, n = years×12, payment = principal × r × (1+r)^n / ((1+r)^n -1)。
  - 固定資産税: (building_price + land_price) × `real_estate_evaluation_rate` × `real_estate_tax_rate` / 12 をローン開始月から毎月計上。
- ライフイベント
  - `life_events` をタイムラインに展開。repeat_interval_years があれば該当月ごとに生成。
  - category が housing_purchase の場合、building_price / land_price / down_payment を必須入力として principal 計算と固定資産税計算に利用する。
  - auto_toggle_key == `HOUSING_PURCHASE_STOP_RENT` の場合、対象 rental を住宅購入月の前月で終了（MVPでは単一 rental 前提、将来は target_rental_id で指定可能）。
- 資産推移
  - 月次収支 = total_income - total_expense + event_amount。
  - 資金の流れ:
    1. cash_balance に月次収支を加算。
    2. cash_balance がマイナスなら、不足分を investment_balance から充当し、cash_balance は0とする。
  - 運用リターン: investment_balance にのみ `(1 + return_rate/12)` を乗算。cash_balance は利回り0%。
  - total_balance = cash_balance + investment_balance を表示・評価に用いる（グラフは cash / investment のスタック、サマリカードは total）。
  - 枯渇月: 運用反映後の total_balance が初めて0未満になった月を記録。
- 退職金・年金
  - 退職金: `life_events` で category `retirement_bonus` として指定月に一時収入を追加。
  - 年金: pension_start_age 以降、`pension_amount_single` (配偶者ありなら + `pension_amount_spouse`) を収入に加算。

## 6. バリデーション方針
- フロント: React Hook Form + zod で型安全な数値・年齢上限（0-120）・月指定（YYYY-MM）を検証。
- バックエンド: Supabase Row Level Security + check constraints (e.g., amount >= 0, repeat_interval_years > 0) に加え、Next.js server actions で zod スキーマバリデーションを行い、通過したペイロードのみ upsert/insert する。

## 7. API / データ取得
- Supabase JS ClientでCRUD。再利用のため `@/shared/cross-cutting/infrastructure/supabase` を配置。
- `useQuery` 系の軽量フェッチ（React Server Componentsでは server action + cache revalidate）。
- オフライン入力中はローカル状態に保持し、`保存` ボタンで upsert。
- 型生成: `pnpm supabase:gen-types` で `src/types/supabase.ts` を生成・更新する。

## 8. セキュリティ / RLS ポリシー
- 全テーブルで `enable row level security`。
- 例: `create policy select_own on income_streams for select using (auth.uid() = user_id);` 同様に insert/update/delete。
- Supabase Auth の GitHub Provider を有効化し、メール/パスワードは提供しない。
- HTTPS 強制 (Vercel) + Supabase プロジェクトの `Enforce TLS` をオン。

## 9. 非機能設計
- パフォーマンス: 月次配列は最大 (100-20)×12 ≈ 960ヶ月程度、フロント計算で問題なし。グラフは仮想スクロール/範囲絞りで描画負荷を抑制。
- エラーログ: Sentry（browser）。
- CI/CD: GitHub Actions -> lint/test -> Vercel deploy。Supabase migration は `supabase db push` をCIで実行。

## 10. テスト方針
- 単体: シミュレーション計算を pure function とし、Vitest/uvu で境界値（ボーナス変化点、繰り返しイベント、住宅購入時の家賃停止）。
- E2E: Playwrightで主要ユーザーフロー（ログイン→入力→計算表示）。
