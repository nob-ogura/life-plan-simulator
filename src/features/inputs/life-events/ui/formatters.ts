import type { Tables } from "@/types/supabase";

export const LIFE_EVENT_CATEGORIES = [
  { value: "education", label: "教育" },
  { value: "travel", label: "旅行" },
  { value: "care", label: "介護" },
  { value: "medical", label: "医療" },
  { value: "car", label: "車" },
  { value: "housing_purchase", label: "住宅購入" },
  { value: "other", label: "その他" },
] as const;

export const categoryLabels = new Map<string, string>(
  LIFE_EVENT_CATEGORIES.map((category) => [category.value, category.label]),
);

export const formatYearMonth = (value?: string | null) => {
  if (!value) return "未入力";
  const trimmed = value.slice(0, 7);
  const [year, month] = trimmed.split("-");
  return `${year}年${month}月`;
};

export const formatAmount = (amount: number) =>
  `${new Intl.NumberFormat("ja-JP").format(amount)}円`;

export const formatRepeat = (event: Tables<"life_events">) => {
  const interval = event.repeat_interval_years ?? null;
  if (!interval || interval <= 0) return "なし";
  const intervalLabel = `${interval}年ごと`;
  const stopLabels: string[] = [];
  const stopOccurrences = event.stop_after_occurrences ?? null;
  if (stopOccurrences != null && stopOccurrences > 0) {
    stopLabels.push(`${stopOccurrences}回`);
  }
  const stopAge = event.stop_after_age ?? null;
  if (stopAge != null && stopAge >= 0) {
    stopLabels.push(`${stopAge}歳`);
  }
  if (stopLabels.length === 0) return `${intervalLabel}（停止なし）`;
  return `${intervalLabel}（停止: ${stopLabels.join(" / ")}）`;
};
