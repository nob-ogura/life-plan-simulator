import {
  LIFE_EVENT_CATEGORY_LABELS,
  LIFE_EVENT_CATEGORIES as SHARED_LIFE_EVENT_CATEGORIES,
} from "@/shared/domain/life-events/categories";
import { Money } from "@/shared/domain/value-objects/Money";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import { formatValueOrFallback } from "@/shared/utils/formatters";
import type { Tables } from "@/types/supabase";

export const LIFE_EVENT_CATEGORIES = SHARED_LIFE_EVENT_CATEGORIES;
export const categoryLabels = new Map<string, string>(LIFE_EVENT_CATEGORY_LABELS);

export const formatYearMonth = (value?: string | null) =>
  formatValueOrFallback(
    value,
    (safeValue) => {
      const normalized = YearMonth.toYearMonthStringFromInput(safeValue);
      if (!YearMonth.validate(normalized)) {
        const [year, month] = normalized.split("-");
        return `${year}年${month}月`;
      }
      return YearMonth.create(normalized).toJapanese();
    },
    undefined,
    (safeValue) => safeValue.trim().length === 0,
  );

export const formatAmount = (amount: number) => `${Money.of(amount).format()}円`;

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
