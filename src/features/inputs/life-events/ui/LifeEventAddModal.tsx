"use client";

import type { UseFormReturn } from "react-hook-form";
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
import { LIFE_EVENT_CATEGORIES } from "@/features/inputs/life-events/ui/formatters";
import type {
  LifeEventFormInput,
  LifeEventFormSubmitHandler,
} from "@/features/inputs/life-events/ui/useLifeEventActions";
import { cn } from "@/lib/utils";

type LifeEventAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: LifeEventFormSubmitHandler;
  form: UseFormReturn<LifeEventFormInput>;
  isRetirementCategory: boolean;
  isHousingPurchase: boolean;
  isSubmitting: boolean;
  submitError: string | null;
};

export function LifeEventAddModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  isRetirementCategory,
  isHousingPurchase,
  isSubmitting,
  submitError,
}: LifeEventAddModalProps) {
  if (!isOpen) return null;

  return (
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
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
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

            <div className="grid gap-4 md:grid-cols-3">
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
                    <FormLabel>停止回数</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" placeholder="例: 3" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stop_after_age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>停止年齢</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" placeholder="例: 60" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              停止回数・停止年齢が未入力の場合は無制限になります。
              <br />
              両方指定した場合は、より早く到達する条件で停止します。
            </p>

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
              <Button type="button" variant="ghost" onClick={onClose}>
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
  );
}
