# Domain

## 背景
- 「不変条件（Invariant）や初期値がアプリケーション層に漏れている」指摘が複数箇所で発生している。
- 退職金の一意性、シミュレーション実行条件、IncomeStream 初期値、住宅ローン/住宅購入のロジック分断が主な対象。
- ドメイン知識の所在を明確化し、DB・ドメイン・アプリケーション層の責務境界を再整理する。

## 調査結果

### 1. 退職金データの一意性保証
- 対象: `src/features/inputs/life-events/commands/upsert-retirement-bonus/repository.ts`
- 既存の実装は、`life_events` から `category = 'retirement_bonus'` を検索し、
  先頭を更新・残りを削除する手続き的な整合性維持を行っている。
- DB 側には `life_events` の一意制約がなく（`supabase/migrations/20251225005000_add_indexes.sql` 参照）、
  退職金の「ユーザーごと1件」不変条件はインフラ層に寄っている。
- 既存データに重複があっても運用上は “整理” し続ける設計だが、
  並行更新・別経路の書き込みでは漏れる可能性がある。

### 2. シミュレーション実行の事前条件チェック
- 対象: `src/features/dashboard/queries/get-dashboard-simulation/handler.ts`
- `hasRequiredProfile` が「生年月が必須」であることをアプリケーション層で判定している。
- ドメイン側では `generateMonthlyTimeline` が生年月欠落で例外を投げる
  (`src/shared/domain/simulation/timeline.ts`) ため、
  アプリ側のガードがないとドメイン例外で落ちる構造になっている。
- `stop_after_age` を含むライフイベント展開でも生年月が必要であり、
  ドメイン側は “必須” として扱っているが、明示的な公開 API がない。

### 3. IncomeStream 生成時のデフォルト値
- 対象: `src/features/inputs/income-streams/commands/bulk-save-income-streams/services/diff-income-streams.ts`
- `toCreatePayload` が `bonus_months = []`, `bonus_amount = 0` などの初期値を直接埋めている。
- DB には `bonus_months` の default はあるが `bonus_amount` には default がない
  (`supabase/migrations/20251225003000_create_core_tables.sql` 参照)。
- 初期状態に関する知識がアプリ層に存在し、他の作成経路で再現が必要になる。

### 4. 住宅ローン計算ロジックの分断
- ドメイン: `src/shared/domain/simulation/life-events.ts` の
  `deriveHousingPurchaseMetrics` が借入額（principal）と不動産税を算出。
- シミュレーション: `simulate.ts` は `realEstateTaxMonthly` のみ利用し、
  `principal` は未使用。`mortgages` 入力も計算に未使用。
- UI: `src/features/inputs/housing/ui/HousingForm.tsx` は principal を手入力させ、
  建物/土地/頭金は同時に保存しているが、ドメインの計算ロジックは未利用。
- 結果として、ドメインロジックと UI/入力・シミュレーションが分断されている。

## 検討方針

### 1. 退職金の一意性は DB で保証し、ドメインは明示的に扱う
- 物理的な整合性は DB の部分一意制約で担保する。
- ドメイン側には「退職金は1件」という知識を表現する API
  （Factory / Aggregate / Guard）を追加し、意図を明示する。
- 既存の重複データ整理方針（最新を残す等）を定義したうえで移行する。

### 2. シミュレーション前提条件のドメイン化
- ドメイン層に `canSimulate` / `assertSimulationReady` のような関数を追加し、
  「生年月必須」や「設定必須」の条件を明示する。
- アプリケーション層はその結果を解釈して `null` 返却に変換する。

### 3. IncomeStream 初期値はドメインの Factory に移管
- `IncomeStream.create` などの Factory で初期値を決定する。
- アプリ層は「入力値の変換（YearMonth 変換など）」のみを担当する。
- DB 側にも必要な default を追加し、経路の違いによる欠損を防ぐ。

### 4. 住宅ローン/住宅購入ロジックの統合
- まず “principal は導出値か手入力か” の仕様を確認し、単一の正を決める。
- 導出値であれば UI はドメイン関数で算出・表示し、保存は導出値を利用。
- 手入力を許す場合は、ドメイン側（シミュレーション）が principal を利用する
  設計へ寄せる。

## 実装プラン

### Step 1: 退職金の一意性を DB 制約に移行
- `supabase/migrations` に部分一意制約を追加:
  - `create unique index ... on public.life_events (user_id) where category = 'retirement_bonus';`
- 既存の重複データ整理:
  - 既存方針に合わせて `year_month` の最新を残す SQL を同 migration 内で実行。
- `SupabaseUpsertRetirementBonusRepository` の手続きロジックを単純化:
  - `insert ... on conflict`（または update 先取得）で 1 件に集約。
  - 重複削除の処理は削除。

### Step 2: シミュレーションの前提条件をドメインへ移動
- `src/shared/domain/simulation/guard.ts`（仮）を追加し、
  `isSimulationReady(profile, settings)` を提供。
- `GetDashboardSimulationQueryHandler` は guard を利用し、
  不足時は `result: null` を返す。
- `simulateLifePlan` 側でも guard を適用（例外→明示的エラー）するかを決定。

### Step 3: IncomeStream 初期値の Factory 化
- `src/shared/domain/income-streams/factory.ts`を追加。
- `toCreatePayload` は Factory の結果を利用し、初期値はドメイン側に移譲。
- DB default を追加する場合は migration で `bonus_amount default 0` などを設定。

### Step 4: 住宅ローン計算の統合方針を反映
- 仕様決定:
  1) principal 自動算出 / 2) principal 手入力
- 1) を選ぶ場合:
  - UI で `calculateMortgagePrincipal` を利用し、principal を表示専用 or 初期値化。
  - 保存時はドメイン算出値を送信。
- 2) を選ぶ場合:
  - `simulate.ts` に mortgages の反映ロジックを追加（支払い計算など）。
  - `deriveHousingPurchaseMetrics` の principal 依存関係を整理。

### Step 5: 動作確認
- DB migration 適用後に重複退職金が作成できないことを確認。
- シミュレーションが “未入力 → null / 入力済み → 実行” の挙動になることを確認。
- IncomeStream 作成時の初期値が UI/他経路で統一されることを確認。
