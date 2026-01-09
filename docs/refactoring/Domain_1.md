# Domain

## 背景
- ライフイベントの繰り返し条件、収入源の差分計算、資産枯渇判定が UI / Feature 内に分散しているため、ドメイン知識の重複と命名の混乱が発生している。
- 既存のドメイン層に整理して、表示ロジックと状態遷移ロジックの責務境界を明確にする。

## 調査結果

### 1. ライフイベントの繰り返し条件
- UI: `src/features/inputs/life-events/ui/formatters.ts` の `formatRepeat` が
  `repeat_interval_years`, `stop_after_occurrences`, `stop_after_age` を解釈して表示文を生成。
- ドメイン: `src/shared/domain/simulation/life-events.ts` の `expandLifeEvents` が
  同じフィールドを解釈して繰り返しイベントを展開。
- 入力バリデーション: `src/features/inputs/life-events/ui/useLifeEventActions.ts`
  で `stop_after_occurrences` は正の整数、`stop_after_age` は 0〜120 を許容。
- 解析結果:
  - `repeat_interval_years <= 0` は UI では「なし」、ドメイン側は 1 回のみで終了。
  - `stop_after_occurrences <= 0` / `stop_after_age < 0` の扱いが明確化されていない。
  - UI 表示とドメイン展開のルールが分散しており、仕様変更時の乖離リスクがある。

### 2. IncomeStream の差分計算
- `src/features/inputs/income-streams/commands/bulk-save-income-streams/domain/diff.ts`
  は Bulk Save 専用の差分計算。
- `BulkSaveIncomeStreamsRequest` 依存かつ Supabase 送信用 payload 生成が含まれる。
- 解析結果:
  - 共有ドメインとしての独立性が弱く、命名 (`domain/`) が誤解を招きやすい。
  - 他の Feature からの再利用は現時点で見当たらない。

### 3. 資産枯渇判定の重複
- ドメイン: `src/shared/domain/simulation/analytics.ts` の
  `findDepletionYearMonth` が枯渇判定の正を保持。
- UI: `src/features/dashboard/ui/AssetTrendChart.tsx` が
  `totalBalance < 0` を直接判定して重複。
- 解析結果:
  - 枯渇定義変更時に UI が追従できない可能性がある。

## 検討方針

### 1. ライフイベントの繰り返し条件
- 繰り返しルールはドメイン知識として `shared/domain` に集約する。
- UI は「説明文生成」をドメイン関数に委譲し、重複解釈を排除する。
- `expandLifeEvents` も同じ正規化ルールを利用することで表示と展開を一致させる。

### 2. IncomeStream の差分計算
- 現状はアプリケーションサービス寄りのロジック。
- 共有を前提にしない場合は `domain/` をやめ、Feature 内の `utils` / `services` へ移動。
- 将来的に共有する場合は、ドメイン差分（同一性）とインフラ向け payload 生成を分離する。

### 3. 資産枯渇判定
- 枯渇条件の単一ソースを維持するため、UI から `findDepletionYearMonth` を使用する。

## 実装プラン

### Step 1: ライフイベント繰り返しのドメイン集約
- `src/shared/domain/life-events/repeat.ts`（新規）を追加。
- 例: `normalizeLifeEventRepeat(...)` / `describeLifeEventRepeat(...)` を提供し、
  ルールを正規化したうえで表示文を返す。
- `expandLifeEvents` は正規化結果を利用し、`repeat_interval_years <= 0` や
  `stop_after_occurrences <= 0` / `stop_after_age < 0` を「無効値」として扱う。
- `formatRepeat` は `describeLifeEventRepeat` を呼ぶだけに変更。
- テスト追加:
  - `tests/unit/...` に repeat ルールの境界値テストを用意
  - 「年数なし」「回数停止」「年齢停止」「両方指定」の組み合わせを網羅

### Step 2: IncomeStream 差分ロジックの配置整理
- `src/features/inputs/income-streams/commands/bulk-save-income-streams/domain/diff.ts`
  を `services/`（または `utils/`）へ移動。
- import 先を一括更新し、命名をアプリケーションロジックとして明確化。
- 共有化する場合は、
  1) ドメイン差分 (`id` 同一性と集合差分のみ)
  2) payload 変換（`YearMonth` 変換など）
  に分割する。

### Step 3: 枯渇判定の一元化
- `AssetTrendChart` 内の `totalBalance < 0` 判定を削除。
- `depletionYearMonth` が未指定の場合は `findDepletionYearMonth` を用いるか、
  もしくは親コンポーネント側で必ず計算して渡す。

### Step 4: 動作確認
- 影響 UI の表示文（繰り返し説明、枯渇ハイライト）が一致することを確認。
- 必要に応じて `pnpm test:unit` の対象テストを追加・実行する。
