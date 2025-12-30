import { z } from "zod";

import {
  arrayWithDefault,
  optionalNumericString,
  optionalYearMonth,
  requiredNumericString,
} from "@/features/inputs/shared/form-utils";

const requiredString = z.string().trim().min(1, { message: "必須項目です" });

const bonusMonthsSchema = z
  .array(
    z
      .number({ error: "数値で入力してください" })
      .int({ message: "整数で入力してください" })
      .min(1, { message: "1〜12 の範囲で入力してください" })
      .max(12, { message: "1〜12 の範囲で入力してください" }),
  )
  .optional();

const BonusStreamSchema = z.object({
  id: z.string().optional(),
  label: requiredString,
  bonus_months: bonusMonthsSchema,
  bonus_amount: requiredNumericString,
  change_year_month: optionalYearMonth,
  bonus_amount_after: optionalNumericString,
});

export const BonusSectionSchema = z.object({
  streams: arrayWithDefault(BonusStreamSchema),
});

export type BonusSectionInput = z.input<typeof BonusSectionSchema>;
export type BonusSectionPayload = z.output<typeof BonusSectionSchema>;
