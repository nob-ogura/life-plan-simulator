import type { Tables } from "@/types/supabase";

import type { SimulationSectionInput } from "./schema";

const toNumberInput = (value?: number | null) => (value == null ? "" : String(value));

export const buildSimulationSectionDefaults = (
  settings: Tables<"simulation_settings"> | null,
): SimulationSectionInput => ({
  start_offset_months: toNumberInput(settings?.start_offset_months),
  end_age: toNumberInput(settings?.end_age),
  pension_amount_single: toNumberInput(settings?.pension_amount_single),
  pension_amount_spouse: toNumberInput(settings?.pension_amount_spouse),
  mortgage_transaction_cost_rate: toNumberInput(settings?.mortgage_transaction_cost_rate),
  real_estate_tax_rate: toNumberInput(settings?.real_estate_tax_rate),
  real_estate_evaluation_rate: toNumberInput(settings?.real_estate_evaluation_rate),
});
