"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { DashboardSimulationMonthlyResult } from "@/features/dashboard/queries/get-dashboard-simulation/response";
import {
  type DashboardDisplayRange,
  DEFAULT_DISPLAY_RANGE,
  displayRangeOptions,
  filterSimulationMonthsByRange,
} from "@/features/dashboard/shared/display-range";
import { AssetTrendChart } from "@/features/dashboard/ui/AssetTrendChart";
import type { YearMonthString } from "@/shared/domain/simulation";
import { calculateSummaryMetrics, findDepletionYearMonth } from "@/shared/domain/simulation";
import { Money } from "@/shared/domain/value-objects/Money";

type DashboardSimulationViewProps = {
  months: DashboardSimulationMonthlyResult[];
  depletionYearMonth: YearMonthString | null;
};

const summaryCardDefinitions = [
  {
    id: "cumulative",
    title: "累計収支",
    description: "表示範囲内の収支合計",
  },
  {
    id: "average",
    title: "平均月残高",
    description: "平均的な月末残高",
  },
  {
    id: "depletion",
    title: "資産寿命",
    description: "資産が枯渇する月",
  },
] as const;

const cashflowColumns = ["年月", "収入", "支出", "差分", "残高"];
const CASHFLOW_ROW_HEIGHT = 44;
const CASHFLOW_VIEWPORT_HEIGHT = 320;
const CASHFLOW_OVERSCAN = 6;

const formatAmount = (value: number) => Money.of(value).formatYen();

export function DashboardSimulationView({
  months,
  depletionYearMonth,
}: DashboardSimulationViewProps) {
  const [displayRange, setDisplayRange] = useState<DashboardDisplayRange>(DEFAULT_DISPLAY_RANGE);
  const [cashflowScrollbarWidth, setCashflowScrollbarWidth] = useState(0);
  const filteredMonths = useMemo(
    () => filterSimulationMonthsByRange(months, displayRange),
    [months, displayRange],
  );
  const hasSimulation = months.length > 0;
  const summaryMetrics = useMemo(() => calculateSummaryMetrics(filteredMonths), [filteredMonths]);
  const depletionYearMonthInRange = useMemo(
    () => findDepletionYearMonth(filteredMonths),
    [filteredMonths],
  );
  const summaryCards = useMemo(() => {
    const emptyValues = summaryCardDefinitions.map((card) => ({ ...card, value: "--" }));

    if (!hasSimulation) {
      return emptyValues;
    }

    const summaryValues = {
      cumulative: formatAmount(summaryMetrics.cumulativeCashflow),
      average: formatAmount(summaryMetrics.averageMonthlyBalance),
      depletion: depletionYearMonth ?? "枯渇なし",
    };

    return summaryCardDefinitions.map((card) => ({
      ...card,
      value: summaryValues[card.id],
    }));
  }, [hasSimulation, summaryMetrics, depletionYearMonth]);

  return (
    <>
      <section className="sticky top-0 z-10 -mx-6 border-b border-border bg-background/80 px-6 pb-4 pt-2 backdrop-blur">
        <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Summary
              </p>
              <h2 className="mt-1 text-lg font-semibold">サマリカード</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-border bg-background/60 p-4"
              >
                <p className="text-xs font-semibold text-muted-foreground">{card.title}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Range
            </p>
            <h2 className="mt-1 text-lg font-semibold">表示範囲切替</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              直近5年と全期間を切り替えて表示します
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
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              現預金
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              投資
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-dashed border-border bg-background/60 p-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>グラフ描画エリア{hasSimulation ? ` (${filteredMonths.length}ヶ月)` : ""}</span>
              <span data-testid="depletion-label">
                {depletionYearMonthInRange != null
                  ? `枯渇月: ${depletionYearMonthInRange}`
                  : "枯渇なし"}
              </span>
            </div>
            <div className="mt-4">
              <AssetTrendChart
                months={filteredMonths}
                depletionYearMonth={depletionYearMonthInRange}
              />
            </div>
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
          <span className="text-xs text-muted-foreground">
            {hasSimulation ? `${filteredMonths.length}ヶ月` : "仮想スクロール"}
          </span>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div
            className="grid grid-cols-5 divide-x divide-border bg-background text-xs font-semibold text-muted-foreground"
            style={{ paddingRight: cashflowScrollbarWidth }}
          >
            {cashflowColumns.map((column) => (
              <div key={column} className="px-3 py-2">
                {column}
              </div>
            ))}
          </div>
          <CashflowTable
            months={filteredMonths}
            onScrollbarWidthChange={setCashflowScrollbarWidth}
          />
        </div>
      </section>
    </>
  );
}

