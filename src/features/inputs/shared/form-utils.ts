import { z } from "zod";

import { YearMonth } from "@/shared/domain/value-objects/YearMonth";

export const requiredNumericString = z
  .string()
  .trim()
  .min(1, { message: "必須項目です" })
  .refine((value) => !Number.isNaN(Number(value)), {
    message: "数値で入力してください",
  })
  .transform((value) => Number(value));

export const optionalNumericString = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .refine((value) => value === "" || !Number.isNaN(Number(value)), {
    message: "数値で入力してください",
  })
  .transform((value) => (value === "" ? undefined : Number(value)));

export const requiredYearMonth = z
  .string()
  .trim()
  .min(1, { message: "必須項目です" })
  .refine((value) => YearMonth.validate(value), {
    message: "YYYY-MM 形式で入力してください",
  });

export const optionalYearMonth = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .refine((value) => value === "" || YearMonth.validate(value), {
    message: "YYYY-MM 形式で入力してください",
  })
  .transform((value) => (value === "" ? undefined : value));

export const arrayWithDefault = <T extends z.ZodTypeAny>(schema: T) => z.array(schema).default([]);
