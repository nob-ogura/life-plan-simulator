import { z } from "zod";

import {
  arrayWithDefault,
  optionalNumericString,
  optionalYearMonth,
  requiredNumericString,
  requiredYearMonth,
} from "@/features/inputs/shared/form-utils";

const requiredString = z.string().trim().min(1, { message: "必須項目です" });

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .transform((value) => (value === "" ? undefined : value));

const MortgageFormSchema = z.object({
  id: z.string().optional(),
  principal: requiredNumericString,
  annual_rate: optionalNumericString,
  years: requiredNumericString,
  start_year_month: requiredYearMonth,
  building_price: requiredNumericString,
  land_price: requiredNumericString,
  down_payment: requiredNumericString,
  target_rental_id: optionalString,
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