type CashflowTableProps = {
  months: DashboardSimulationMonthlyResult[];
  onScrollbarWidthChange?: (width: number) => void;
};

function CashflowTable({ months, onScrollbarWidthChange }: CashflowTableProps) {
  const displayMonths = useMemo(() => months, [months]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const hasData = displayMonths.length > 0;
  const firstMonth = displayMonths[0];
  const lastMonth = displayMonths[displayMonths.length - 1];
  const rangeKey =
    !hasData || !firstMonth || !lastMonth
      ? "empty"
      : `${firstMonth.yearMonth}-${lastMonth.yearMonth}-${displayMonths.length}`;

  useEffect(() => {
    if (rangeKey) {
      setScrollTop(0);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [rangeKey]);

  const placeholderRows = 6;
  const totalRows = hasData ? displayMonths.length : placeholderRows;
  const totalHeight = totalRows * CASHFLOW_ROW_HEIGHT;
  const viewportHeight = Math.min(totalHeight, CASHFLOW_VIEWPORT_HEIGHT);
  const startIndex = hasData
    ? Math.max(0, Math.floor(scrollTop / CASHFLOW_ROW_HEIGHT) - CASHFLOW_OVERSCAN)
    : 0;
  const endIndex = hasData
    ? Math.min(
        totalRows,
        Math.ceil((scrollTop + viewportHeight) / CASHFLOW_ROW_HEIGHT) + CASHFLOW_OVERSCAN,
      )
    : 0;
  const visibleMonths = hasData ? displayMonths.slice(startIndex, endIndex) : [];
  const paddingTop = hasData ? startIndex * CASHFLOW_ROW_HEIGHT : 0;
  const paddingBottom = hasData
    ? Math.max(0, totalHeight - paddingTop - visibleMonths.length * CASHFLOW_ROW_HEIGHT)
    : 0;

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !onScrollbarWidthChange) {
      return;
    }

    const updateScrollbarWidth = () => {
      const width = scrollContainer.offsetWidth - scrollContainer.clientWidth;
      onScrollbarWidthChange(width);
    };

    updateScrollbarWidth();
    window.addEventListener("resize", updateScrollbarWidth);

    return () => {
      window.removeEventListener("resize", updateScrollbarWidth);
    };
  }, [onScrollbarWidthChange]);

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-auto bg-background"
      style={{ height: viewportHeight }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      data-testid="cashflow-scroll"
    >
      <div
        className="divide-y divide-border"
        style={{ paddingTop, paddingBottom, minHeight: totalHeight }}
      >
        {hasData
          ? visibleMonths.map((month) => {
              return (
                <div key={month.yearMonth} className="grid h-11 grid-cols-5 items-center text-xs">
                  <div className="px-3 text-muted-foreground">{month.yearMonth}</div>
                  <div className="px-3">{formatAmount(month.totalIncome)}</div>
                  <div className="px-3">{formatAmount(month.totalExpense)}</div>
                  <div className="px-3">{formatAmount(month.netCashflow)}</div>
                  <div className="px-3">{formatAmount(month.totalBalance)}</div>
                </div>
              );
            })
          : Array.from({ length: placeholderRows }, (_, index) => `placeholder-${index + 1}`).map(
              (rowId) => (
                <div
                  key={rowId}
                  className="grid h-11 grid-cols-5 items-center text-xs text-muted-foreground"
                >
                  <div className="px-3">----</div>
                  <div className="px-3">--</div>
                  <div className="px-3">--</div>
                  <div className="px-3">--</div>
                  <div className="px-3">--</div>
                </div>
              ),
            )}
      </div>
    </div>
  );
}
