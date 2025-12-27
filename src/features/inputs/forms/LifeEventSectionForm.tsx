"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { toMonthStartDate } from "@/features/inputs/forms/sections";
import { createLifeEventAction } from "@/features/inputs/life-events/commands/create-life-event/action";
import { deleteLifeEventAction } from "@/features/inputs/life-events/commands/delete-life-event/action";
import { cn } from "@/lib/utils";
import { zodResolver } from "@/lib/zod-resolver";
import type { Tables } from "@/types/supabase";

const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const requiredString = z.string().trim().min(1, { message: "必須項目です" });

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

const requiredYearMonth = z
  .string()
  .trim()
  .min(1, { message: "必須項目です" })
  .refine((value) => YEAR_MONTH_REGEX.test(value), {
    message: "YYYY-MM 形式で入力してください",
  });

const categorySchema = requiredString.refine((value) => value !== "retirement_bonus", {
  message: "退職金は専用フォームで登録してください",
});

const LifeEventFormSchema = z
  .object({
    label: requiredString,
    amount: requiredNumericString,
    year_month: requiredYearMonth,
    repeat_interval_years: optionalNumericString,
    stop_after_occurrences: optionalNumericString,
    category: categorySchema,
    building_price: optionalNumericString,
    land_price: optionalNumericString,
    down_payment: optionalNumericString,
  })
  .superRefine((value, ctx) => {
    if (value.category !== "housing_purchase") return;
    if (value.building_price == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["building_price"],
        message: "必須項目です",
      });
    }
    if (value.land_price == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["land_price"],
        message: "必須項目です",
      });
    }
    if (value.down_payment == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["down_payment"],
        message: "必須項目です",
      });
    }
  });

type LifeEventFormInput = z.input<typeof LifeEventFormSchema>;
type LifeEventFormPayload = z.output<typeof LifeEventFormSchema>;

type LifeEventSectionFormProps = {
  events: Array<Tables<"life_events">>;
};

const LIFE_EVENT_CATEGORIES = [
  { value: "education", label: "教育" },
  { value: "travel", label: "旅行" },
  { value: "care", label: "介護" },
  { value: "medical", label: "医療" },
  { value: "car", label: "車" },
  { value: "housing_purchase", label: "住宅購入" },
  { value: "other", label: "その他" },
] as const;

const categoryLabels = new Map<string, string>(
  LIFE_EVENT_CATEGORIES.map((category) => [category.value, category.label]),
);

const formatYearMonth = (value?: string | null) => {
  if (!value) return "未入力";
  const trimmed = value.slice(0, 7);
  const [year, month] = trimmed.split("-");
  return `${year}年${month}月`;
};

const formatAmount = (amount: number) => `${new Intl.NumberFormat("ja-JP").format(amount)}円`;

const formatRepeat = (event: Tables<"life_events">) => {
  const interval = event.repeat_interval_years ?? null;
  if (!interval || interval <= 0) return "なし";
  const intervalLabel = `${interval}年ごと`;
  const stop = event.stop_after_occurrences ?? null;
  if (!stop || stop <= 0) return `${intervalLabel}（停止なし）`;
  return `${intervalLabel}（${stop}回）`;
};

const defaultValues: LifeEventFormInput = {
  label: "",
  amount: "",
  year_month: "",
  repeat_interval_years: "",
  stop_after_occurrences: "",
  category: "",
  building_price: "",
  land_price: "",
  down_payment: "",
};

