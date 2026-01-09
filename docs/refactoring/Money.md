# Money Value Object 実装プラン

本ドキュメントは、Money/YearMonth 周辺の調査結果と検討内容に基づき、実装の段取りと設計方針をまとめる。

## 背景と目的
- `Money` に集約されるべき丸め・金額演算がドメイン外に漏れている
- 住宅購入・固定資産税などドメイン計算で `number` 演算が混在している
- ダッシュボード集計は表現/可読性の改善余地がある

## 現状の課題（要約）
- `src/features/dashboard/shared/summary.ts` で `number` 演算が中心
- `src/shared/domain/simulation/life-events.ts` で金額演算が `number` のまま進む
- `Money` は `add/minus/multiply` のみで、割り算・丸め制御が不足

## 設計方針（重要）
- 既存 `Money.multiply` の挙動は変えない（後方互換性を維持）
- 丸めは「どこで」「どのモードで」行うかを明示する
- 税額などの端数処理は、計算ステップと結びつけてコメントで明文化
- まずドメイン計算（life-events）に適用し、UI 集計は必要に応じて段階的に適用

## 実装プラン

### Step 1: Money の機能拡充（基盤）
対象: `src/shared/domain/value-objects/Money.ts`

追加内容（決定）:
- `divideAndRound(divisor: number, mode: MoneyRoundingMode): Money`
- `multiplyAndRound(factor: number, mode: MoneyRoundingMode): Money`
- 既存 `multiply` は変更しない（丸め無しのまま）

理由:
- 既存の挙動変更による暗黙的な数値変化を防ぐ
- 呼び出し側で「丸めの意図」を明示できる

注意点:
- `mode` をデフォルトにしない（呼び出し側で明示）
- `divideAndRound` は 0 除算チェック必須
- `divideAndRound` / `multiplyAndRound` は `Money.fromFloat` を経由して丸める
- `round` は `Math.round` のため、四捨五入の挙動は JS 標準に従う

メソッド仕様（案）:
- `multiplyAndRound(factor, mode)`
  - 事前条件: `factor` は有限数
  - 振る舞い: `Money.fromFloat(this.value * factor, mode)` を返す
- `divideAndRound(divisor, mode)`
  - 事前条件: `divisor` は有限数かつ 0 ではない
  - 振る舞い: `Money.fromFloat(this.value / divisor, mode)` を返す

採用しない案:
- 既存 `multiply` に丸めモード引数を追加する（互換性リスクが高い）
- `divide`（丸め無し）の追加（必要になったら別途検討）

### Step 2: 住宅購入・固定資産税計算への適用（ドメイン強化）
対象: `src/shared/domain/simulation/life-events.ts`

方針:
- 金額演算は `Money` を起点に組み立てる
- 丸めのタイミングを計算ステップに紐づけて明示

想定フロー（例）:
1. 建物+土地を `Money` で合算
2. 評価額算出で丸め
3. 年税額算出で丸め
4. 月割りで丸め（切り上げ/切り捨て等は仕様に合わせる）

端数処理ルール:
- 評価額算出: `trunc`（1円未満切り捨ての意図）
- 年税額算出: `trunc`
- 月割り: `ceil`（月額は不足が出ないよう切り上げの意図）

備考:
- `floor/ceil/trunc` の選択は税制仕様に合わせて決定
- 負数の丸めは `floor` と `trunc` で結果が変わるため注意

実装イメージ（案）:
- `totalValue = Money.of(buildingPrice).add(Money.of(landPrice))`
- `assessedValue = totalValue.multiplyAndRound(evaluationRate, "trunc")`
- `annualTax = assessedValue.multiplyAndRound(taxRate, "trunc")`
- `monthlyTax = annualTax.divideAndRound(12, "ceil")`

### Step 3: ダッシュボード集計への適用
対象: `src/features/dashboard/shared/summary.ts`

方針:
- 計算量・可読性のバランスを優先
- `findDepletionYearMonth` は `Money.isNegative()` で表現統一する案を優先
- 集計は `number` のままでも可（必要なら最終結果のみ `Money` で包む）

## テスト方針
- `Money` の新規メソッドに対するユニットテスト
- `life-events` の丸め位置を固定するテスト（期待値の明文化）

## 次アクション
1. `Money` の新メソッド設計を確定（`divideAndRound` / `multiplyAndRound`）
2. `life-events` での丸め仕様を確定（税制・月割り）
3. ドメイン計算の変更 → 必要ならダッシュボードへ最小適用
