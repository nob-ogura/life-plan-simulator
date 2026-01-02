"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { createSimulationSettingsAction } from "@/features/inputs/simulation-settings/commands/create-simulation-settings/action";
import { resetSimulationSettingsAction } from "@/features/inputs/simulation-settings/commands/reset-simulation-settings/action";
import { updateSimulationSettingsAction } from "@/features/inputs/simulation-settings/commands/update-simulation-settings/action";
import { zodResolver } from "@/lib/zod-resolver";
import { useAuth } from "@/shared/cross-cutting/auth";
import { buildSimulationSectionDefaults } from "./mapper";
import {
  type SimulationSectionInput,
  type SimulationSectionPayload,
  SimulationSectionSchema,
} from "./schema";

type SimulationFormProps = {
  defaultValues: SimulationSectionInput;
  settingsId?: string | null;
};

const omitUndefined = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as T;

export function SimulationForm({ defaultValues, settingsId }: SimulationFormProps) {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const form = useForm<SimulationSectionInput>({
    defaultValues,
    resolver: zodResolver(SimulationSectionSchema),
    mode: "onSubmit",
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

    const parsedResult = SimulationSectionSchema.safeParse(value);
    const parsed = (parsedResult.success ? parsedResult.data : value) as SimulationSectionPayload;
    const payload = omitUndefined({
      start_offset_months: parsed.start_offset_months,
      end_age: parsed.end_age,
      mortgage_transaction_cost_rate: parsed.mortgage_transaction_cost_rate,
      real_estate_tax_rate: parsed.real_estate_tax_rate,
      real_estate_evaluation_rate: parsed.real_estate_evaluation_rate,
    });

    try {
      if (settingsId) {
        const result = await updateSimulationSettingsAction({ id: settingsId, patch: payload });
        if (!result.ok) {
          setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
          return;
        }
      } else {
        const result = await createSimulationSettingsAction(payload);
        if (!result.ok) {
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

  const handleReset = async () => {
    setSubmitError(null);
    if (!isReady || !session?.user?.id) {
      setSubmitError("ログイン情報を取得できませんでした。");
      return;
    }

    setIsResetting(true);
    try {
      const result = await resetSimulationSettingsAction({});
      if (!result.ok) {
        setSubmitError("初期値に戻せませんでした。時間をおいて再度お試しください。");
        return;
      }
      form.reset(buildSimulationSectionDefaults(result.data));
      toast.success("初期値に戻しました。");
      router.refresh();
    } catch (error) {
      console.error(error);
      setSubmitError("初期値に戻せませんでした。時間をおいて再度お試しください。");
    } finally {
      setIsResetting(false);
    }
  };

  const { isSubmitting } = form.formState;
  const isBusy = isSubmitting || isResetting;

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div>
          <p className="text-sm font-semibold">シミュレーション設定</p>
          <p className="text-xs text-muted-foreground">
            シミュレーション期間と住宅係数を設定します。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="start_offset_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>開始オフセット（月）</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="例: 0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>終了年齢</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="例: 100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-md border border-border/70 bg-muted/40 p-4">
          <p className="text-xs font-semibold text-muted-foreground">住宅係数</p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="mortgage_transaction_cost_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>諸経費率</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="decimal" placeholder="例: 1.03" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="real_estate_tax_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>固定資産税率</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="decimal" placeholder="例: 0.014" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="real_estate_evaluation_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>評価額掛目</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="decimal" placeholder="例: 0.7" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {submitError ? <p className="text-xs text-destructive">{submitError}</p> : null}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleReset} disabled={isBusy}>
            初期値に戻す
          </Button>
          <Button type="submit" disabled={isBusy}>
            保存
          </Button>
        </div>
      </form>
    </Form>
  );
}
