"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  type ExpenseSectionInput,
  type ExpenseSectionPayload,
  ExpenseSectionSchema,
  toExpensePayloads,
} from "@/features/inputs/forms/sections";
import { cn } from "@/lib/utils";
import { zodResolver } from "@/lib/zod-resolver";
import { useAuth } from "@/shared/cross-cutting/auth";
import { supabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.client";

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm " +
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

type ExpenseSectionFormProps = {
  defaultValues: ExpenseSectionInput;
};

export function ExpenseSectionForm({ defaultValues }: ExpenseSectionFormProps) {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<ExpenseSectionInput>({
    defaultValues,
    resolver: zodResolver(ExpenseSectionSchema),
    mode: "onSubmit",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expenses",
    keyName: "fieldKey",
  });
  const initialIdsRef = useRef<string[]>(
    (defaultValues.expenses ?? []).map((expense) => expense.id).filter(Boolean) as string[],
  );

  useEffect(() => {
    form.reset(defaultValues);
    initialIdsRef.current = (defaultValues.expenses ?? [])
      .map((expense) => expense.id)
      .filter(Boolean) as string[];
  }, [defaultValues, form]);

  const onSubmit = form.handleSubmit(async (value) => {
    setSubmitError(null);
    if (!isReady || !session?.user?.id) {
      setSubmitError("ログイン情報を取得できませんでした。");
      return;
    }

    const parsedResult = ExpenseSectionSchema.safeParse(value);
    const parsed = (parsedResult.success ? parsedResult.data : value) as ExpenseSectionPayload;
    const payloads = toExpensePayloads(parsed);
    const userId = session.user.id;
    const currentIds = new Set(
      parsed.expenses.map((expense) => expense.id).filter(Boolean) as string[],
    );
    const removedIds = initialIdsRef.current.filter((id) => !currentIds.has(id));
    const createPayloads = parsed.expenses.flatMap((expense, index) =>
      expense.id ? [] : [payloads[index]],
    );
    const updatePayloads = parsed.expenses.flatMap((expense, index) =>
      expense.id ? [{ id: expense.id, payload: payloads[index] }] : [],
    );

    try {
      if (removedIds.length > 0) {
        const { error } = await supabaseClient
          .from("expenses")
          .delete()
          .in("id", removedIds)
          .eq("user_id", userId);
        if (error) throw error;
      }

      if (createPayloads.length > 0) {
        const { error } = await supabaseClient
          .from("expenses")
          .insert(createPayloads.map((payload) => ({ ...payload, user_id: userId })));
        if (error) throw error;
      }

      if (updatePayloads.length > 0) {
        const results = await Promise.all(
          updatePayloads.map(({ id, payload }) =>
            supabaseClient.from("expenses").update(payload).eq("id", id).eq("user_id", userId),
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
          <p className="text-sm font-semibold">支出項目</p>
          <p className="text-xs text-muted-foreground">
            月額、インフレ率、期間、カテゴリを登録します。
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              label: "",
              amount_monthly: "",
              inflation_rate: "",
              category: "",
              start_year_month: "",
              end_year_month: "",
            })
          }
        >
          追加
        </Button>
      </div>
      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground">支出項目の登録はありません。</p>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const expenseErrors = errors.expenses?.[index];
            const labelId = `expense-${field.fieldKey}-label`;
            const amountId = `expense-${field.fieldKey}-amount`;
            const inflationId = `expense-${field.fieldKey}-inflation`;
            const categoryId = `expense-${field.fieldKey}-category`;
            const startYearMonthId = `expense-${field.fieldKey}-start`;
            const endYearMonthId = `expense-${field.fieldKey}-end`;

            return (
              <div
                key={field.fieldKey}
                className="space-y-4 rounded-md border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">支出 {index + 1}</p>
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
                      {...form.register(`expenses.${index}.label`)}
                      className={cn(inputClassName, expenseErrors?.label && "border-destructive")}
                      id={labelId}
                      placeholder="例: 生活費"
                    />
                    {expenseErrors?.label?.message ? (
                      <p className="text-xs text-destructive">{expenseErrors.label.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={amountId}
                    >
                      月額
                    </label>
                    <input
                      {...form.register(`expenses.${index}.amount_monthly`)}
                      className={cn(
                        inputClassName,
                        expenseErrors?.amount_monthly && "border-destructive",
                      )}
                      id={amountId}
                      inputMode="numeric"
                      placeholder="例: 180000"
                    />
                    {expenseErrors?.amount_monthly?.message ? (
                      <p className="text-xs text-destructive">
                        {expenseErrors.amount_monthly.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={inflationId}
                    >
                      インフレ率
                    </label>
                    <input
                      {...form.register(`expenses.${index}.inflation_rate`)}
                      className={cn(
                        inputClassName,
                        expenseErrors?.inflation_rate && "border-destructive",
                      )}
                      id={inflationId}
                      inputMode="decimal"
                      placeholder="例: 0.01"
                    />
                    {expenseErrors?.inflation_rate?.message ? (
                      <p className="text-xs text-destructive">
                        {expenseErrors.inflation_rate.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={categoryId}
                    >
                      カテゴリ
                    </label>
                    <input
                      {...form.register(`expenses.${index}.category`)}
                      className={cn(
                        inputClassName,
                        expenseErrors?.category && "border-destructive",
                      )}
                      id={categoryId}
                      placeholder="例: 生活費"
                    />
                    {expenseErrors?.category?.message ? (
                      <p className="text-xs text-destructive">{expenseErrors.category.message}</p>
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
                      {...form.register(`expenses.${index}.start_year_month`)}
                      className={cn(
                        inputClassName,
                        expenseErrors?.start_year_month && "border-destructive",
                      )}
                      id={startYearMonthId}
                      type="month"
                    />
                    {expenseErrors?.start_year_month?.message ? (
                      <p className="text-xs text-destructive">
                        {expenseErrors.start_year_month.message}
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
                      {...form.register(`expenses.${index}.end_year_month`)}
                      className={cn(
                        inputClassName,
                        expenseErrors?.end_year_month && "border-destructive",
                      )}
                      id={endYearMonthId}
                      type="month"
                    />
                    {expenseErrors?.end_year_month?.message ? (
                      <p className="text-xs text-destructive">
                        {expenseErrors.end_year_month.message}
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
        <Button type="submit" disabled={isSubmitting}>
          保存
        </Button>
      </div>
    </form>
  );
}
