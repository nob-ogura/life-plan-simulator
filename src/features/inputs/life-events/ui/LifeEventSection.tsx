"use client";

import { Button } from "@/components/ui/button";
import { LifeEventAddModal } from "@/features/inputs/life-events/ui/LifeEventAddModal";
import { LifeEventList } from "@/features/inputs/life-events/ui/LifeEventList";
import { useLifeEventActions } from "@/features/inputs/life-events/ui/useLifeEventActions";
import type { Tables } from "@/types/supabase";

type LifeEventSectionProps = {
  events: Array<Tables<"life_events">>;
};

export function LifeEventSection({ events }: LifeEventSectionProps) {
  const {
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
  } = useLifeEventActions(events);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">ライフイベント一覧</p>
          <p className="text-xs text-muted-foreground">
            繰り返し設定を含め、将来イベントを登録できます
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={openModal}>
          イベント追加
        </Button>
      </div>

      <LifeEventList events={sortedEvents} onDelete={handleDelete} deletingId={deletingId} />

      {deleteError ? <p className="text-xs text-destructive">{deleteError}</p> : null}

      <div className="rounded-lg border border-dashed border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
        退職金は専用フォームで登録します カテゴリに `retirement_bonus` は指定できません
      </div>

      <LifeEventAddModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={onSubmit}
        form={form}
        isRetirementCategory={isRetirementCategory}
        isHousingPurchase={isHousingPurchase}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
}
