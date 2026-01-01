# Expense Categories 厳密化プラン

目的: 定期支出のカテゴリを正一覧化し、UI/バリデーション/DB で一貫した厳密入力を保証する。

前提:
- 既存データは存在しないため、移行補正は不要。
- 既存テストで `expenses.category = "living"` が使用されているため、この値は必須とする。

## 1. カテゴリ候補セット

生活の月次支出を広くカバーしつつ、既存ドメイン（rentals/mortgages）と衝突しない設計。
「住居費」は家賃・ローンではなく、管理費/修繕/住居関連費を想定。

```ts
export const EXPENSE_CATEGORIES = [
  { value: "living", label: "生活費" },
  { value: "food", label: "食費" },
  { value: "housing", label: "住居関連費" },
  { value: "utilities", label: "水道光熱費" },
  { value: "communication", label: "通信費" },
  { value: "insurance", label: "保険" },
  { value: "transportation", label: "交通費" },
  { value: "medical", label: "医療費" },
  { value: "education", label: "教育費" },
  { value: "childcare", label: "育児費" },
  { value: "hobby", label: "趣味・娯楽" },
  { value: "other", label: "その他" },
] as const;
```

補足:
- `rentals` / `mortgages` と役割が重なるため、家賃/ローンは本カテゴリでは扱わない想定。
- カテゴリは将来の集計/フィルタ/翻訳の安定性を優先して英語キー固定とする。

## 2. 共有ドメイン定義の追加

### 2.1 新規定義ファイル
- 追加: `src/shared/domain/expenses/categories.ts`
- 役割:
  - カテゴリの正一覧 (value/label)
  - 型 (`ExpenseCategory`) の提供
  - enum 値配列 (`EXPENSE_CATEGORY_VALUES`)
  - 表示用 Map (`EXPENSE_CATEGORY_LABELS`)

```ts
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];
export const EXPENSE_CATEGORY_VALUES = EXPENSE_CATEGORIES.map(
  (category) => category.value,
) as [ExpenseCategory, ...ExpenseCategory[]];
export const EXPENSE_CATEGORY_LABELS = new Map(
  EXPENSE_CATEGORIES.map((category) => [category.value, category.label]),
);
```

## 3. UI の厳密化（推奨: ネイティブ select）

### 3.1 方針
- **自由入力は廃止**し、カテゴリは選択式に固定する。
- ブラウザ依存が少ない **`<select>` を推奨**（datalist は入力揺れが残るため不採用）。

### 3.2 実装イメージ
- `src/features/inputs/expenses/ui/ExpenseForm.tsx`
  - `Input` を `select` に置き換え。
  - 初期値は空文字で placeholder 表示。
  - `EXPENSE_CATEGORIES` から options を生成。

```tsx
<FormControl>
  <select {...field} className="h-10 w-full rounded-md border border-input bg-background px-3">
    <option value="">選択してください</option>
    {EXPENSE_CATEGORIES.map((category) => (
      <option key={category.value} value={category.value}>
        {category.label}
      </option>
    ))}
  </select>
</FormControl>
```

## 4. バリデーションの厳格化

- `src/features/inputs/expenses/ui/schema.ts`
  - `category` を `z.enum(EXPENSE_CATEGORY_VALUES)` に変更。
  - UI の空文字許容と併用する場合は union + refine で必須化。

```ts
const expenseCategorySchema = z.enum(EXPENSE_CATEGORY_VALUES);
const categorySchema = z
  .union([expenseCategorySchema, z.literal("")])
  .refine((value) => value !== "", { message: "必須項目です" });
```
