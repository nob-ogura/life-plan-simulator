import type { CreateChildRequest } from "@/features/inputs/children/commands/create-child/request";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import type { Tables } from "@/types/supabase";

import type { FamilySectionInput, FamilySectionPayload } from "./schema";

const toNumberInput = (value?: number | null) => (value == null ? "" : String(value));

export const buildFamilySectionDefaults = (
  profile: Tables<"profiles"> | null,
  children: Array<Tables<"children">>,
): FamilySectionInput => ({
  profile: {
    birth_year: toNumberInput(profile?.birth_year),
    birth_month: toNumberInput(profile?.birth_month),
    spouse_birth_year: toNumberInput(profile?.spouse_birth_year),
    spouse_birth_month: toNumberInput(profile?.spouse_birth_month),
  },
  children: children.map((child) => ({
    id: child.id,
    label: child.label,
    birth_year_month: child.birth_year_month
      ? YearMonth.toYearMonthStringFromInput(child.birth_year_month)
      : "",
    due_year_month: child.due_year_month
      ? YearMonth.toYearMonthStringFromInput(child.due_year_month)
      : "",
    note: child.note ?? "",
  })),
});

export const toFamilyPayload = (
  value: FamilySectionPayload,
): {
  profile: {
    birth_year: number;
    birth_month: number;
    spouse_birth_year: number;
    spouse_birth_month: number;
  };
  children: CreateChildRequest[];
} => ({
  profile: {
    birth_year: value.profile.birth_year,
    birth_month: value.profile.birth_month,
    spouse_birth_year: value.profile.spouse_birth_year,
    spouse_birth_month: value.profile.spouse_birth_month,
  },
  children: value.children.map((child) => ({
    label: child.label,
    birth_year_month: child.birth_year_month
      ? YearMonth.toMonthStartDateFromInput(child.birth_year_month)
      : null,
    due_year_month: child.due_year_month
      ? YearMonth.toMonthStartDateFromInput(child.due_year_month)
      : null,
    note: child.note ?? null,
  })),
});
