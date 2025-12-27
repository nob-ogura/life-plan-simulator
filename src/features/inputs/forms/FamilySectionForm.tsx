"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

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
  type FamilySectionInput,
  type FamilySectionPayload,
  FamilySectionSchema,
  toFamilyPayload,
} from "@/features/inputs/forms/sections";
import { zodResolver } from "@/lib/zod-resolver";
import { useAuth } from "@/shared/cross-cutting/auth";
import { supabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.client";

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

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="profile.birth_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>本人（年）</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="例: 1985" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profile.birth_month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>本人（月）</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="例: 4" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profile.spouse_birth_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>配偶者（年）</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="例: 1988" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profile.spouse_birth_month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>配偶者（月）</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="例: 7" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
              {fields.map((field, index) => (
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
                  <FormField
                    control={form.control}
                    name={`children.${index}.label` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ラベル</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="例: 第一子" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`children.${index}.birth_year_month` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>出生年月</FormLabel>
                          <FormControl>
                            <Input {...field} type="month" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`children.${index}.due_year_month` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>誕生予定年月</FormLabel>
                          <FormControl>
                            <Input {...field} type="month" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`children.${index}.note` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>メモ</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="任意" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
