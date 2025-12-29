"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  type DashboardDisplayRange,
  DEFAULT_DISPLAY_RANGE,
  displayRangeOptions,
  filterSimulationMonthsByRange,
} from "@/features/dashboard/shared/display-range";
import type { SimulationMonthlyResult } from "@/shared/domain/simulation";

type DashboardSimulationViewProps = {
  months: SimulationMonthlyResult[];
};

const cashflowColumns = ["年月", "収入", "支出", "差分", "残高"];

const formatAmount = (value: number) =>
  `${new Intl.NumberFormat("ja-JP").format(Math.round(value))}円`;

export function DashboardSimulationView({ months }: DashboardSimulationViewProps) {
  const [displayRange, setDisplayRange] = useState<DashboardDisplayRange>(DEFAULT_DISPLAY_RANGE);
  const filteredMonths = useMemo(
    () => filterSimulationMonthsByRange(months, displayRange),
    [months, displayRange],
  );
  const hasSimulation = months.length > 0;
  const previewMonths = hasSimulation ? filteredMonths.slice(0, 6) : [];

  return (
    <>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Range
            </p>
            <h2 className="mt-1 text-lg font-semibold">表示範囲切替</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              直近5年と全期間を切り替えて表示します。
            </p>
          </div>
          <div className="flex items-center gap-2">
            {displayRangeOptions.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={displayRange === option.value ? "default" : "outline"}
                onClick={() => setDisplayRange(option.value)}
                aria-pressed={displayRange === option.value}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Assets Trend
            </p>
            <h2 className="mt-1 text-lg font-semibold">資産推移グラフ</h2>
          </div>
          <span className="text-xs text-muted-foreground">cash + investment</span>
        </div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-dashed border-border bg-background/60 p-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>グラフ描画エリア{hasSimulation ? ` (${filteredMonths.length}ヶ月)` : ""}</span>
              <span>ハイライト: 枯渇月</span>
            </div>
            <div className="mt-4 h-56 rounded-lg bg-muted/40" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Cashflow
            </p>
            <h2 className="mt-1 text-lg font-semibold">月次キャッシュフロー表</h2>
          </div>
          <span className="text-xs text-muted-foreground">仮想スクロール予定</span>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-5 gap-px bg-border text-xs font-semibold text-muted-foreground">
            {cashflowColumns.map((column) => (
              <div key={column} className="bg-background px-3 py-2">
                {column}
              </div>
            ))}
          </div>
          <div className="divide-y divide-border bg-background">
            {previewMonths.length > 0
              ? previewMonths.map((month) => {
                  const net = month.totalIncome - month.totalExpense + month.eventAmount;
                  return (
                    <div key={month.yearMonth} className="grid grid-cols-5 px-3 py-3 text-xs">
                      <div className="text-muted-foreground">{month.yearMonth}</div>
                      <div>{formatAmount(month.totalIncome)}</div>
                      <div>{formatAmount(month.totalExpense)}</div>
                      <div>{formatAmount(net)}</div>
                      <div>{formatAmount(month.totalBalance)}</div>
                    </div>
                  );
                })
              : Array.from({ length: 6 }, (_, index) => `placeholder-${index + 1}`).map((rowId) => (
                  <div key={rowId} className="grid grid-cols-5 px-3 py-3 text-xs">
                    <div className="text-muted-foreground">----</div>
                    <div className="text-muted-foreground">--</div>
                    <div className="text-muted-foreground">--</div>
                    <div className="text-muted-foreground">--</div>
                    <div className="text-muted-foreground">--</div>
                  </div>
                ))}
          </div>
        </div>
      </section>
    </>
  );
}
