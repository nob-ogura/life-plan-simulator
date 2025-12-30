import type { Tables } from "@/types/supabase";

import type { PensionSectionInput } from "./schema";

const toNumberInput = (value?: number | null) => (value == null ? "" : String(value));

export const buildPensionSectionDefaults = (
  profile: Tables<"profiles"> | null,
): PensionSectionInput => ({
  pension_start_age: toNumberInput(profile?.pension_start_age),
});
