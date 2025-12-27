"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  type BonusSectionInput,
  type BonusSectionPayload,
  BonusSectionSchema,
  toOptionalMonthStartDate,
} from "@/features/inputs/forms/sections";
import { cn } from "@/lib/utils";
import { useAuth } from "@/shared/cross-cutting/auth";
import { supabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.client";

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm " +
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

type BonusSectionFormProps = {
  defaultValues: BonusSectionInput;
};

export function BonusSectionForm({ defaultValues }: BonusSectionFormProps) {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<BonusSectionInput>({
    defaultValues,
    resolver: zodResolver(BonusSectionSchema),
    mode: "onSubmit",
  });
  const { fields } = useFieldArray({
    control: form.control,
    name: "streams",
    keyName: "fieldKey",
  });
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const onSubmit = form.handleSubmit(async (value) => {
    setSubmitError(null);
    if (!isReady || !session?.user?.id) {
      setSubmitError("ログイン情報を取得できませんでした。");
      return;
    }

    const parsedResult = BonusSectionSchema.safeParse(value);
    const parsed = (parsedResult.success ? parsedResult.data : value) as BonusSectionPayload;
    const userId = session.user.id;

    try {
      const updates = parsed.streams.flatMap((stream) =>
        stream.id
          ? [
              {
                id: stream.id,
                payload: {
                  label: stream.label,
                  bonus_months: stream.bonus_months ?? [],
                  bonus_amount: stream.bonus_amount,
                  change_year_month: toOptionalMonthStartDate(stream.change_year_month),
                  bonus_amount_after: stream.bonus_amount_after ?? null,
                },
              },
            ]
          : [],
      );

      if (updates.length > 0) {
        const results = await Promise.all(
          updates.map(({ id, payload }) =>
            supabaseClient
              .from("income_streams")
              .update(payload)
              .eq("id", id)
              .eq("user_id", userId),
          ),
        );
        const firstError = results.find((result) => result.error)?.error;
        if (firstError) throw firstError;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
    }
  });

  const { errors, isSubmitting } = form.formState;

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div>
        <p className="text-sm font-semibold">ボーナス設定</p>
        <p className="text-xs text-muted-foreground">
          収入ストリームごとのボーナス月・金額・変化点を設定します。
        </p>
      </div>
      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          収入ストリームがありません。先に収入フォームで登録してください。
        </p>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const streamErrors = errors.streams?.[index];
            const labelId = `bonus-${field.fieldKey}-label`;
            const bonusAmountId = `bonus-${field.fieldKey}-amount`;
            const changeYearMonthId = `bonus-${field.fieldKey}-change`;
            const bonusAfterId = `bonus-${field.fieldKey}-after`;
            return (
              <div
                key={field.fieldKey}
                className="space-y-4 rounded-md border border-border bg-card p-4"
              >
                <p className="text-sm font-semibold">ボーナス {index + 1}</p>
                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    htmlFor={labelId}
                  >
                    収入ラベル
                  </label>
                  <input
                    {...form.register(`streams.${index}.label`)}
                    className={cn(inputClassName, streamErrors?.label && "border-destructive")}
                    id={labelId}
                    placeholder="例: 給与"
                  />
                  {streamErrors?.label?.message ? (
                    <p className="text-xs text-destructive">{streamErrors.label.message}</p>
                  ) : null}
                </div>
                <Controller
                  control={form.control}
                  name={`streams.${index}.bonus_months`}
                  render={({ field: bonusField }) => (
                    <div className="flex flex-wrap gap-2">
                      {monthOptions.map((month) => {
                        const selected = (bonusField.value ?? []) as number[];
                        const checked = selected.includes(month);
                        return (
                          <label key={month} className="flex items-center gap-1 text-xs">
                            <input
                              className="size-4 rounded border-input"
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const next = checked
                                  ? selected.filter((value) => value !== month)
                                  : [...selected, month].sort((a, b) => a - b);
                                bonusField.onChange(next);
                              }}
                            />
                            <span>{month}月</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={bonusAmountId}
                    >
                      ボーナス金額
                    </label>
                    <input
                      {...form.register(`streams.${index}.bonus_amount`)}
                      className={cn(
                        inputClassName,
                        streamErrors?.bonus_amount && "border-destructive",
                      )}
                      id={bonusAmountId}
                      inputMode="numeric"
                      placeholder="例: 200000"
                    />
                    {streamErrors?.bonus_amount?.message ? (
                      <p className="text-xs text-destructive">
                        {streamErrors.bonus_amount.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={changeYearMonthId}
                    >
                      変化年月
                    </label>
                    <input
                      {...form.register(`streams.${index}.change_year_month`)}
                      className={cn(
                        inputClassName,
                        streamErrors?.change_year_month && "border-destructive",
                      )}
                      id={changeYearMonthId}
                      type="month"
                    />
                    {streamErrors?.change_year_month?.message ? (
                      <p className="text-xs text-destructive">
                        {streamErrors.change_year_month.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={bonusAfterId}
                    >
                      変化後ボーナス金額
                    </label>
                    <input
                      {...form.register(`streams.${index}.bonus_amount_after`)}
                      className={cn(
                        inputClassName,
                        streamErrors?.bonus_amount_after && "border-destructive",
                      )}
                      id={bonusAfterId}
                      inputMode="numeric"
                      placeholder="例: 250000"
                    />
                    {streamErrors?.bonus_amount_after?.message ? (
                      <p className="text-xs text-destructive">
                        {streamErrors.bonus_amount_after.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {submitError ? <p className="text-xs text-destructive">{submitError}</p> : null}
      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isSubmitting || fields.length === 0}>
          保存
        </Button>
      </div>
    </form>
  );
}
