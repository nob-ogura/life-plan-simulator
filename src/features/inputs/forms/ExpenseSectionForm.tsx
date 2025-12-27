"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type ExpenseSectionInput,
  type ExpenseSectionPayload,
  ExpenseSectionSchema,
  toExpensePayloads,
} from "@/features/inputs/forms/sections";
import { zodResolver } from "@/lib/zod-resolver";
import { useAuth } from "@/shared/cross-cutting/auth";
import { supabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.client";

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

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
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
            {fields.map((field, index) => (
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
                  <FormField
                    control={form.control}
                    name={`expenses.${index}.label` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ラベル</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="例: 生活費" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`expenses.${index}.amount_monthly` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>月額</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="numeric" placeholder="例: 180000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`expenses.${index}.inflation_rate` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>インフレ率</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="decimal" placeholder="例: 0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`expenses.${index}.category` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>カテゴリ</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="例: 生活費" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`expenses.${index}.start_year_month` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>開始年月</FormLabel>
                        <FormControl>
                          <Input {...field} type="month" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`expenses.${index}.end_year_month` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>終了年月</FormLabel>
                        <FormControl>
                          <Input {...field} type="month" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {submitError ? <p className="text-xs text-destructive">{submitError}</p> : null}
        <div className="flex items-center justify-end">
          <Button type="submit" disabled={isSubmitting}>
            保存
          </Button>
        </div>
      </form>
    </Form>
  );
}
