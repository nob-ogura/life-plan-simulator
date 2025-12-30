import type { CreateChildRequest } from "@/features/inputs/children/commands/create-child/request";
import { toOptionalMonthStartDate, toYearMonthInput } from "@/features/inputs/shared/date";
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
    birth_year_month: toYearMonthInput(child.birth_year_month),
    due_year_month: toYearMonthInput(child.due_year_month),
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
    birth_year_month: toOptionalMonthStartDate(child.birth_year_month),
    due_year_month: toOptionalMonthStartDate(child.due_year_month),
    note: child.note ?? null,
  })),
});
