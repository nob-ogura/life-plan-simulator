"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  type IncomeSectionInput,
  type IncomeSectionPayload,
  IncomeSectionSchema,
  toIncomeStreamPayloads,
} from "@/features/inputs/forms/sections";
import { cn } from "@/lib/utils";
import { useAuth } from "@/shared/cross-cutting/auth";
import { supabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.client";

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm " +
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

type IncomeSectionFormProps = {
  defaultValues: IncomeSectionInput;
};

export function IncomeSectionForm({ defaultValues }: IncomeSectionFormProps) {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<IncomeSectionInput>({
    defaultValues,
    resolver: zodResolver(IncomeSectionSchema),
    mode: "onSubmit",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "streams",
    keyName: "fieldKey",
  });
  const initialIdsRef = useRef<string[]>(
    (defaultValues.streams ?? []).map((stream) => stream.id).filter(Boolean) as string[],
  );

  useEffect(() => {
    form.reset(defaultValues);
    initialIdsRef.current = (defaultValues.streams ?? [])
      .map((stream) => stream.id)
      .filter(Boolean) as string[];
  }, [defaultValues, form]);

  const onSubmit = form.handleSubmit(async (value) => {
    setSubmitError(null);
    if (!isReady || !session?.user?.id) {
      setSubmitError("ログイン情報を取得できませんでした。");
      return;
    }

    const parsedResult = IncomeSectionSchema.safeParse(value);
    const parsed = (parsedResult.success ? parsedResult.data : value) as IncomeSectionPayload;
    const payloads = toIncomeStreamPayloads(parsed);
    const userId = session.user.id;
    const currentIds = new Set(
      parsed.streams.map((stream) => stream.id).filter(Boolean) as string[],
    );
    const removedIds = initialIdsRef.current.filter((id) => !currentIds.has(id));
    const createPayloads = parsed.streams.flatMap((stream, index) =>
      stream.id ? [] : [payloads[index]],
    );
    const updatePayloads = parsed.streams.flatMap((stream, index) =>
      stream.id ? [{ id: stream.id, payload: payloads[index] }] : [],
    );

    try {
      if (removedIds.length > 0) {
        const { error } = await supabaseClient
          .from("income_streams")
          .delete()
          .in("id", removedIds)
          .eq("user_id", userId);
        if (error) throw error;
      }

      if (createPayloads.length > 0) {
        const { error } = await supabaseClient
          .from("income_streams")
          .insert(createPayloads.map((payload) => ({ ...payload, user_id: userId })));
        if (error) throw error;
      }

      if (updatePayloads.length > 0) {
        const results = await Promise.all(
          updatePayloads.map(({ id, payload }) =>
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">収入ストリーム</p>
          <p className="text-xs text-muted-foreground">
            手取り月額、期間、ボーナス情報を入力してください。
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              label: "",
              take_home_monthly: "",
              bonus_months: [],
              bonus_amount: "",
              change_year_month: "",
              bonus_amount_after: "",
              raise_rate: "",
              start_year_month: "",
              end_year_month: "",
            })
          }
        >
          追加
        </Button>
      </div>
      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground">収入ストリームの登録はありません。</p>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const streamErrors = errors.streams?.[index];
            const labelId = `income-${field.fieldKey}-label`;
            const takeHomeId = `income-${field.fieldKey}-take-home`;
            const raiseRateId = `income-${field.fieldKey}-raise-rate`;
            const startYearMonthId = `income-${field.fieldKey}-start`;
            const endYearMonthId = `income-${field.fieldKey}-end`;
            const bonusAmountId = `income-${field.fieldKey}-bonus-amount`;
            const changeYearMonthId = `income-${field.fieldKey}-bonus-change`;
            const bonusAfterId = `income-${field.fieldKey}-bonus-after`;

            return (
              <div
                key={field.fieldKey}
                className="space-y-4 rounded-md border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">収入 {index + 1}</p>
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    削除
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={labelId}
                    >
                      ラベル
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
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={takeHomeId}
                    >
                      手取り月額
                    </label>
                    <input
                      {...form.register(`streams.${index}.take_home_monthly`)}
                      className={cn(
                        inputClassName,
                        streamErrors?.take_home_monthly && "border-destructive",
                      )}
                      id={takeHomeId}
                      inputMode="numeric"
                      placeholder="例: 300000"
                    />
                    {streamErrors?.take_home_monthly?.message ? (
                      <p className="text-xs text-destructive">
                        {streamErrors.take_home_monthly.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={raiseRateId}
                    >
                      昇給率
                    </label>
                    <input
                      {...form.register(`streams.${index}.raise_rate`)}
                      className={cn(
                        inputClassName,
                        streamErrors?.raise_rate && "border-destructive",
                      )}
                      id={raiseRateId}
                      inputMode="decimal"
                      placeholder="例: 0.02"
                    />
                    {streamErrors?.raise_rate?.message ? (
                      <p className="text-xs text-destructive">{streamErrors.raise_rate.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={startYearMonthId}
                    >
                      開始年月
                    </label>
                    <input
                      {...form.register(`streams.${index}.start_year_month`)}
                      className={cn(
                        inputClassName,
                        streamErrors?.start_year_month && "border-destructive",
                      )}
                      id={startYearMonthId}
                      type="month"
                    />
                    {streamErrors?.start_year_month?.message ? (
                      <p className="text-xs text-destructive">
                        {streamErrors.start_year_month.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={endYearMonthId}
                    >
                      終了年月
                    </label>
                    <input
                      {...form.register(`streams.${index}.end_year_month`)}
                      className={cn(
                        inputClassName,
                        streamErrors?.end_year_month && "border-destructive",
                      )}
                      id={endYearMonthId}
                      type="month"
                    />
                    {streamErrors?.end_year_month?.message ? (
                      <p className="text-xs text-destructive">
                        {streamErrors.end_year_month.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-3 rounded-md border border-border/60 bg-background/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    ボーナス設定
                  </p>
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
              </div>
            );
          })}
        </div>
      )}
      {submitError ? <p className="text-xs text-destructive">{submitError}</p> : null}
      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isSubmitting}>
          保存
        </Button>
      </div>
    </form>
  );
}
