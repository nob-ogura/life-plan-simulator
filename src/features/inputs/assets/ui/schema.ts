import { z } from "zod";

const requiredNumericString = z
  .string()
  .trim()
  .min(1, { message: "必須項目です" })
  .refine((value) => !Number.isNaN(Number(value)), {
    message: "数値で入力してください",
  })
  .transform((value) => Number(value));

const optionalNumericString = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .refine((value) => value === "" || !Number.isNaN(Number(value)), {
    message: "数値で入力してください",
  })
  .transform((value) => (value === "" ? undefined : Number(value)));

export const AssetFormSchema = z.object({
  cash_balance: requiredNumericString,
  investment_balance: requiredNumericString,
  return_rate: optionalNumericString,
});

export type AssetFormInput = z.input<typeof AssetFormSchema>;
export type AssetFormPayload = z.output<typeof AssetFormSchema>;
