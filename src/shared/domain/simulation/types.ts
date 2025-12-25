import type { Tables } from "@/types/supabase";

export type YearMonth = string;

export type SimulationProfile = Pick<
  Tables<"profiles">,
  "birth_year" | "birth_month" | "spouse_birth_year" | "spouse_birth_month" | "pension_start_age"
>;

export type SimulationSettings = Pick<
  Tables<"simulation_settings">,
  | "start_offset_months"
  | "end_age"
  | "pension_amount_single"
  | "pension_amount_spouse"
  | "mortgage_transaction_cost_rate"
  | "real_estate_tax_rate"
  | "real_estate_evaluation_rate"
>;

export type SimulationChild = Pick<Tables<"children">, "birth_year_month" | "due_year_month">;

export type SimulationIncomeStream = Pick<
  Tables<"income_streams">,
  | "take_home_monthly"
  | "bonus_months"
  | "bonus_amount"
  | "change_year_month"
  | "bonus_amount_after"
  | "raise_rate"
  | "start_year_month"
  | "end_year_month"
>;

export type SimulationExpense = Pick<
  Tables<"expenses">,
  "amount_monthly" | "inflation_rate" | "category" | "start_year_month" | "end_year_month"
>;

export type SimulationRental = Pick<
  Tables<"rentals">,
  "id" | "rent_monthly" | "start_year_month" | "end_year_month"
>;

export type SimulationAsset = Pick<
  Tables<"assets">,
  "cash_balance" | "investment_balance" | "return_rate"
>;

export type SimulationMortgage = Pick<
  Tables<"mortgages">,
  | "principal"
  | "annual_rate"
  | "years"
  | "start_year_month"
  | "building_price"
  | "land_price"
  | "down_payment"
  | "target_rental_id"
>;

export type SimulationLifeEvent = Pick<
  Tables<"life_events">,
  | "amount"
  | "year_month"
  | "repeat_interval_years"
  | "stop_after_occurrences"
  | "category"
  | "auto_toggle_key"
  | "building_price"
  | "land_price"
  | "down_payment"
  | "target_rental_id"
>;

export type SimulationInput = {
  currentYearMonth: YearMonth;
  profiles: SimulationProfile;
  simulationSettings: SimulationSettings;
  children: SimulationChild[];
  incomeStreams: SimulationIncomeStream[];
  expenses: SimulationExpense[];
  rentals: SimulationRental[];
  assets: SimulationAsset[];
  mortgages: SimulationMortgage[];
  lifeEvents: SimulationLifeEvent[];
};

export type SimulationMonthlyResult = {
  yearMonth: YearMonth;
  age: number;
  spouseAge: number | null;
  totalIncome: number;
  totalExpense: number;
  eventAmount: number;
  cashBalance: number;
  investmentBalance: number;
  totalBalance: number;
};

export type SimulationResult = {
  months: SimulationMonthlyResult[];
  depletionYearMonth: YearMonth | null;
};
