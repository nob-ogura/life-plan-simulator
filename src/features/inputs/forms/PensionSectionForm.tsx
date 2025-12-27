"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
  type PensionSectionInput,
  type PensionSectionPayload,
  PensionSectionSchema,
} from "@/features/inputs/forms/sections";
import { zodResolver } from "@/lib/zod-resolver";
import { useAuth } from "@/shared/cross-cutting/auth";
import { supabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.client";

type PensionSectionFormProps = {
  defaultValues: PensionSectionInput;
};

export function PensionSectionForm({ defaultValues }: PensionSectionFormProps) {
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
    const userId = session.user.id;

    try {
      const { error } = await supabaseClient.from("profiles").upsert(
        { user_id: userId, pension_start_age: parsed.pension_start_age },
        {
          onConflict: "user_id",
        },
      );
      if (error) throw error;

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
          <p className="text-xs text-muted-foreground">年金収入の開始年齢を入力してください。</p>
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
