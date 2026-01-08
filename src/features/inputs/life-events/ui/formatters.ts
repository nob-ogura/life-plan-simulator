import {
  LIFE_EVENT_CATEGORY_LABELS,
  LIFE_EVENT_CATEGORIES as SHARED_LIFE_EVENT_CATEGORIES,
} from "@/shared/domain/life-events/categories";
import { describeLifeEventRepeat } from "@/shared/domain/life-events/repeat";
import { Money } from "@/shared/domain/value-objects/Money";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import { formatValueOrFallback } from "@/shared/utils/formatters";
import type { Tables } from "@/types/supabase";

export const LIFE_EVENT_CATEGORIES = SHARED_LIFE_EVENT_CATEGORIES;
export const categoryLabels = new Map<string, string>(LIFE_EVENT_CATEGORY_LABELS);

export const formatYearMonth = (value?: string | null) =>
  formatValueOrFallback(
    value,
    (safeValue) => YearMonth.formatJapaneseFromInput(safeValue),
    undefined,
    (safeValue) => safeValue.trim().length === 0,
  );

export const formatAmount = (amount: number) => Money.of(amount).formatYen();

export const formatRepeat = (event: Tables<"life_events">) => describeLifeEventRepeat(event);
