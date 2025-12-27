"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  type FamilySectionInput,
  FamilySectionSchema,
  toFamilyPayload,
} from "@/features/inputs/forms/sections";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

type FamilySectionFormProps = {
  defaultValues: FamilySectionInput;
  onSave?: (payload: ReturnType<typeof toFamilyPayload>) => void;
};

export function FamilySectionForm({ defaultValues, onSave }: FamilySectionFormProps) {
  const form = useForm<FamilySectionInput>({
    defaultValues,
    resolver: zodResolver(FamilySectionSchema),
    mode: "onSubmit",
  });
  const birthYearId = "profile-birth-year";
  const birthMonthId = "profile-birth-month";
  const spouseBirthYearId = "profile-spouse-birth-year";
  const spouseBirthMonthId = "profile-spouse-birth-month";

  const onSubmit = form.handleSubmit((value) => {
    const parsed = FamilySectionSchema.parse(value);
    const payload = toFamilyPayload(parsed);
    onSave?.(payload);
  });

  const { errors, isSubmitting } = form.formState;

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            htmlFor={birthYearId}
          >
            本人（年）
          </label>
          <input
            {...form.register("profile.birth_year")}
            className={cn(inputClassName, errors.profile?.birth_year && "border-destructive")}
            id={birthYearId}
            inputMode="numeric"
            placeholder="例: 1985"
          />
          {errors.profile?.birth_year?.message ? (
            <p className="text-xs text-destructive">{errors.profile.birth_year.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            htmlFor={birthMonthId}
          >
            本人（月）
          </label>
          <input
            {...form.register("profile.birth_month")}
            className={cn(inputClassName, errors.profile?.birth_month && "border-destructive")}
            id={birthMonthId}
            inputMode="numeric"
            placeholder="例: 4"
          />
          {errors.profile?.birth_month?.message ? (
            <p className="text-xs text-destructive">{errors.profile.birth_month.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            htmlFor={spouseBirthYearId}
          >
            配偶者（年）
          </label>
          <input
            {...form.register("profile.spouse_birth_year")}
            className={cn(
              inputClassName,
              errors.profile?.spouse_birth_year && "border-destructive",
            )}
            id={spouseBirthYearId}
            inputMode="numeric"
            placeholder="任意"
          />
          {errors.profile?.spouse_birth_year?.message ? (
            <p className="text-xs text-destructive">{errors.profile.spouse_birth_year.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            htmlFor={spouseBirthMonthId}
          >
            配偶者（月）
          </label>
          <input
            {...form.register("profile.spouse_birth_month")}
            className={cn(
              inputClassName,
              errors.profile?.spouse_birth_month && "border-destructive",
            )}
            id={spouseBirthMonthId}
            inputMode="numeric"
            placeholder="任意"
          />
          {errors.profile?.spouse_birth_month?.message ? (
            <p className="text-xs text-destructive">{errors.profile.spouse_birth_month.message}</p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isSubmitting}>
          保存
        </Button>
      </div>
    </form>
  );
}
