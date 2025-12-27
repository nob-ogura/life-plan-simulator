"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  type FamilySectionInput,
  type FamilySectionPayload,
  FamilySectionSchema,
  toFamilyPayload,
} from "@/features/inputs/forms/sections";
import { cn } from "@/lib/utils";
import { zodResolver } from "@/lib/zod-resolver";
import { useAuth } from "@/shared/cross-cutting/auth";
import { supabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.client";

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

type FamilySectionFormProps = {
  defaultValues: FamilySectionInput;
  onSave?: (payload: ReturnType<typeof toFamilyPayload>) => void;
};

export function FamilySectionForm({ defaultValues, onSave }: FamilySectionFormProps) {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
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
  const initialChildIdsRef = useRef<string[]>(
    (defaultValues.children ?? []).map((child) => child.id).filter(Boolean) as string[],
  );
  const birthYearId = "profile-birth-year";
  const birthMonthId = "profile-birth-month";
  const spouseBirthYearId = "profile-spouse-birth-year";
  const spouseBirthMonthId = "profile-spouse-birth-month";

  useEffect(() => {
    form.reset(defaultValues);
    initialChildIdsRef.current = (defaultValues.children ?? [])
      .map((child) => child.id)
      .filter(Boolean) as string[];
  }, [defaultValues, form]);

  const onSubmit = form.handleSubmit(async (value) => {
    setSubmitError(null);
    if (!isReady || !session?.user?.id) {
      setSubmitError("ログイン情報を取得できませんでした。");
      return;
    }

    const parsedResult = FamilySectionSchema.safeParse(value);
    const parsed = (parsedResult.success ? parsedResult.data : value) as FamilySectionPayload;
    const payload = toFamilyPayload(parsed);
    const userId = session.user.id;

    const currentIds = new Set(
      parsed.children.map((child) => child.id).filter(Boolean) as string[],
    );
    const removedIds = initialChildIdsRef.current.filter((id) => !currentIds.has(id));
    const createPayloads = parsed.children.flatMap((child, index) =>
      child.id ? [] : [payload.children[index]],
    );
    const updatePayloads = parsed.children.flatMap((child, index) =>
      child.id ? [{ id: child.id, payload: payload.children[index] }] : [],
    );

    try {
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .upsert({ user_id: userId, ...payload.profile }, { onConflict: "user_id" });
      if (profileError) throw profileError;

      if (removedIds.length > 0) {
        const { error } = await supabaseClient
          .from("children")
          .delete()
          .in("id", removedIds)
          .eq("user_id", userId);
        if (error) throw error;
      }

      if (createPayloads.length > 0) {
        const { error } = await supabaseClient
          .from("children")
          .insert(createPayloads.map((child) => ({ ...child, user_id: userId })));
        if (error) throw error;
      }

      if (updatePayloads.length > 0) {
        const results = await Promise.all(
          updatePayloads.map(({ id, payload: childPayload }) =>
            supabaseClient.from("children").update(childPayload).eq("id", id).eq("user_id", userId),
          ),
        );
        const firstError = results.find((result) => result.error)?.error;
        if (firstError) throw firstError;
      }

      onSave?.(payload);
      router.refresh();
    } catch (error) {
      console.error(error);
      setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
    }
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
      {submitError ? <p className="text-xs text-destructive">{submitError}</p> : null}
      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isSubmitting}>
          保存
        </Button>
      </div>
    </form>
  );
}
