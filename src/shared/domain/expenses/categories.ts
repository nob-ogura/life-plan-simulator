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

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];

export const EXPENSE_CATEGORY_VALUES = EXPENSE_CATEGORIES.map((category) => category.value) as [
  ExpenseCategory,
  ...ExpenseCategory[],
];

export const EXPENSE_CATEGORY_LABELS = new Map(
  EXPENSE_CATEGORIES.map((category) => [category.value, category.label]),
);
