# Value Object 導入: 調査・実装プラン

## 目的
- YearMonth / Money(Amount) を Value Object 化して、検証・変換・表示ロジックの散在を解消する。
- 既存のドメインモデル（例: `Asset`）と整合の取れた共通ルールを提供する。
- 既存機能の破壊的変更を避け、段階的に移行できる方針を整備する。

## 現状把握（初期調査の観点）
- YearMonth は `string` で扱われ、以下のような重複変換・検証が存在する。
  - `src/lib/year-month.ts` の変換関数（`toYearMonth` / `toRequiredYearMonth` / `toMonthStartDate`）
  - `src/features/inputs/shared/date.ts` の変換関数
  - `src/features/inputs/shared/form-utils.ts` の `YEAR_MONTH_REGEX` / Zod ルール
  - `src/shared/domain/simulation/timeline.ts` の `parseYearMonth` での検証
  - 画面や一覧での `formatYearMonth` / `formatAmount` の重複
- 金額は `number` で扱われ、UI側にフォーマット関数が点在している。

※ここは実装前に再調査して、該当ファイルや用途を正確に棚卸しする。

## 進め方（段階的導入の方針）

### フェーズ 1: 調査・設計
1. 影響範囲の棚卸し
   - YearMonth 変換・検証・表示の重複箇所を列挙
   - Amount/Money のフォーマット・計算の重複箇所を列挙
   - DB/DTO/API 境界での文字列 or 数値の取り扱いを明確化
   - 型定義の扱い方針（VO 導入時）
     - `src/shared/domain/simulation/types.ts` の `export type YearMonth = string` をどう扱うか設計で決める
     - 推奨方針: 境界（DTO/DB/Client-Server）用の `YearMonthString` を明示し、
       ドメイン内は VO 型へ寄せ、マッピング層で相互変換する
     - 過渡期でも `YearMonth = YearMonthString | YearMonthVO` のような union は避ける
   - 調査結果メモ（実装時に参照する箇所）
     - YearMonth 変換・正規化
       - `src/lib/year-month.ts`: `toYearMonth` / `toRequiredYearMonth` / `toMonthStartDate` / `getCurrentYearMonth`
       - `src/features/inputs/shared/date.ts`: `toYearMonthInput` / `toMonthStartDate` / `toOptionalMonthStartDate`
       - `src/features/dashboard/queries/get-dashboard-simulation/mapper.ts`: DB date -> `YYYY-MM`
       - `src/features/inputs/*/ui/mapper.ts`: UI `YYYY-MM` ⇄ DB `YYYY-MM-01` の変換
       - `src/app/e2e/seed/route.ts`: シード作成時の `toMonthStartDate` / `addMonths`
     - YearMonth 検証・演算
       - `src/features/inputs/shared/form-utils.ts`: `YEAR_MONTH_REGEX` / `requiredYearMonth` / `optionalYearMonth`
       - `src/features/inputs/life-events/ui/useLifeEventActions.ts`: 独自 `YEAR_MONTH_REGEX` と `requiredYearMonth`
       - `src/shared/domain/simulation/timeline.ts`: `parseYearMonth` / `yearMonthToElapsedMonths` / `elapsedMonthsToYearMonth` / `addMonths`
     - YearMonth 表示・並び替え
       - `src/features/inputs/life-events/ui/formatters.ts`: `formatYearMonth`
       - `src/app/(app)/inputs/page.tsx`: `formatYearMonth`（年・月の数値から表示）
       - `src/features/inputs/family/ui/FamilyForm.tsx`: `toYearMonthSortKey`
     - Money/Amount 表示（フォーマット）
       - `src/features/dashboard/ui/DashboardSimulationView.tsx`: `formatAmount`（`Math.round` + `ja-JP`）
       - `src/features/inputs/life-events/ui/formatters.ts`: `formatAmount`（四捨五入なし）
       - `src/app/(app)/inputs/page.tsx`: `formatAmount`（`formatValueOrFallback` 併用）
       - `tests/e2e/*.spec.ts`: `formatAmount`（`Math.round` + `ja-JP`）
     - Money/Amount 入力検証（数値文字列）
       - `src/features/inputs/shared/form-utils.ts`: `requiredNumericString` / `optionalNumericString`
       - `src/features/inputs/assets/ui/schema.ts`: ローカル定義の数値 Zod
       - `src/features/inputs/life-events/ui/useLifeEventActions.ts`: ローカル定義の数値 Zod
       - それ以外のフォームは `form-utils.ts` を参照（例: `expenses` / `income-streams` / `housing` / `pension` / `simulation`）
     - DB/DTO/API 境界
       - Supabase スキーマ: `supabase/migrations/20251225003000_create_core_tables.sql`（`date` 列）
       - 月初日制約: `supabase/migrations/20251225004000_add_constraints.sql`（`date_part('day') = 1`）
       - Supabase 型: `src/types/supabase.ts`（`year_month` は string）
       - Server Action request: `src/features/inputs/**/commands/*/request.ts`（`year_month` は `z.string().min(1)` が中心）
