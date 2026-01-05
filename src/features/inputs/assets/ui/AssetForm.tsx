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
import { createAssetAction } from "@/features/inputs/assets/commands/create-asset/action";
import { updateAssetAction } from "@/features/inputs/assets/commands/update-asset/action";
import { toAssetPayload } from "@/features/inputs/assets/ui/mapper";
import {
  type AssetFormInput,
  type AssetFormPayload,
  AssetFormSchema,
} from "@/features/inputs/assets/ui/schema";
import { zodResolver } from "@/lib/zod-resolver";
import { UI_TEXT } from "@/shared/constants/messages";
import { useAuth } from "@/shared/cross-cutting/auth";

type AssetFormProps = {
  defaultValues: AssetFormInput;
  assetId?: string | null;
};

export function AssetForm({ defaultValues, assetId }: AssetFormProps) {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<AssetFormInput>({
    defaultValues,
    resolver: zodResolver(AssetFormSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const onSubmit = form.handleSubmit(async (value) => {
    setSubmitError(null);
    if (!isReady || !session?.user?.id) {
      setSubmitError("ログイン情報を取得できませんでした");
      return;
    }

    const parsedResult = AssetFormSchema.safeParse(value);
    const parsed = (parsedResult.success ? parsedResult.data : value) as AssetFormPayload;
    const payload = toAssetPayload(parsed);
    try {
      if (assetId) {
        const result = await updateAssetAction({ id: assetId, patch: payload });
        if (!result.ok) {
          setSubmitError(UI_TEXT.FAILED_TO_REGISTER);
          return;
        }
      } else {
        const result = await createAssetAction(payload);
        if (!result.ok) {
          setSubmitError(UI_TEXT.FAILED_TO_REGISTER);
          return;
        }
      }

      toast.success(UI_TEXT.IS_REGISTERED);
      router.refresh();
    } catch (error) {
      console.error(error);
      setSubmitError(UI_TEXT.FAILED_TO_REGISTER);
    }
  });

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <p className="text-sm font-semibold">投資設定</p>
          <p className="text-xs text-muted-foreground">現金・運用残高と利回りを入力してください</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="cash_balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>現金残高</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="例: 1000000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="investment_balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>運用残高</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="例: 5000000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="return_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>運用利回り</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="decimal" placeholder="例: 0.03" />
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
