"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { type IncomeSectionInput, IncomeSectionSchema } from "@/features/inputs/forms/sections";
import { bulkSaveIncomeStreamsAction } from "@/features/inputs/income-streams/commands/bulk-save-income-streams/action";
import { zodResolver } from "@/lib/zod-resolver";

type IncomeSectionFormProps = {
  defaultValues: IncomeSectionInput;
};

export function IncomeSectionForm({ defaultValues }: IncomeSectionFormProps) {
  const router = useRouter();
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

  const onSubmit = form.handleSubmit(async () => {
    setSubmitError(null);

    try {
      const rawValues = form.getValues();
      const res = await bulkSaveIncomeStreamsAction({
        initial_ids: initialIdsRef.current,
        streams: rawValues.streams ?? [],
      });
      if (res.ok) {
        toast.success("保存しました。");
        router.refresh();
      } else {
        setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
      }
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
            <p className="text-sm font-semibold">収入ストリーム</p>
            <p className="text-xs text-muted-foreground">
              手取り月額、昇給率、期間を入力してください。
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
            {fields.map((field, index) => (
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
                  <FormField
                    control={form.control}
                    name={`streams.${index}.label` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ラベル</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="例: 給与" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`streams.${index}.take_home_monthly` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>手取り月額</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="numeric" placeholder="例: 300000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`streams.${index}.raise_rate` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>昇給率</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="decimal" placeholder="例: 0.02" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`streams.${index}.start_year_month` as const}
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
                    name={`streams.${index}.end_year_month` as const}
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
