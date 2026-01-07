# フェーズ 2: YearMonth Value Object の導入 タスク一覧

> 参照: docs/ValueObject.md の「フェーズ 2: YearMonth Value Object の導入」

## 1. YearMonth Value Object の実装
- 作業内容
  - `YearMonth.create(string)` で正当性検証し生成できるようにする
  - `toString()` で `YYYY-MM` を返す
  - `toJapanese()` など最小限の表示変換を用意する（必要最小限）
  - `toMonthStartDate()` を提供する
  - `equals` / `isBefore` / `isAfter` / `addMonths` を提供する
  - `toJSON()` で `YYYY-MM` に変換できるようにする

- 受入基準（Gherkin）
```gherkin
機能: YearMonth Value Object

  シナリオ: 正しいYYYY-MMで生成できる
    前提 "2025-01" が有効なYearMonth文字列である
    もし YearMonth.create("2025-01") を実行する
    ならば 生成されたYearMonthの toString() が "2025-01" になる

  シナリオ: 不正な文字列は生成できない
    前提 "2025-13" が無効なYearMonth文字列である
    もし YearMonth.create("2025-13") を実行する
    ならば エラーが発生する

  シナリオ: 月初日文字列へ変換できる
    前提 YearMonth.create("2024-12") がある
    もし toMonthStartDate() を実行する
    ならば 結果が "2024-12-01" になる

  シナリオ: JSON化でYYYY-MMに落とせる
    前提 YearMonth.create("2023-07") がある
    もし JSON.stringify を実行する
    ならば 文字列に "2023-07" が含まれる
```
- 自動テスト要否: 要
  - 理由: 純粋関数的な振る舞いで境界条件が多く、回帰リスクが高い
  - 想定テスト: Vitest の単体テストで create/toString/toMonthStartDate/比較/加算/JSON を網羅

## 2. Zod スキーマと検証ロジックの共有
- 作業内容
  - `YearMonth.schema` もしくは `YearMonth.validate()` を提供する
  - `form-utils.ts` の `requiredYearMonth` / `optionalYearMonth` を VO 基準に再定義する
  - フォーム用（検証のみ）とドメイン用（VO 変換含む）のスキーマを使い分ける

- 受入基準（Gherkin）
```gherkin
機能: YearMonth 検証の統一

  シナリオ: フォーム用検証はVOのルールに従う
    前提 フォーム入力値が "2025-02" である
    もし requiredYearMonth を適用する
    ならば 検証が成功する

  シナリオ: フォーム用検証はVOのルールで弾く
    前提 フォーム入力値が "2025-00" である
    もし requiredYearMonth を適用する
    ならば 検証が失敗する
```
- 自動テスト要否: 要
  - 理由: 入力バリデーションの仕様差分がバグに直結するため
  - 想定テスト: Vitest の単体テストで required/optional の正常系・異常系を確認

## 3. 既存ヘルパーの YearMonth VO 置き換え
- 作業内容
  - `src/lib/year-month.ts` と `src/features/inputs/shared/date.ts` を VO ベースで再実装または統合する
  - 既存 API の互換性（入力・出力）を保つ

- 受入基準（Gherkin）
```gherkin
機能: 既存ヘルパーのVO化

  シナリオ: 既存APIの入出力互換を保つ
    前提 旧実装で "2025-03" を入力した場合の結果がある
    もし 新実装の対応関数に "2025-03" を入力する
    ならば 旧実装と同じ形式の値が得られる
```
- 自動テスト要否: 要
  - 理由: 既存API互換の確認は手作業だと漏れやすい
  - 想定テスト: 既存ユーティリティのテストを更新し、旧挙動のスナップショット/比較を追加

## 4. 影響の小さい箇所から段階移行
- 作業内容
  - UI の `formatYearMonth` を VO の `toJapanese()` 等に置換する
  - まず読み取り系の画面・一覧表示で適用し、書き込み系は後回しにする
  - RSC / Server Actions 境界では VO ではなく primitive を渡す

- 受入基準（Gherkin）
```gherkin
機能: 段階移行の安全性

  シナリオ: 読み取り系の表示が従来通りである
    前提 画面に "2025-04" が表示されるデータがある
    もし VO 経由の表示に切り替える
    ならば 表示内容が従来と同じになる

  シナリオ: サーバー境界はprimitiveで受け渡す
    前提 RSC または Server Action に YearMonth を渡す処理がある
    もし VO を利用する
    ならば 境界では toString() または toJSON() の値を渡す
```
- 自動テスト要否: 条件付き
  - 理由: 表示の変更が中心だが、RSC/Server Actions 境界の不具合は発見が遅れやすい
  - 推奨: 表示のみの軽微変更は手動確認、境界処理に手を入れる場合は結合テスト/軽いE2Eを追加
