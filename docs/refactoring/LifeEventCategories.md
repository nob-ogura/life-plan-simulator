# Life Event Categories 集約プラン

目的: ライフイベントカテゴリの正一覧を単一の定義に集約し、UI/バリデーション/DB で整合性を担保する。

## 1. 共有ドメインへのカテゴリ定義集約

### 1.1 新規定義ファイルを作成
- 新規ファイル: `src/shared/domain/life-events/categories.ts`
- 役割:
  - カテゴリの正一覧 (value/label)
  - 型 (`LifeEventCategory`) の提供
  - 退職金/住宅購入の判定ユーティリティ
  - UI 用の一般カテゴリ一覧 (退職金除外)
  - ラベル参照用 Map

#### 例
```ts
export const LIFE_EVENT_CATEGORIES = [
  { value: "education", label: "教育" },
  { value: "travel", label: "旅行" },
  { value: "care", label: "介護" },
  { value: "medical", label: "医療" },
  { value: "car", label: "車" },
  { value: "housing_purchase", label: "住宅購入" },
  { value: "other", label: "その他" },
  { value: "retirement_bonus", label: "退職金" },
] as const;

export type LifeEventCategory = (typeof LIFE_EVENT_CATEGORIES)[number]["value"];

export const GENERAL_LIFE_EVENT_CATEGORIES = LIFE_EVENT_CATEGORIES.filter(
  (category) => category.value !== "retirement_bonus",
);

export const LIFE_EVENT_CATEGORY_LABELS = new Map(
  LIFE_EVENT_CATEGORIES.map((category) => [category.value, category.label]),
);

export const isRetirementBonus = (category: LifeEventCategory) =>
  category === "retirement_bonus";

export const isHousingPurchase = (category: LifeEventCategory) =>
  category === "housing_purchase";
```

### 1.2 既存コードの参照を置き換え
- `src/features/inputs/life-events/ui/formatters.ts`
  - `LIFE_EVENT_CATEGORIES` / `categoryLabels` を shared から import に変更。
- `src/features/inputs/life-events/ui/LifeEventAddModal.tsx`
  - `GENERAL_LIFE_EVENT_CATEGORIES` を使って datalist を構築。
- `src/features/inputs/life-events/ui/useLifeEventActions.ts`
  - `isRetirementBonus` / `isHousingPurchase` を利用。
- `src/shared/domain/simulation/simulate.ts`
  - 文字列比較を `LifeEventCategory` 型 + ヘルパーへ寄せる。
- テスト/seed (`src/shared/domain/simulation/*.test.ts`, `src/app/e2e/seed/route.ts`)
  - `LifeEventCategory` 型でカテゴリの型安全性を確保。

## 2. Zod バリデーションの厳格化

### 2.1 入力スキーマを enum 化
- `src/features/inputs/life-events/ui/useLifeEventActions.ts`
  - `category` を `z.enum([...])` に変更。
  - `retirement_bonus` の排他は `refine` で継続。
- `src/features/inputs/life-events/commands/create-life-event/request.ts`
  - `category: z.enum([...])` に置換。
- `src/features/inputs/life-events/commands/update-life-event/request.ts`
  - `category` パッチに同 enum を適用。
- `src/features/inputs/life-events/commands/upsert-retirement-bonus/request.ts`
  - `z.literal("retirement_bonus")` を維持し、型を共有に寄せる。

### 2.2 型の共有
- `LifeEventCategory` を型として各フォーム/ハンドラに導入。
- `LIFE_EVENT_CATEGORIES` から enum 配列を生成するユーティリティを用意して重複を避ける。

## 3. DB 制約の追加（Supabase migration）

### 3.1 CHECK 制約を追加
- `supabase/migrations/<timestamp>_life_event_category_check.sql`
  - `life_events.category` に CHECK 制約を追加し、正一覧以外を拒否。

#### 例
```sql
alter table public.life_events
  add constraint life_events_category_check
  check (category in (
    'education', 'travel', 'care', 'medical', 'car',
    'housing_purchase', 'other', 'retirement_bonus'
  ));
```

### 3.2 既存データの整合性
- 既存レコードの `category` が正一覧に含まれるか事前に確認。
- 不整合がある場合は migration 前に修正（別 migration で補正）。

## 4. 変更後の確認事項

- UI:
  - ライフイベント追加モーダルの候補が正一覧から生成される。
  - `retirement_bonus` は汎用イベントで選択できない。
- バリデーション:
  - カテゴリが正一覧外だと保存できない。
- DB:
  - 正一覧外カテゴリの insert/update が拒否される。
- テスト:
  - 既存の life event 関連テストが通る。

## 5. 実施順序（推奨）

1. 共有定義の追加 + UI/ロジック参照の置換
2. Zod スキーマの enum 化
3. DB CHECK 制約の追加
4. 既存テスト/シードの修正・実行
