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
import {
  type HousingSectionInput,
  type HousingSectionPayload,
  HousingSectionSchema,
  toHousingPayloads,
} from "@/features/inputs/forms/sections";
import { createMortgageAction } from "@/features/inputs/mortgages/commands/create-mortgage/action";
import { deleteMortgageAction } from "@/features/inputs/mortgages/commands/delete-mortgage/action";
import { updateMortgageAction } from "@/features/inputs/mortgages/commands/update-mortgage/action";
import { createRentalAction } from "@/features/inputs/rentals/commands/create-rental/action";
import { deleteRentalAction } from "@/features/inputs/rentals/commands/delete-rental/action";
import { updateRentalAction } from "@/features/inputs/rentals/commands/update-rental/action";
import { zodResolver } from "@/lib/zod-resolver";
import { useAuth } from "@/shared/cross-cutting/auth";

type HousingSectionFormProps = {
  defaultValues: HousingSectionInput;
};

export function HousingSectionForm({ defaultValues }: HousingSectionFormProps) {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<HousingSectionInput>({
    defaultValues,
    resolver: zodResolver(HousingSectionSchema),
    mode: "onSubmit",
  });
  const {
    fields: mortgageFields,
    append: appendMortgage,
    remove: removeMortgage,
  } = useFieldArray({
    control: form.control,
    name: "mortgages",
    keyName: "fieldKey",
  });
  const {
    fields: rentalFields,
    append: appendRental,
    remove: removeRental,
  } = useFieldArray({
    control: form.control,
    name: "rentals",
    keyName: "fieldKey",
  });

  const initialMortgageIdsRef = useRef<string[]>(
    (defaultValues.mortgages ?? []).map((mortgage) => mortgage.id).filter(Boolean) as string[],
  );
  const initialRentalIdsRef = useRef<string[]>(
    (defaultValues.rentals ?? []).map((rental) => rental.id).filter(Boolean) as string[],
  );

  useEffect(() => {
    form.reset(defaultValues);
    initialMortgageIdsRef.current = (defaultValues.mortgages ?? [])
      .map((mortgage) => mortgage.id)
      .filter(Boolean) as string[];
    initialRentalIdsRef.current = (defaultValues.rentals ?? [])
      .map((rental) => rental.id)
      .filter(Boolean) as string[];
  }, [defaultValues, form]);

  const onSubmit = form.handleSubmit(async (value) => {
    setSubmitError(null);
    if (!isReady || !session?.user?.id) {
      setSubmitError("ログイン情報を取得できませんでした。");
      return;
    }

    const parsedResult = HousingSectionSchema.safeParse(value);
    const parsed = (parsedResult.success ? parsedResult.data : value) as HousingSectionPayload;
    const payloads = toHousingPayloads(parsed);
    const currentMortgageIds = new Set(
      parsed.mortgages.map((mortgage) => mortgage.id).filter(Boolean) as string[],
    );
    const removedMortgageIds = initialMortgageIdsRef.current.filter(
      (id) => !currentMortgageIds.has(id),
    );
    const createMortgagePayloads = parsed.mortgages.flatMap((mortgage, index) =>
      mortgage.id ? [] : [payloads.mortgages[index]],
    );
    const updateMortgagePayloads = parsed.mortgages.flatMap((mortgage, index) =>
      mortgage.id ? [{ id: mortgage.id, payload: payloads.mortgages[index] }] : [],
    );

    const currentRentalIds = new Set(
      parsed.rentals.map((rental) => rental.id).filter(Boolean) as string[],
    );
    const removedRentalIds = initialRentalIdsRef.current.filter((id) => !currentRentalIds.has(id));
    const createRentalPayloads = parsed.rentals.flatMap((rental, index) =>
      rental.id ? [] : [payloads.rentals[index]],
    );
    const updateRentalPayloads = parsed.rentals.flatMap((rental, index) =>
      rental.id ? [{ id: rental.id, payload: payloads.rentals[index] }] : [],
    );

    try {
      if (removedMortgageIds.length > 0) {
        const results = await Promise.all(
          removedMortgageIds.map((id) => deleteMortgageAction({ id })),
        );
        if (results.some((result) => !result.ok)) {
          setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
          return;
        }
      }

      if (removedRentalIds.length > 0) {
        const results = await Promise.all(removedRentalIds.map((id) => deleteRentalAction({ id })));
        if (results.some((result) => !result.ok)) {
          setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
          return;
        }
      }

      if (createMortgagePayloads.length > 0) {
        const results = await Promise.all(
          createMortgagePayloads.map((payload) => createMortgageAction(payload)),
        );
        if (results.some((result) => !result.ok)) {
          setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
          return;
        }
      }

      if (createRentalPayloads.length > 0) {
        const results = await Promise.all(
          createRentalPayloads.map((payload) => createRentalAction(payload)),
        );
        if (results.some((result) => !result.ok)) {
          setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
          return;
        }
      }

      if (updateMortgagePayloads.length > 0) {
        const results = await Promise.all(
          updateMortgagePayloads.map(({ id, payload }) =>
            updateMortgageAction({ id, patch: payload }),
          ),
        );
        if (results.some((result) => !result.ok)) {
          setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
          return;
        }
      }

      if (updateRentalPayloads.length > 0) {
        const results = await Promise.all(
          updateRentalPayloads.map(({ id, payload }) => updateRentalAction({ id, patch: payload })),
        );
        if (results.some((result) => !result.ok)) {
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
      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">住宅購入</p>
              <p className="text-xs text-muted-foreground">
                建物価格・土地価格・頭金・返済年数・金利を入力します。
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendMortgage({
                  principal: "",
                  annual_rate: "",
                  years: "",
                  start_year_month: "",
                  building_price: "",
                  land_price: "",
                  down_payment: "",
                  target_rental_id: "",
                })
              }
            >
              追加
            </Button>
          </div>
          {mortgageFields.length === 0 ? (
            <p className="text-xs text-muted-foreground">住宅購入の登録はありません。</p>
          ) : (
            <div className="space-y-4">
              {mortgageFields.map((field, index) => (
                <div
                  key={field.fieldKey}
                  className="space-y-4 rounded-md border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">住宅購入 {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMortgage(index)}
                    >
                      削除
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`mortgages.${index}.building_price` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>建物価格</FormLabel>
                          <FormControl>
                            <Input {...field} inputMode="numeric" placeholder="例: 25000000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`mortgages.${index}.land_price` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>土地価格</FormLabel>
                          <FormControl>
                            <Input {...field} inputMode="numeric" placeholder="例: 12000000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`mortgages.${index}.down_payment` as const}
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
                    <FormField
                      control={form.control}
                      name={`mortgages.${index}.years` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>返済年数</FormLabel>
                          <FormControl>
                            <Input {...field} inputMode="numeric" placeholder="例: 35" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`mortgages.${index}.annual_rate` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>金利</FormLabel>
                          <FormControl>
                            <Input {...field} inputMode="decimal" placeholder="例: 0.015" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`mortgages.${index}.principal` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>借入額</FormLabel>
                          <FormControl>
                            <Input {...field} inputMode="numeric" placeholder="例: 32000000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`mortgages.${index}.start_year_month` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>借入開始年月</FormLabel>
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
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">賃貸</p>
              <p className="text-xs text-muted-foreground">家賃と期間を入力します。</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendRental({
                  rent_monthly: "",
                  start_year_month: "",
                  end_year_month: "",
                })
              }
            >
              追加
            </Button>
          </div>
          {rentalFields.length === 0 ? (
            <p className="text-xs text-muted-foreground">賃貸の登録はありません。</p>
          ) : (
            <div className="space-y-4">
              {rentalFields.map((field, index) => (
                <div
                  key={field.fieldKey}
                  className="space-y-4 rounded-md border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">賃貸 {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRental(index)}
                    >
                      削除
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`rentals.${index}.rent_monthly` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>家賃（月額）</FormLabel>
                          <FormControl>
                            <Input {...field} inputMode="numeric" placeholder="例: 120000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rentals.${index}.start_year_month` as const}
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
                      name={`rentals.${index}.end_year_month` as const}
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
