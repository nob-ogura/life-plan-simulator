"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { updateIncomeStreamAction } from "@/features/inputs/income-streams/commands/update-income-stream/action";
import { toOptionalMonthStartDate } from "@/features/inputs/shared/date";
import { zodResolver } from "@/lib/zod-resolver";
import { useAuth } from "@/shared/cross-cutting/auth";

import {
  type BonusSectionInput,
  type BonusSectionPayload,
  BonusSectionSchema,
} from "./bonus-schema";

const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

type BonusFormProps = {
  defaultValues: BonusSectionInput;
};

export function BonusForm({ defaultValues }: BonusFormProps) {
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
          updates.map(({ id, payload }) => updateIncomeStreamAction({ id, patch: payload })),
        );
        const hasError = results.some((result) => !result.ok);
        if (hasError) {
          setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
          return;
        }
      }

      toast.success("保存しました。");
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
        <div>
          <p className="text-sm font-semibold">ボーナス設定</p>
          <p className="text-xs text-muted-foreground">
            定期収入ごとのボーナス月・金額・変化点を設定します。
          </p>
        </div>
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            定期収入がありません。先に収入フォームで登録してください。
          </p>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.fieldKey}
                className="space-y-4 rounded-md border border-border bg-card p-4"
              >
                <p className="text-sm font-semibold">ボーナス {index + 1}</p>
                <FormField
                  control={form.control}
                  name={`streams.${index}.label` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>収入ラベル</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="例: 給与" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`streams.${index}.bonus_months` as const}
                  render={({ field }) => (
                    <FormItem>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        ボーナス月
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {monthOptions.map((month) => {
                          const selected = (field.value ?? []) as number[];
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
                                  field.onChange(next);
                                }}
                              />
                              <span>{month}月</span>
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`streams.${index}.bonus_amount` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ボーナス金額</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="numeric" placeholder="例: 200000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`streams.${index}.change_year_month` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>変化年月</FormLabel>
                        <FormControl>
                          <Input {...field} type="month" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`streams.${index}.bonus_amount_after` as const}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>変化後ボーナス金額</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="numeric" placeholder="例: 250000" />
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
          <Button type="submit" disabled={isSubmitting || fields.length === 0}>
            保存
          </Button>
        </div>
      </form>
    </Form>
  );
}
