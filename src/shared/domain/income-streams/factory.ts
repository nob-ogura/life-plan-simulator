export type IncomeStreamCreateInput = {
  label: string;
  take_home_monthly: number;
  raise_rate?: number;
  start_year_month: string;
  end_year_month: string | null;
};

export type IncomeStreamCreatePayload = IncomeStreamCreateInput & {
  bonus_months: number[];
  bonus_amount: number;
  change_year_month: string | null;
  bonus_amount_after: number | null;
};

export const createIncomeStream = (input: IncomeStreamCreateInput): IncomeStreamCreatePayload => ({
  ...input,
  bonus_months: [],
  bonus_amount: 0,
  change_year_month: null,
  bonus_amount_after: null,
});
