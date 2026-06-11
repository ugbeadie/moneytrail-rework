"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryStats } from "@/lib/actions";
import { useEffect, useState } from "react";
import type { PieLabelRenderProps } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsChartProps {
  data: CategoryStats[];
  onCategoryClick?: (category: string) => void;
  loading?: boolean;
  type?: "income" | "expense";
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#facc15",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

interface ChartSegment extends CategoryStats {
  displayCategory: string;
  color: string;
  startAngle: number;
  endAngle: number;
  midAngle: number;
}
interface SegmentWithBend extends ChartSegment {
  bendPoint: { x: number; y: number };
}
interface LabelPosition extends SegmentWithBend {
  labelX: number;
  labelY: number;
  horizontalEndX: number;
  isRightSide: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: {
    payload: {
      displayCategory: string;
      amount: number;
      percentage: number;
    };
  }[];
}

export function TransactionChart({
  data,
  onCategoryClick,
  loading,
  type,
}: StatsChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector(
        ".chart-container",
      ) as HTMLElement | null;
      if (container) {
        const rect = container.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };
    // Small timeout ensures the DOM has painted before measurement
    const timer = setTimeout(updateDimensions, 0);
    window.addEventListener("resize", updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Show a beautifully centered circular skeleton if loading or dimensions aren't ready
  if (
    loading ||
    containerDimensions.width === 0 ||
    containerDimensions.height === 0
  ) {
    return (
      <div className="w-full h-64 md:h-96 flex items-center justify-center chart-container">
        <div className="relative flex items-center justify-center">
          {/* Outer ring skeleton mimicking a pie/donut perimeter */}
          <Skeleton className="h-40 w-40 md:h-56 md:w-56 rounded-full animate-pulse opacity-40" />
          {/* Inner core mask to simulate chart depth structure */}
          <div className="absolute h-24 w-24 md:h-36 md:w-36 bg-background rounded-full" />
        </div>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    ...item,
    displayCategory: item.category,
    color: COLORS[index % COLORS.length],
  }));

  let cumulativeAngle = 0;
  const segmentData: ChartSegment[] = chartData.map((item) => {
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + (item.percentage / 100) * 360;
    const midAngle = (startAngle + endAngle) / 2;
    cumulativeAngle = endAngle;
    return { ...item, startAngle, endAngle, midAngle };
  });

  const chartSettings = {
    mobile: {
      outerRadius: Math.min(containerDimensions.width * 0.25, 80),
      margin: { top: 20, right: 40, bottom: 20, left: 40 },
      fontSize: { internal: 10, external: 9 },
      threshold: 0.1,
      labelSpacing: 16,
    },
    desktop: {
      outerRadius: Math.min(containerDimensions.width * 0.3, 140),
      margin: { top: 30, right: 80, bottom: 30, left: 80 },
      fontSize: { internal: 12, external: 11 },
      threshold: 0.1,
      labelSpacing: 20,
    },
  };
  const settings = isMobile ? chartSettings.mobile : chartSettings.desktop;

  const CustomTooltip = ({ active, payload }: TooltipProps) =>
    active && payload && payload.length ? (
      <div className="bg-background border rounded-lg p-3 shadow-lg z-50">
        <p className="font-medium">{payload[0].payload.displayCategory}</p>
        <p className="text-sm text-muted-foreground">
          ₦{payload[0].payload.amount.toLocaleString()} (
          {payload[0].payload.percentage.toFixed(1)}%)
        </p>
      </div>
    ) : null;

  const calculateExternalLabelPositions = (
    segments: ChartSegment[],
    actualCx: number,
    actualCy: number,
  ): LabelPosition[] => {
    const externalSegments = segments.filter(
      (seg) => seg.percentage / 100 < settings.threshold,
    );

    const positions: LabelPosition[] = [];
    const leftSide: SegmentWithBend[] = [];
    const rightSide: SegmentWithBend[] = [];

    externalSegments.forEach((seg) => {
      const RADIAN = Math.PI / 180;
      const bendRadius = settings.outerRadius + (isMobile ? 6 : 10);
      const bendPoint = {
        x: actualCx + bendRadius * Math.cos(-seg.midAngle * RADIAN),
        y: actualCy + bendRadius * Math.sin(-seg.midAngle * RADIAN),
      };
      (bendPoint.x > actualCx ? rightSide : leftSide).push({
        ...seg,
        bendPoint,
      });
    });

    leftSide.sort((a, b) => a.bendPoint.y - b.bendPoint.y);
    rightSide.sort((a, b) => a.bendPoint.y - b.bendPoint.y);

    const calcPositions = (sideSegments: SegmentWithBend[], isRight: boolean) =>
      sideSegments.map((seg, i) => {
        const baseY = seg.bendPoint.y;
        const adjustedY =
          i === 0
            ? baseY
            : Math.max(
                baseY,
                (positions[positions.length - 1]?.labelY || baseY) +
                  settings.labelSpacing,
              );

        const horizontalLength = isMobile ? 10 : 14;
        const horizontalEndX = isRight
          ? seg.bendPoint.x + horizontalLength
          : seg.bendPoint.x - horizontalLength;
        const labelX = isRight ? horizontalEndX + 3 : horizontalEndX - 3;

        const pos: LabelPosition = {
          ...seg,
          labelX,
          labelY: adjustedY,
          horizontalEndX,
          isRightSide: isRight,
        };
        positions.push(pos);
        return pos;
      });

    return [
      ...calcPositions(leftSide, false),
      ...calcPositions(rightSide, true),
    ];
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: PieLabelRenderProps) => {
    if (!percent || percent < 0.005) return null;
    if (percent < settings.threshold) return null;

    const RADIAN = Math.PI / 180;
    const radius =
      Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.45;

    const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
    const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);

    const categoryName = chartData[index!]?.displayCategory || "";

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={settings.fontSize.internal}
        fontWeight="bold"
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
      >
        <tspan x={x} dy="-6">
          {categoryName}
        </tspan>
        <tspan x={x} dy="12">{`${(percent * 100).toFixed(0)}%`}</tspan>
      </text>
    );
  };

  const ExternalLabels = ({ cx, cy }: { cx: number; cy: number }) => {
    const RADIAN = Math.PI / 180;
    const externalPositions = calculateExternalLabelPositions(
      segmentData,
      cx,
      cy,
    );

    return (
      <g>
        {externalPositions.map((pos) => {
          const innerRadius2 = settings.outerRadius + (isMobile ? 1 : 2);
          const innerPoint = {
            x: cx + innerRadius2 * Math.cos(-pos.midAngle * RADIAN),
            y: cy + innerRadius2 * Math.sin(-pos.midAngle * RADIAN),
          };
          const categoryName = pos.displayCategory || "";

          return (
            <g key={`external-label-${pos.category}`}>
              <line
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={pos.bendPoint.x}
                y2={pos.bendPoint.y}
                stroke="#666"
                strokeWidth={isMobile ? 1 : 1.2}
                opacity={0.8}
              />
              <line
                x1={pos.bendPoint.x}
                y1={pos.bendPoint.y}
                x2={pos.horizontalEndX}
                y2={pos.labelY}
                stroke="#666"
                strokeWidth={isMobile ? 1 : 1.2}
                opacity={0.8}
              />
              <text
                x={pos.labelX}
                y={pos.labelY}
                fill="currentColor"
                textAnchor={pos.isRightSide ? "start" : "end"}
                dominantBaseline="central"
                fontSize={settings.fontSize.external}
                fontWeight="bold"
                className="fill-foreground cursor-pointer"
                onClick={() => onCategoryClick?.(pos.category)}
              >
                <tspan x={pos.labelX} dy="-6">
                  {categoryName}
                </tspan>
                <tspan x={pos.labelX} dy="12">{`${pos.percentage.toFixed(
                  0,
                )}%`}</tspan>
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="w-full h-64 md:h-96 chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={settings.margin}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={settings.outerRadius}
            fill="#8884d8"
            dataKey="amount"
            stroke="transparent"
            strokeWidth={0}
            onClick={(d) =>
              "category" in d &&
              onCategoryClick?.((d as unknown as CategoryStats).category)
            }
          >
            {chartData.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={entry.color}
                stroke="transparent"
                strokeWidth={0}
                style={{ outline: "none", cursor: "pointer" }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <ExternalLabels
            cx={containerDimensions.width * 0.5}
            cy={containerDimensions.height * 0.5}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
