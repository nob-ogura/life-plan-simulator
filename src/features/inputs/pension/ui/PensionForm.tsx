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
import { upsertProfileAction } from "@/features/inputs/profiles/commands/upsert-profile/action";
import { createSimulationSettingsAction } from "@/features/inputs/simulation-settings/commands/create-simulation-settings/action";
import { updateSimulationSettingsAction } from "@/features/inputs/simulation-settings/commands/update-simulation-settings/action";
import { zodResolver } from "@/lib/zod-resolver";
import { useAuth } from "@/shared/cross-cutting/auth";

import {
  type PensionSectionInput,
  type PensionSectionPayload,
  PensionSectionSchema,
} from "./schema";

type PensionFormProps = {
  defaultValues: PensionSectionInput;
  simulationSettingsId?: string | null;
};

const omitUndefined = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as T;

export function PensionForm({ defaultValues, simulationSettingsId }: PensionFormProps) {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<PensionSectionInput>({
    defaultValues,
    resolver: zodResolver(PensionSectionSchema),
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

    const parsedResult = PensionSectionSchema.safeParse(value);
    const parsed = (parsedResult.success ? parsedResult.data : value) as PensionSectionPayload;
    try {
      const simulationPayload = omitUndefined({
        pension_amount_single: parsed.pension_amount_single,
        pension_amount_spouse: parsed.pension_amount_spouse,
      });
      const [profileResult, settingsResult] = await Promise.all([
        upsertProfileAction({
          patch: { pension_start_age: parsed.pension_start_age },
        }),
        simulationSettingsId
          ? updateSimulationSettingsAction({ id: simulationSettingsId, patch: simulationPayload })
          : createSimulationSettingsAction({ end_age: 100, ...simulationPayload }),
      ]);
      if (!profileResult.ok || !settingsResult.ok) {
        setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
        return;
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
          <p className="text-sm font-semibold">年金開始年齢</p>
          <p className="text-xs text-muted-foreground">
            年金収入の開始年齢と月額を入力してください。
          </p>
        </div>
        <FormField
          control={form.control}
          name="pension_start_age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>年金開始年齢</FormLabel>
              <FormControl>
                <Input {...field} inputMode="numeric" placeholder="例: 65" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-md border border-border/70 bg-muted/40 p-4">
          <p className="text-xs font-semibold text-muted-foreground">年金月額</p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="pension_amount_single"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>単身</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="numeric" placeholder="例: 65000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pension_amount_spouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>配偶者分</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="numeric" placeholder="例: 130000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