2. Value Object の責務定義
   - Zod は「入力境界の検証」
   - Value Object は「ドメインの正当性保証」
   - VO は「不正な状態での存在を許さない」を原則とする（不正値は生成不可）
   - 表示ロジックは VO に置くか、Formatter 層に置くか決める
   - 設計メモ（方針）
     - YearMonth はドメイン表現を `YYYY-MM` に統一し、DB 変換は `toMonthStartDate()` で `YYYY-MM-01` へ。
     - `create` / `fromDateString` などで入力境界（`YYYY-MM` / `YYYY-MM-01`）を吸収できるようにする。
     - 既存の `parseYearMonth` 相当の検証は VO に集約し、演算系は VO メソッドに寄せる。
     - Money は `number` を内包し、`format` は `ja-JP` を標準にする。
       - 既存実装に丸め有無の差があるため、`format({ round: true })` のようなオプションを設けるか、
         丸めの責務を呼び出し側に残すかを実装時に確定する。
       - `DashboardSimulationView` が `Math.round` を使っているため、UI 表示の安全策としては
         `format()` のデフォルトを「整数丸め」に寄せる設計が無難（必要なら無丸めを明示指定）
     - 非負制約は DB で担保されているため、VO は「有限数値」で統一し、
       非負制約が必要な箇所は `Money.requireNonNegative()` などで補強する（要実装判断）。
3. 置き場所の決定
   - 例: `src/shared/domain/value-objects/YearMonth.ts` / `Money.ts`
   - 既存の `Asset` との整合性チェック
   - 置き場所の具体案
     - VO 本体: `src/shared/domain/value-objects/YearMonth.ts` / `Money.ts`
     - UI 向け表示の薄いヘルパーは VO か `src/shared/utils/formatters.ts` の拡張で整理

### フェーズ 2: YearMonth Value Object の導入
1. 実装方針
   - `YearMonth.create(string)` で正当性検証
   - `toString()` で `YYYY-MM` へ戻せること
   - `toJapanese()` など UI 表示用の最小限の変換を用意（必要なら Formatter に分離）
   - `toMonthStartDate()` など既存 API と互換の変換を提供
   - `equals` / `isBefore` / `isAfter` など比較メソッドを用意する
   - `addMonths(months: number)` などの演算を提供する
   - `toJSON()` を実装し、`JSON.stringify` で `YYYY-MM` へ落とせるようにする
   - Next.js の Server Actions / RSC の境界では class インスタンスが通りにくい前提で、
     VO は渡さずに明示的に primitive へ変換する（`toJSON()` は保険扱い）
2. Zod スキーマの共有
   - `YearMonth.schema` を提供（または `YearMonth.validate()` など）
   - `form-utils.ts` の `requiredYearMonth` / `optionalYearMonth` を VO 基準に再定義
   - フォーム用（検証のみ）とドメイン用（VO 変換含む）のスキーマを使い分ける
   - フォーム用は `YearMonth.isValid(value)` を利用し、変換は境界層で行う
3. 既存ヘルパーの置き換え
   - `src/lib/year-month.ts` / `src/features/inputs/shared/date.ts` を VO ベースに再実装または統合
4. 影響の小さいところから移行
   - UI の `formatYearMonth` などを VO に置き換え
   - まず読み取り系から適用し、書き込み系は後回し

### フェーズ 3: Money(Amount) Value Object の導入
1. 実装方針
   - `Money.of(number)` で生成
   - `format()` で `ja-JP` 表示
   - `add` / `minus` など最小限の算術
   - 数値変換は `toNumber()` に限定
2. UI の `formatAmount` を VO へ集約
   - `DashboardSimulationView` / `LifeEventList` などの重複関数を置換

### フェーズ 4: ドメイン層での利用拡大
1. シミュレーションロジックへの適用
   - `src/shared/domain/simulation` で `YearMonth` / `Money` を徐々に適用
   - `parseYearMonth` などは VO の責務へ移動
2. 境界層（DTO/DB）とのマッピング整理
   - Supabase 型は文字列/数値のまま維持
   - Handler / Mapper で VO ⇄ primitive を変換
   - Client/Server や API の境界では primitive を基本とし、`toJSON()` は保険として使う

## 期待成果
- YearMonth / Money の検証と変換が一元化される。
- フォーマットや UI 表示の重複が削減される。
- ドメイン層での型安全性と保守性が向上する。

## リスクと対策
- **変換コスト増大**: 境界層での変換関数を明確化して混乱を防ぐ。
- **責務の曖昧化**: Zod と VO の責務を分離し、VO はドメイン用途に限定。
- **段階移行での不整合**: 一時的な二重実装を許容し、置換順を明示する。

## 実装完了のチェック項目（サンプル）
- `YEAR_MONTH_REGEX` 相当の検証が VO に集約されている
- `formatYearMonth` / `formatAmount` の重複が削減されている
- `form-utils.ts` が VO のルールを参照している
- 既存のシミュレーション結果に差分がない
- 主要フォームの入力検証が従来と同じ挙動で動作する

## 進捗管理の方針
- まず YearMonth から着手し、影響が限定的な箇所で試験導入する。
- 問題がなければ Money へ拡張する。
- テストはフォーム入力のバリデーション・既存シミュレーション結果の一致を優先する。
