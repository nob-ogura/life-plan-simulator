import type { Tables } from "@/types/supabase";

import type { PensionSectionInput } from "./schema";

const toNumberInput = (value?: number | null) => (value == null ? "" : String(value));

export const buildPensionSectionDefaults = (
  profile: Tables<"profiles"> | null,
  simulationSettings: Tables<"simulation_settings"> | null = null,
): PensionSectionInput => ({
  pension_start_age: toNumberInput(profile?.pension_start_age),
  pension_amount_single: toNumberInput(simulationSettings?.pension_amount_single),
  pension_amount_spouse: toNumberInput(simulationSettings?.pension_amount_spouse),
});
