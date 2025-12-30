import { z } from "zod";

const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

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
  .refine((value) => YEAR_MONTH_REGEX.test(value), {
    message: "YYYY-MM 形式で入力してください",
  });

export const optionalYearMonth = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .refine((value) => value === "" || YEAR_MONTH_REGEX.test(value), {
    message: "YYYY-MM 形式で入力してください",
  })
  .transform((value) => (value === "" ? undefined : value));

export const arrayWithDefault = <T extends z.ZodTypeAny>(schema: T) => z.array(schema).default([]);
