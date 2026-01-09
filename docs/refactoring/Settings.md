# Settings 分離と初期値方針

## 目的
- Inputs（Facts）と Settings（Assumptions）を分離し、UI/UX と責務を明確化する。
- Settings は「推奨値を初期値として保存」し、日常入力の負荷を下げる。

## 実装方針
### 1. 画面の責務分離
- `Inputs` は生活データ（家族、収入、支出、住宅、年金など）に集中する。
- `Settings` は計算の前提条件（終了年齢、開始オフセット、住宅係数など）に集中する。
- 年金（`PensionForm`）は収入情報として Inputs に残す。

### 2. データ構造の扱い
- `simulation_settings` テーブルは以下の2系統を保持する。
  - シミュレーション設定（Settings 側）
  - 年金額（Inputs 側）
- Settings ページでは `simulation_settings` を読み取り、SimulationForm を表示する。
- Inputs ページでは引き続き `simulation_settings` から年金関連の値を参照する。

### 3. 推奨値は DB に保持し、初回作成時に保存
- 推奨値は **DB の column default** として保持する。
- `handle_new_user` トリガーで `simulation_settings` を **user_id のみ**で insert し、DB の default 値を初期値として保存する。
- 既存ユーザーで `simulation_settings` が欠落している場合は、
  - バックフィル用の migration で作成する
  - もしくはサーバー側で「欠落時に defaults で作成」する補助処理を追加する
- UI では placeholder ではなく **実値（DB 由来）**を表示する。

### 4. 「初期値に戻す」ボタン
- ラベルは **「初期値に戻す」** とする。
- 推奨値は DB にあるため、リセットは **DB default を再適用**する。
- Supabase の update では `DEFAULT` 指定ができないため、以下のいずれかを採用する。
  - RPC（PostgreSQL 関数）で `SET column = DEFAULT` を実行
  - defaults テーブルを追加し、その値で update
- シンプルさを優先する場合は **RPC 方式**を採用する。

## 実装プラン
### Step 1: Settings ページの新設
- `src/app/(app)/settings/page.tsx` を新規作成。
- `simulation_settings` の取得ロジックと `SimulationForm` 表示を移植。
- `buildSimulationSectionDefaults` を利用して初期値を構築。

### Step 2: Inputs から Simulation 設定を削除
- `src/app/(app)/inputs/page.tsx` から Simulation セクションを削除。
- Pension セクションは残し、`simulation_settings` 参照は継続。

### Step 3: 「初期値に戻す」アクションの追加
- `SimulationForm` に「初期値に戻す」ボタンを追加。
- 新規 Server Action（例: `resetSimulationSettingsAction`）を作成。
- Repository から RPC を呼び出し、以下の SQL を実行する関数を作成。
  - `update simulation_settings set ... = default where user_id = auth.uid()`

### Step 4: DB 側の defaults 管理
- 推奨値の見直しが必要な場合は migration を作成し、column default を更新。
- 既存レコードは 既存値を維持。

### Step 5: 動作確認
- Settings ページで初期値が表示されること。
- Inputs ページから Simulation セクションが消えていること。
- 「初期値に戻す」で DB 推奨値が反映されること。
- `simulation_settings` 欠落時も自動生成できること（必要なら）

## テスト観点
### Unit
- `SimulationForm` の入力→payload 変換が想定通り（数値文字列→number、未入力は undefined）であること。
- 「初期値に戻す」ボタン押下時に、アクション呼び出しと UI state の更新が行われること。

### Integration
- `resetSimulationSettingsAction` が `simulation_settings` を DB default に戻すこと。
- `createSimulationSettingsAction` が defaults を上書きしないこと（未指定項目は DB default を利用）。

### E2E
- Settings ページで既存データが読み取れること。
- 「初期値に戻す」で表示値が推奨値に戻ること。
- Inputs から Simulation セクションが削除され、Pension が残ること。
