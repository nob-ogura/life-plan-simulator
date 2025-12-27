"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";

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
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "children",
    keyName: "fieldKey",
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
            placeholder="例: 1988"
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
            placeholder="例: 7"
          />
          {errors.profile?.spouse_birth_month?.message ? (
            <p className="text-xs text-destructive">{errors.profile.spouse_birth_month.message}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">子ども</p>
            <p className="text-xs text-muted-foreground">
              出生年月か誕生予定年月のいずれかは必須です。
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ label: "", birth_year_month: "", due_year_month: "", note: "" })
            }
          >
            追加
          </Button>
        </div>
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">子どもの登録はありません。</p>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => {
              const childErrors = errors.children?.[index];
              const labelId = `children-${field.fieldKey}-label`;
              const birthYearMonthId = `children-${field.fieldKey}-birth-year-month`;
              const dueYearMonthId = `children-${field.fieldKey}-due-year-month`;
              const noteId = `children-${field.fieldKey}-note`;
              return (
                <div
                  key={field.fieldKey}
                  className="space-y-3 rounded-md border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">子ども {index + 1}</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                      削除
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={labelId}
                    >
                      ラベル
                    </label>
                    <input
                      {...form.register(`children.${index}.label`)}
                      className={cn(inputClassName, childErrors?.label && "border-destructive")}
                      id={labelId}
                      placeholder="例: 第一子"
                    />
                    {childErrors?.label?.message ? (
                      <p className="text-xs text-destructive">{childErrors.label.message}</p>
                    ) : null}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        htmlFor={birthYearMonthId}
                      >
                        出生年月
                      </label>
                      <input
                        {...form.register(`children.${index}.birth_year_month`)}
                        className={cn(
                          inputClassName,
                          childErrors?.birth_year_month && "border-destructive",
                        )}
                        id={birthYearMonthId}
                        type="month"
                      />
                      {childErrors?.birth_year_month?.message ? (
                        <p className="text-xs text-destructive">
                          {childErrors.birth_year_month.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        htmlFor={dueYearMonthId}
                      >
                        誕生予定年月
                      </label>
                      <input
                        {...form.register(`children.${index}.due_year_month`)}
                        className={cn(
                          inputClassName,
                          childErrors?.due_year_month && "border-destructive",
                        )}
                        id={dueYearMonthId}
                        type="month"
                      />
                      {childErrors?.due_year_month?.message ? (
                        <p className="text-xs text-destructive">
                          {childErrors.due_year_month.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      htmlFor={noteId}
                    >
                      メモ
                    </label>
                    <input
                      {...form.register(`children.${index}.note`)}
                      className={cn(inputClassName, childErrors?.note && "border-destructive")}
                      id={noteId}
                      placeholder="任意"
                    />
                    {childErrors?.note?.message ? (
                      <p className="text-xs text-destructive">{childErrors.note.message}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isSubmitting}>
          保存
        </Button>
      </div>
    </form>
  );
}
