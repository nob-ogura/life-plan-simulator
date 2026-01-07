# フェーズ 3: Money(Amount) Value Object の導入 タスク一覧

> 参照: docs/ValueObject.md の「フェーズ 3: Money(Amount) Value Object の導入」

## 1. Money Value Object の実装
- 作業内容
  - `Money.of(number)` で生成できるようにする
  - `toNumber()` で数値へ変換できるようにする
  - `format()` で `ja-JP` 表示できるようにする
  - `add` / `minus` など最小限の算術を提供する
  - 数値変換は `toNumber()` に限定し、暗黙の型変換を避ける

- 受入基準（Gherkin）
```gherkin
機能: Money Value Object

  シナリオ: 数値から生成して数値へ戻せる
    前提 1000 が有効な金額の数値である
    もし Money.of(1000) を実行する
    ならば 生成されたMoneyの toNumber() が 1000 になる

  シナリオ: 加算できる
    前提 Money.of(1200) と Money.of(300) がある
    もし add を実行する
    ならば 結果の toNumber() が 1500 になる

  シナリオ: 減算できる
    前提 Money.of(1200) と Money.of(300) がある
    もし minus を実行する
    ならば 結果の toNumber() が 900 になる

  シナリオ: 日本語ロケールで表示できる
    前提 Money.of(1234567) がある
    もし format() を実行する
    ならば 文字列が "1,234,567" を含む
```
- 自動テスト要否: 要
  - 理由: 金額計算はドメインの中核であり、丸めや計算順序の差がバグに直結するため
  - 想定テスト: Vitest の単体テストで生成/算術/フォーマットの正常系・境界系を確認

## 2. UI の formatAmount を Money へ集約
- 作業内容
  - `DashboardSimulationView` / `LifeEventList` などの `formatAmount` を VO の `format()` に置換する
  - 既存表示の丸め有無の差分を洗い出し、VO の `format()` または呼び出し側で差分を吸収する

- 受入基準（Gherkin）
```gherkin
機能: 金額表示の統一

  シナリオ: 既存画面の金額表示が従来と一致する
    前提 画面に 1234567 の金額が表示されるデータがある
    もし formatAmount を Money.format() に置換する
    ならば 表示文字列が従来と同じになる

  シナリオ: 丸め方針の差分が明示されている
    前提 既存UIで丸め有無が異なる表示が存在する
    もし Money.format() の適用を行う
    ならば どの画面が丸めを行うかがコード上で明示される
```
- 自動テスト要否: 条件付き
  - 理由: 表示変更は手動確認でも可能だが、丸め方針の差分は回帰しやすいため
  - 推奨: 表示のみの軽微変更は手動確認、丸め仕様に触れる場合はE2Eまたは結合テストを追加
