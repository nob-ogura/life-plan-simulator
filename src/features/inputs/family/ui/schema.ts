import { z } from "zod";

import {
  arrayWithDefault,
  optionalYearMonth,
  requiredNumericString,
} from "@/features/inputs/shared/form-utils";

const requiredString = z.string().trim().min(1, { message: "必須項目です" });

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .transform((value) => (value === "" ? undefined : value));

const ChildFormSchema = z
  .object({
    id: z.string().optional(),
    label: requiredString,
    birth_year_month: optionalYearMonth,
    due_year_month: optionalYearMonth,
    note: optionalString,
  })
  .superRefine((value, ctx) => {
    if (value.birth_year_month || value.due_year_month) return;
    const message = "出生年月か誕生予定年月のどちらかを入力してください";
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birth_year_month"], message });
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["due_year_month"], message });
  });

export const FamilySectionSchema = z.object({
  profile: z.object({
    birth_year: requiredNumericString,
    birth_month: requiredNumericString,
    spouse_birth_year: requiredNumericString,
    spouse_birth_month: requiredNumericString,
  }),
  children: arrayWithDefault(ChildFormSchema),
});

export type FamilySectionInput = z.input<typeof FamilySectionSchema>;
export type FamilySectionPayload = z.output<typeof FamilySectionSchema>;
