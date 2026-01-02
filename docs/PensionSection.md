# 年金セクション統合（実コード準拠）修正案

## 目的
- 年金開始年齢と年金月額（単身・配偶者）を 1 セクションに統合し、ユーザーの入力導線を明確にする。
- 既存データ構造（profiles / simulation_settings）を維持しつつ UI と保存処理を集約する。

## 影響範囲（現行コード起点）
- UI/フォーム
  - `src/features/inputs/pension/ui/PensionForm.tsx`
  - `src/features/inputs/pension/ui/schema.ts`
  - `src/features/inputs/pension/ui/mapper.ts`
  - `src/features/inputs/simulation/ui/SimulationForm.tsx`
  - `src/features/inputs/simulation/ui/schema.ts`
  - `src/features/inputs/simulation/ui/mapper.ts`
- ページ構成
  - `src/app/(app)/inputs/page.tsx`
- 既存アクション（変更なしで使用）
  - `src/features/inputs/profiles/commands/upsert-profile/action.ts`
  - `src/features/inputs/simulation-settings/commands/update-simulation-settings/action.ts`
  - `src/features/inputs/simulation-settings/commands/create-simulation-settings/action.ts`

## 修正方針（実コード準拠）
### 1. PensionForm に年金月額を追加
- `PensionSectionSchema` に `pension_amount_single`, `pension_amount_spouse` を追加。
- 既存の `requiredNumericString` に加えて `optionalNumericString` を使う。
- `buildPensionSectionDefaults` に `simulation_settings` の値を合流。
- `PensionForm` で `profiles` と `simulation_settings` の更新を並行実行。
  - `upsertProfileAction` は `{ patch: { ... } }` 形式を守る。
  - `updateSimulationSettingsAction` は `{ id, patch }` 形式を守る。
  - `createSimulationSettingsAction` は `end_age` が必須。新規作成時は `end_age: 100` を付与する（既存 DB の default と整合）。

### 2. SimulationForm から年金月額を削除
- スキーマ、マッパー、フォーム UI、保存 payload から年金月額を削除。
- 「シミュレーション設定」の説明文から年金記述を削除する。

### 3. Inputs ページの統合表示
- 年金セクションのタイトル／説明／サマリー／rows を年金開始年齢 + 月額に対応。
- `PensionForm` に `simulationSettingsId` を渡すよう変更。
- `buildPensionSectionDefaults` に `simulation_settings` を渡す。
- `SimulationForm` セクションの rows から年金月額を削除。

## 具体的な変更案（ポイント）
### A. スキーマ/マッパー
- `src/features/inputs/pension/ui/schema.ts`
  - `pension_amount_single`, `pension_amount_spouse` を `optionalNumericString` で追加。
- `src/features/inputs/pension/ui/mapper.ts`
  - `buildPensionSectionDefaults(profile, simulationSettings)` に変更。
  - `simulationSettings?.pension_amount_single/spouse` を合流。

### B. PensionForm
- `src/features/inputs/pension/ui/PensionForm.tsx`
  - props に `simulationSettingsId: string | null` を追加。
  - 年金月額 UI を追加。
  - 保存時に `upsertProfileAction({ patch: { pension_start_age } })` を実行。
  - 併せて `simulation_settings` を更新/作成する。
    - 例: `updateSimulationSettingsAction({ id, patch: { pension_amount_single, pension_amount_spouse } })`
    - 作成時は `createSimulationSettingsAction({ end_age: 100, pension_amount_single, pension_amount_spouse })`

### C. SimulationForm
- `src/features/inputs/simulation/ui/schema.ts`
  - `pension_amount_single`, `pension_amount_spouse` を削除。
- `src/features/inputs/simulation/ui/mapper.ts`
  - 2項目のマッピングを削除。
- `src/features/inputs/simulation/ui/SimulationForm.tsx`
  - 年金月額の UI ブロックを削除。
  - payload から年金月額を削除。
  - 説明文を「期間と係数」に限定。

### D. InputsPage
- `src/app/(app)/inputs/page.tsx`
  - `buildPensionSectionDefaults(profile, data.simulationSettings)` へ変更。
  - `PensionForm` に `simulationSettingsId` を渡す。
  - 年金セクションの title/description/summary/rows を拡張。
  - シミュレーションセクションの rows から年金月額を削除。

## 仕様上の注意点
- `pension_start_age` は現状必須。年金月額は optional で保持。
- 年金セクションの「設定済み」判定は、開始年齢のみか、月額どちらか入力で OK にするか検討。
  - 例: `pensionStartAge != null || pensionAmountSingle != null || pensionAmountSpouse != null`
- `Promise.all` で profile と settings を同時更新する場合、片方成功の可能性がある。
  - 一貫性を重視するなら RPC/トランザクション化を検討（今回は現行方針に合わせて並列更新）。
 - スキーマ移行時は `optionalNumericString` などのバリデーション規約をそのまま維持する。
 - `simulation_settings` が未作成の場合は `createSimulationSettingsAction` を呼ぶため、
   `end_age` を必須値として明示的に渡す（現行スキーマでは必須）。
 - 部分失敗をユーザーに誤解させないよう、`Promise.allSettled` で結果を判定するか、
   失敗時メッセージを「一部の保存に失敗しました」などにすることを検討する。

## 実行プラン
1. スキーマ・マッパー更新
   - `src/features/inputs/pension/ui/schema.ts`
   - `src/features/inputs/pension/ui/mapper.ts`
   - `src/features/inputs/simulation/ui/schema.ts`
   - `src/features/inputs/simulation/ui/mapper.ts`
2. フォーム UI と保存処理更新
   - `src/features/inputs/pension/ui/PensionForm.tsx`
   - `src/features/inputs/simulation/ui/SimulationForm.tsx`
3. 入力ページの統合表示更新
   - `src/app/(app)/inputs/page.tsx`
4. テスト観点の更新
   - Unit: `src/features/inputs/pension/ui/schema.test.ts` を新仕様に合わせて更新
   - Unit: Simulation 系のスキーマ/マッパーが対象テストを持つ場合は削除・更新
   - Integration: `simulation_settings` を作成/更新するパス（action/handler）に影響がないか確認
   - E2E: 入力ページでの保存フロー（年金セクションで開始年齢 + 月額入力 → サマリー反映）
5. 実行確認
   - `pnpm lint` / `pnpm typecheck`
   - UI 動作確認（年金セクション保存と反映）
