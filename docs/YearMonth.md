# YearMonth: 調査・検討結果と実装プラン

## 目的
- シミュレーションのドメイン内部で `YearMonth` を Value Object として一貫利用し、`string` 依存と重複パースを解消する。
- DB/JSON/Client-Server の境界のみ `YearMonthString` を扱う設計に寄せる。

## 調査結果（現状）
- `src/shared/domain/simulation/types.ts` で `YearMonthString = string` がドメイン型に混入している。
- `simulate.ts` / `life-events.ts` / `timeline.ts` で `YearMonth.create()` の都度生成が散発。
- DB 由来の年月は `get-dashboard-simulation` の mapper で `YYYY-MM` に正規化している。
- UI/レスポンスでは `YearMonthString` が前提になっている。

### 主要な該当箇所
- ドメイン型: `src/shared/domain/simulation/types.ts`
- ドメインロジック: `src/shared/domain/simulation/simulate.ts`
- Timeline/LifeEvent: `src/shared/domain/simulation/timeline.ts`, `src/shared/domain/simulation/life-events.ts`
- 境界マッパー: `src/features/dashboard/queries/get-dashboard-simulation/mapper.ts`
- レスポンス型: `src/features/dashboard/queries/get-dashboard-simulation/response.ts`
- テスト: `tests/unit/src/shared/domain/simulation/*.test.ts`

## 検討結果（方針）
- ドメイン内部では `YearMonth` を使用する。
- DB/JSON/Client-Server 境界でのみ `YearMonthString` を使う。
- `YearMonthString | YearMonth` の union は採用しない。
- `YearMonth` は immutable であり、比較・演算は `YearMonth` のメソッドへ集約する。

## 実装プラン（段階的・安全）

### フェーズ 1: ドメイン型の分離
1. `src/shared/domain/simulation/types.ts` に `SimulationInput` / `SimulationResult` の
   "ドメイン版" を `YearMonth` 前提で定義する。
2. `YearMonthString` は境界用型として維持し、DTO/レスポンス向けに明示する。
3. テスト方針: 追加不要（型変更が主で挙動は変わらないため）。`pnpm typecheck` で確認する。

### フェーズ 2: Mapper で `YearMonth` を生成
1. `src/features/dashboard/queries/get-dashboard-simulation/mapper.ts` で
   `YearMonth.fromISOString()` を使い `YearMonth` を返すよう変更する。
2. `currentYearMonth` は `YearMonth.now()` を `SimulationInput` に渡す。
3. テスト方針: 追加不要（既存ユニットでシミュレーション実行の妥当性は担保される）。
   ただし、mapper 単体テストが無いので追加するなら
   `tests/unit/src/features/dashboard/get-dashboard-simulation.mapper.test.ts` を作成し、
   `YYYY-MM` と `YYYY-MM-01` の入力が `YearMonth` に正規化されることを検証する。

### フェーズ 3: シミュレーション内部の `YearMonth` 化
1. `src/shared/domain/simulation/timeline.ts` の `TimelineMonth.yearMonth` を `YearMonth` にする。
2. `src/shared/domain/simulation/life-events.ts` / `simulate.ts` の各関数引数・戻り値を
   `YearMonth` へ置換する。
3. `YearMonth.create()` の散発を削除し、比較・演算は VO メソッドに寄せる。
4. テスト方針: 既存ユニットテストの更新のみで十分。
   追加するなら `YearMonth` 同士の比較・範囲判定が正しいことを確認する
   `tests/unit/src/shared/domain/simulation/year-month-range.test.ts` を用意する。

### フェーズ 4: 境界レスポンスでの文字列変換
1. `get-dashboard-simulation` のレスポンス生成で `toString()` へ変換する。
2. `response.ts` の型は `YearMonthString` を維持する（境界型として）。
3. テスト方針: 追加不要（既存のシミュレーション unit で十分）。
   追加するなら `GetDashboardSimulationQueryHandler` の出力が `YYYY-MM` 文字列になることを
   1 ケース検証する（ハンドラ単体のユニット）。

### フェーズ 5: テスト更新
1. `tests/unit/src/shared/domain/simulation/*.test.ts` の入力を `YearMonth.create(...)` へ変更。
2. 出力の比較は `yearMonth.toString()` に揃える。
3. テスト方針: 追加不要（既存テストの更新で網羅性は維持される）。

## 自動テスト計画

### 事前確認（型/フォーマット）
- `pnpm lint`
- `pnpm typecheck`

### ユニットテスト
- `pnpm test:unit`

### 影響確認（任意）
- `pnpm test:integration`
- `pnpm test:e2e`

## 期待される効果
- `YearMonth.create()` の重複が排除され、ロジックが簡潔になる。
- ドメイン内部で不正な年月が混入しなくなる。
- 境界の変換責務が明確化される。
