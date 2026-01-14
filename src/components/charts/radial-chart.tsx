"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

interface RadialChartProps {
  progress: number;
  size?: number;
}

const chartConfig = {
  track: {
    label: "Track",
    color: "rgba(255, 255, 255, 0.2)",
  },
  progress: {
    label: "Progress",
    color: "white",
  },
} satisfies ChartConfig;

export function RadialChart({
  progress,
  size = 38,
}: RadialChartProps) {
  // Clamp progress between 0-100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Scale radii based on size
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.65;

  const chartData = [
    { name: "progress", value: clampedProgress, fill: "var(--color-progress)" },
  ];

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-square -ml-1 [&_.recharts-radial-bar-background-sector]:fill-white/10"
      style={{ width: size, height: size }}
    >
      <RadialBarChart
        data={chartData}
        startAngle={90}
        endAngle={-270}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar
          dataKey="value"
          background={{ fill: "rgba(255, 255, 255, 0.5)" }}
          cornerRadius={size}
          fill="white"
        />
      </RadialBarChart>
    </ChartContainer>
  );
}
