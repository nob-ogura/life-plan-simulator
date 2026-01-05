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
import { upsertRetirementBonusAction } from "@/features/inputs/life-events/commands/upsert-retirement-bonus/action";
import { zodResolver } from "@/lib/zod-resolver";
import { UI_TEXT } from "@/shared/constants/messages";
import { toRetirementPayload } from "./mapper";
import {
  type RetirementSectionInput,
  type RetirementSectionPayload,
  RetirementSectionSchema,
} from "./schema";

type RetirementBonusFormProps = {
  defaultValues: RetirementSectionInput;
};

export function RetirementBonusForm({ defaultValues }: RetirementBonusFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<RetirementSectionInput>({
    defaultValues,
    resolver: zodResolver(RetirementSectionSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const onSubmit = form.handleSubmit(async (value) => {
    setSubmitError(null);

    const parsedResult = RetirementSectionSchema.safeParse(value);
    const parsed = (parsedResult.success ? parsedResult.data : value) as RetirementSectionPayload;
    const payload = toRetirementPayload(parsed);

    try {
      const response = await upsertRetirementBonusAction(payload);
      if (response.ok) {
        toast.success(UI_TEXT.IS_REGISTERED);
        router.refresh();
      } else {
        setSubmitError(UI_TEXT.FAILED_TO_REGISTER);
      }
    } catch (error) {
      console.error(error);
      setSubmitError(UI_TEXT.FAILED_TO_REGISTER);
    }
  });

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <input type="hidden" {...form.register("label")} />
        <div>
          <p className="text-sm font-semibold">退職金</p>
          <p className="text-xs text-muted-foreground">
            `退職金${UI_TEXT.ONLY_ONE_RECORD_CAN_BE_REGISTERED}`
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>金額</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="例: 1500000" />
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
                <FormLabel>支給年月</FormLabel>
                <FormControl>
                  <Input {...field} type="month" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {submitError ? <p className="text-xs text-destructive">{submitError}</p> : null}

        <div className="flex items-center justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {UI_TEXT.REGISTER}
          </Button>
        </div>
      </form>
    </Form>
  );
}
