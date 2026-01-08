import { z } from "zod";

import {
  arrayWithDefault,
  optionalNumericString,
  optionalYearMonth,
  requiredNumericString,
  requiredYearMonth,
} from "@/features/inputs/shared/form-utils";

const MortgageFormSchema = z.object({
  id: z.string().optional(),
  principal: optionalNumericString,
  annual_rate: optionalNumericString,
  years: requiredNumericString,
  start_year_month: requiredYearMonth,
  building_price: requiredNumericString,
  land_price: requiredNumericString,
  down_payment: requiredNumericString,
});

const RentalFormSchema = z.object({
  id: z.string().optional(),
  rent_monthly: requiredNumericString,
  start_year_month: requiredYearMonth,
  end_year_month: optionalYearMonth,
});

export const HousingSectionSchema = z.object({
  mortgages: arrayWithDefault(MortgageFormSchema),
  rentals: arrayWithDefault(RentalFormSchema),
});

export type HousingSectionInput = z.input<typeof HousingSectionSchema>;
export type HousingSectionPayload = z.output<typeof HousingSectionSchema>;
