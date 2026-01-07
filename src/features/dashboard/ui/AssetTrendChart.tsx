"use client";

import { useId, useMemo } from "react";

import type { SimulationMonthlyResult, YearMonthString } from "@/shared/domain/simulation";

type AssetTrendChartProps = {
  months: SimulationMonthlyResult[];
  depletionYearMonth?: YearMonthString | null;
};

type ChartPoint = {
  x: number;
  cash: number;
  total: number;
};

const CHART_WIDTH = 960;
const CHART_HEIGHT = 220;
const CHART_PADDING = { top: 12, bottom: 24, left: 16, right: 16 };

const buildLinePath = (points: ChartPoint[], yValue: (point: ChartPoint) => number) => {
  if (points.length === 0) {
    return "";
  }
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${yValue(point)}`)
    .join(" ");
};

const buildAreaPath = (
  points: ChartPoint[],
  yTop: (point: ChartPoint) => number,
  yBottom: (point: ChartPoint) => number,
) => {
  if (points.length === 0) {
    return "";
  }
  const topPath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${yTop(point)}`)
    .join(" ");
  const bottomPath = [...points]
    .reverse()
    .map((point) => `L ${point.x} ${yBottom(point)}`)
    .join(" ");
  return `${topPath} ${bottomPath} Z`;
};

export function AssetTrendChart({ months, depletionYearMonth }: AssetTrendChartProps) {
  const gradientBaseId = useId();
  const chartData = useMemo(() => {
    if (months.length === 0) {
      return null;
    }
    const values = months.flatMap((month) => [month.cashBalance, month.totalBalance, 0]);
    const min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
      max = min + 1;
    }
    const width = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
    const height = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
    const scaleX = (index: number) =>
      months.length === 1
        ? CHART_PADDING.left + width / 2
        : CHART_PADDING.left + (index / (months.length - 1)) * width;
    const scaleY = (value: number) => {
      const ratio = (value - min) / (max - min);
      return CHART_PADDING.top + (1 - ratio) * height;
    };

    const points: ChartPoint[] = months.map((month, index) => ({
      x: scaleX(index),
      cash: month.cashBalance,
      total: month.totalBalance,
    }));

    const cashAreaPath = buildAreaPath(
      points,
      (point) => scaleY(point.cash),
      () => scaleY(0),
    );
    const investmentAreaPath = buildAreaPath(
      points,
      (point) => scaleY(point.total),
      (point) => scaleY(point.cash),
    );
    const cashLinePath = buildLinePath(points, (point) => scaleY(point.cash));
    const totalLinePath = buildLinePath(points, (point) => scaleY(point.total));
    const zeroY = scaleY(0);

    const depletionIndex =
      depletionYearMonth != null
        ? months.findIndex((month) => month.yearMonth === depletionYearMonth)
        : months.findIndex((month) => month.totalBalance < 0);
    const depletionPoint = depletionIndex >= 0 ? points[depletionIndex] : null;
    const depletionY = depletionPoint ? scaleY(depletionPoint.total) : null;

    return {
      cashAreaPath,
      investmentAreaPath,
      cashLinePath,
      totalLinePath,
      zeroY,
      depletionPoint,
      depletionY,
    };
  }, [months, depletionYearMonth]);

  if (!chartData) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg bg-muted/40 text-xs text-muted-foreground">
        データがありません
      </div>
    );
  }

  const cashGradientId = `${gradientBaseId}-cash`;
  const investmentGradientId = `${gradientBaseId}-investment`;

  return (
    <div className="h-56 w-full" data-testid="asset-trend-chart">
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="資産推移グラフ"
      >
        <defs>
          <linearGradient id={cashGradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id={investmentGradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(56 189 248)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(56 189 248)" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        <line
          x1={CHART_PADDING.left}
          x2={CHART_WIDTH - CHART_PADDING.right}
          y1={chartData.zeroY}
          y2={chartData.zeroY}
          className="stroke-muted-foreground/40"
          strokeDasharray="4 4"
        />

        <path d={chartData.investmentAreaPath} fill={`url(#${investmentGradientId})`} />
        <path d={chartData.cashAreaPath} fill={`url(#${cashGradientId})`} />

        <path d={chartData.totalLinePath} className="stroke-sky-600" strokeWidth="2" fill="none" />
        <path
          d={chartData.cashLinePath}
          className="stroke-emerald-600"
          strokeWidth="2"
          fill="none"
        />

        {chartData.depletionPoint && chartData.depletionY != null ? (
          <>
            <rect
              x={chartData.depletionPoint.x - 1}
              y={CHART_PADDING.top}
              width="2"
              height={CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom}
              className="fill-rose-500"
              data-testid="depletion-highlight"
            />
            <circle
              cx={chartData.depletionPoint.x}
              cy={chartData.depletionY}
              r="4"
              className="fill-rose-500 stroke-white"
              strokeWidth="1.5"
            />
          </>
        ) : null}
      </svg>
    </div>
  );
}
