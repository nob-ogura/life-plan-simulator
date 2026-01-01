"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createLifeEventAction } from "@/features/inputs/life-events/commands/create-life-event/action";
import { deleteLifeEventAction } from "@/features/inputs/life-events/commands/delete-life-event/action";
import { toMonthStartDate } from "@/features/inputs/shared/date";
import { zodResolver } from "@/lib/zod-resolver";
import {
  isHousingPurchase as isHousingPurchaseCategory,
  isRetirementBonus,
  type LifeEventCategory,
} from "@/shared/domain/life-events/categories";
import type { Tables } from "@/types/supabase";

const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const requiredString = z.string().trim().min(1, { message: "必須項目です" });

const requiredNumericString = z
  .string()
  .trim()
  .min(1, { message: "必須項目です" })
  .refine((value) => !Number.isNaN(Number(value)), {
    message: "数値で入力してください",
  })
  .transform((value) => Number(value));

const optionalNumericString = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .refine((value) => value === "" || !Number.isNaN(Number(value)), {
    message: "数値で入力してください",
  })
  .transform((value) => (value === "" ? undefined : Number(value)));

const optionalIntegerString = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .refine((value) => value === "" || /^\d+$/.test(value), {
    message: "整数で入力してください",
  })
  .transform((value) => (value === "" ? undefined : Number(value)));

const optionalPositiveInteger = optionalIntegerString.refine(
  (value) => value === undefined || value > 0,
  {
    message: "正の整数で入力してください",
  },
);

const optionalAgeInteger = optionalIntegerString.refine(
  (value) => value === undefined || (value >= 0 && value <= 120),
  {
    message: "0〜120の整数で入力してください",
  },
);

const requiredYearMonth = z
  .string()
  .trim()
  .min(1, { message: "必須項目です" })
  .refine((value) => YEAR_MONTH_REGEX.test(value), {
    message: "YYYY-MM 形式で入力してください",
  });

const categorySchema = requiredString.refine(
  (value) => !isRetirementBonus(value as LifeEventCategory),
  {
    message: "退職金は専用フォームで登録してください",
  },
);

const LifeEventFormSchema = z
  .object({
    label: requiredString,
    amount: requiredNumericString,
    year_month: requiredYearMonth,
    repeat_interval_years: optionalNumericString,
    stop_after_occurrences: optionalPositiveInteger,
    stop_after_age: optionalAgeInteger,
    category: categorySchema,
    building_price: optionalNumericString,
    land_price: optionalNumericString,
    down_payment: optionalNumericString,
  })
  .superRefine((value, ctx) => {
    if (!isHousingPurchaseCategory(value.category as LifeEventCategory)) return;
    if (value.building_price == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["building_price"],
        message: "必須項目です",
      });
    }
    if (value.land_price == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["land_price"],
        message: "必須項目です",
      });
    }
    if (value.down_payment == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["down_payment"],
        message: "必須項目です",
      });
    }
  });

export type LifeEventFormInput = z.input<typeof LifeEventFormSchema>;

type LifeEventFormPayload = z.output<typeof LifeEventFormSchema>;

export type LifeEventFormSubmitHandler = ReturnType<
  UseFormReturn<LifeEventFormInput>["handleSubmit"]
>;

type UseLifeEventActionsResult = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  form: UseFormReturn<LifeEventFormInput>;
  onSubmit: LifeEventFormSubmitHandler;
  submitError: string | null;
  deleteError: string | null;
  deletingId: string | null;
  handleDelete: (eventId: string) => Promise<void>;
  isRetirementCategory: boolean;
  isHousingPurchase: boolean;
  sortedEvents: Array<Tables<"life_events">>;
  isSubmitting: boolean;
};

const defaultValues: LifeEventFormInput = {
  label: "",
  amount: "",
  year_month: "",
  repeat_interval_years: "",
  stop_after_occurrences: "",
  stop_after_age: "",
  category: "",
  building_price: "",
  land_price: "",
  down_payment: "",
};

export function useLifeEventActions(
  events: Array<Tables<"life_events">>,
): UseLifeEventActionsResult {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const form = useForm<LifeEventFormInput>({
    defaultValues,
    resolver: zodResolver(LifeEventFormSchema),
    mode: "onSubmit",
  });

  const watchCategory = form.watch("category") as LifeEventCategory | "";
  const isRetirementCategory = watchCategory ? isRetirementBonus(watchCategory) : false;
  const isHousingPurchase = watchCategory ? isHousingPurchaseCategory(watchCategory) : false;

  const sortedEvents = useMemo(
    () =>
      [...events].sort((left, right) =>
        (left.year_month ?? "").localeCompare(right.year_month ?? ""),
      ),
    [events],
  );

  const openModal = () => {
    setSubmitError(null);
    setDeleteError(null);
    form.reset(defaultValues);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSubmitError(null);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setDeleteError(null);

    try {
      const parsedResult = LifeEventFormSchema.safeParse(values);
      const parsed = (parsedResult.success ? parsedResult.data : values) as LifeEventFormPayload;
      const response = await createLifeEventAction({
        label: parsed.label,
        amount: parsed.amount,
        year_month: toMonthStartDate(parsed.year_month),
        repeat_interval_years: parsed.repeat_interval_years ?? null,
        stop_after_occurrences: parsed.stop_after_occurrences ?? null,
        stop_after_age: parsed.stop_after_age ?? null,
        category: parsed.category,
        auto_toggle_key: null,
        building_price: parsed.building_price ?? null,
        land_price: parsed.land_price ?? null,
        down_payment: parsed.down_payment ?? null,
      });

      if (response.ok) {
        closeModal();
        toast.success("保存しました。");
        router.refresh();
      } else {
        setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
      }
    } catch (error) {
      console.error(error);
      setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
    }
  });

  const handleDelete = async (eventId: string) => {
    if (deletingId) return;
    setDeleteError(null);
    setDeletingId(eventId);

    try {
      const response = await deleteLifeEventAction({ id: eventId });
      if (response.ok) {
        toast.success("削除しました。");
        router.refresh();
      } else {
        setDeleteError("削除に失敗しました。時間をおいて再度お試しください。");
      }
    } catch (error) {
      console.error(error);
      setDeleteError("削除に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setDeletingId(null);
    }
  };

  const { isSubmitting } = form.formState;

  return {
    isOpen,
    openModal,
    closeModal,
    form,
    onSubmit,
    submitError,
    deleteError,
    deletingId,
    handleDelete,
    isRetirementCategory,
    isHousingPurchase,
    sortedEvents,
    isSubmitting,
  };
}