export function LifeEventSectionForm({ events }: LifeEventSectionFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const form = useForm<LifeEventFormInput>({
    defaultValues,
    resolver: zodResolver(LifeEventFormSchema),
    mode: "onSubmit",
  });

  const watchCategory = form.watch("category");
  const isRetirementCategory = watchCategory === "retirement_bonus";
  const isHousingPurchase = watchCategory === "housing_purchase";

  const sortedEvents = useMemo(
    () =>
      [...events].sort((left, right) =>
        (left.year_month ?? "").localeCompare(right.year_month ?? ""),
      ),
    [events],
  );

  const openModal = () => {
    setSubmitError(null);
    setDeleteError(null);
    form.reset(defaultValues);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSubmitError(null);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setDeleteError(null);

    try {
      const parsedResult = LifeEventFormSchema.safeParse(values);
      const parsed = (parsedResult.success ? parsedResult.data : values) as LifeEventFormPayload;
      const response = await createLifeEventAction({
        label: parsed.label,
        amount: parsed.amount,
        year_month: toMonthStartDate(parsed.year_month),
        repeat_interval_years: parsed.repeat_interval_years ?? null,
        stop_after_occurrences: parsed.stop_after_occurrences ?? null,
        category: parsed.category,
        auto_toggle_key: null,
        building_price: parsed.building_price ?? null,
        land_price: parsed.land_price ?? null,
        down_payment: parsed.down_payment ?? null,
        target_rental_id: null,
      });

      if (response.ok) {
        closeModal();
        router.refresh();
      } else {
        setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
      }
    } catch (error) {
      console.error(error);
      setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
    }
  });

  const handleDelete = async (eventId: string) => {
    if (deletingId) return;
    setDeleteError(null);
    setDeletingId(eventId);

    try {
      const response = await deleteLifeEventAction({ id: eventId });
      if (response.ok) {
        router.refresh();
      } else {
        setDeleteError("削除に失敗しました。時間をおいて再度お試しください。");
      }
    } catch (error) {
      console.error(error);
      setDeleteError("削除に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setDeletingId(null);
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">ライフイベント一覧</p>
          <p className="text-xs text-muted-foreground">
            繰り返し設定を含め、将来イベントを登録できます。
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={openModal}>
          イベント追加
        </Button>
      </div>

      {sortedEvents.length === 0 ? (
        <p className="text-xs text-muted-foreground">登録済みのイベントはありません。</p>
      ) : (
        <div className="grid gap-3">
          {sortedEvents.map((event) => (
            <div key={event.id} className="rounded-md border border-border bg-background/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{event.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabels.get(event.category) ?? event.category} ·{" "}
                    {formatYearMonth(event.year_month)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-foreground">
                    {formatAmount(event.amount)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                  >
                    削除
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                繰り返し: {formatRepeat(event)}
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteError ? <p className="text-xs text-destructive">{deleteError}</p> : null}

      <div className="rounded-lg border border-dashed border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
        退職金は専用フォームで登録します。カテゴリに `retirement_bonus` は指定できません。
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-xl border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">ライフイベント追加</h2>
                <p className="text-xs text-muted-foreground">
                  退職金は専用フォームで登録してください。
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={closeModal}>
                閉じる
              </Button>
            </div>

            <Form {...form}>
              <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ラベル</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="例: 留学費用" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>金額</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="numeric" placeholder="例: 500000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="year_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>発生年月</FormLabel>
                        <FormControl>
                          <Input {...field} type="month" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>カテゴリ</FormLabel>
                        <FormControl>
                          <Input {...field} list="life-event-categories" placeholder="例: travel" />
                        </FormControl>
                        <datalist id="life-event-categories">
                          {LIFE_EVENT_CATEGORIES.map((category) => (
                            <option
                              key={category.value}
                              value={category.value}
                              label={category.label}
                            />
                          ))}
                        </datalist>
                        <FormMessage />
                        {isRetirementCategory ? (
                          <p className="text-xs text-amber-600">
                            退職金は専用フォームで登録してください。
                          </p>
                        ) : null}
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="repeat_interval_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>繰り返し間隔（年）</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="numeric" placeholder="例: 1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stop_after_occurrences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>繰り返し回数</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="numeric" placeholder="例: 3" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isHousingPurchase ? (
                  <div className="rounded-md border border-border/70 bg-muted/40 p-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                      住宅購入カテゴリは価格情報が必須です。
                    </p>
                    <div className="mt-3 grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="building_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>建物価格</FormLabel>
                            <FormControl>
                              <Input {...field} inputMode="numeric" placeholder="例: 20000000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="land_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>土地価格</FormLabel>
                            <FormControl>
                              <Input {...field} inputMode="numeric" placeholder="例: 10000000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="down_payment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>頭金</FormLabel>
                            <FormControl>
                              <Input {...field} inputMode="numeric" placeholder="例: 5000000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ) : null}

                {submitError ? <p className="text-xs text-destructive">{submitError}</p> : null}

                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={closeModal}>
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isRetirementCategory}
                    className={cn(isRetirementCategory && "cursor-not-allowed")}
                  >
                    保存
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
