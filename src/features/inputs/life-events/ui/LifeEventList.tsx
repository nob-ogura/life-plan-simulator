"use client";

import { Button } from "@/components/ui/button";
import {
  categoryLabels,
  formatAmount,
  formatRepeat,
  formatYearMonth,
} from "@/features/inputs/life-events/ui/formatters";
import type { Tables } from "@/types/supabase";

type LifeEventListProps = {
  events: Array<Tables<"life_events">>;
  onDelete: (eventId: string) => void;
  deletingId: string | null;
};

export function LifeEventList({ events, onDelete, deletingId }: LifeEventListProps) {
  if (events.length === 0) {
    return <p className="text-xs text-muted-foreground">登録済のイベントはありません</p>;
  }

  return (
    <div className="grid gap-3">
      {events.map((event) => (
        <div key={event.id} className="rounded-md border border-border bg-background/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{event.label}</p>
              <p className="text-xs text-muted-foreground">
                {categoryLabels.get(event.category) ?? event.category} ·{" "}
                {formatYearMonth(event.year_month)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-foreground">
                {formatAmount(event.amount)}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDelete(event.id)}
                disabled={deletingId === event.id}
              >
                削除
              </Button>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">繰り返し: {formatRepeat(event)}</div>
        </div>
      ))}
    </div>
  );
}
