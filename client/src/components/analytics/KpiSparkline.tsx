import * as React from "react";
import { ChartContainer } from "@mui/x-charts/ChartContainer";
import { LinePlot } from "@mui/x-charts/LineChart";
import { BarPlot } from "@mui/x-charts/BarChart";
import { ChartsXAxis } from "@mui/x-charts/ChartsXAxis";
import { ChartsYAxis } from "@mui/x-charts/ChartsYAxis";
import { ChartsTooltip } from "@mui/x-charts/ChartsTooltip";
import type { AllSeriesType } from "@mui/x-charts/models";

type KpiSparklineProps = {
  labels: (string | number)[];
  // Back-compat single series
  values?: number[];
  // Preferred explicit series
  yesValues?: number[];
  noValues?: number[];
  volumeValues?: number[];
  height?: number;
  color?: string; // back-compat color for single series
  yesColor?: string;
  noColor?: string;
  type?: 'line' | 'bar';
};

export function KpiSparkline({
  labels,
  values,
  yesValues,
  noValues,
  volumeValues,
  height = 220,
  color,
  yesColor,
  noColor,
  type = "line",
}: KpiSparklineProps) {
  const series = React.useMemo<AllSeriesType[]>(() => {
    const items: AllSeriesType[] = [];
    const xLen = Array.isArray(labels) ? labels.length : 0;
    const trunc = (arr?: number[]) => (arr ? arr.slice(0, xLen) : arr);

    const yesAligned = trunc(yesValues ?? values ?? []);
    const noAligned = trunc(noValues);
    const volAligned = trunc(volumeValues);

    if (volAligned && volAligned.length > 0) {
      items.push({
        type: "bar",
        yAxisId: "volume",
        label: "Volume",
        color: "#9ca3af",
        data: volAligned,
        highlightScope: { highlight: "item" },
      });
    }

    if (yesAligned && yesAligned.length > 0) {
      items.push({
        type,
        yAxisId: "price",
        label: "YES",
        data: yesAligned,
        color: yesColor ?? color ?? "#22c55e",
        showMark: false,
        highlightScope: { highlight: "item" },
      });
    }

    if (noAligned && noAligned.length > 0) {
      items.push({
        type,
        yAxisId: "price",
        label: "NO",
        data: noAligned,
        color: noColor ?? "#ef4444",
        showMark: false,
        highlightScope: { highlight: "item" },
      });
    }

    return items;
  }, [labels, yesValues, values, volumeValues, type, yesColor, color, noValues, noColor]);

  if (!labels || labels.length === 0 || series.length === 0) {
    return <div className="w-full text-xs text-muted-foreground">No data</div>;
  }

  return (
    <div className="w-full">
      <ChartContainer
        height={height}
        series={series}
        xAxis={[{
          data: labels,
          scaleType: 'band',
          id: 'x',
          tickLabelStyle: {
            fontSize: 10,
          },
          height: 36,
        }]}
        yAxis={[
          {
            id: 'price',
            scaleType: 'linear',
            position: 'left',
            min: 0,
            max: 1,
            tickLabelStyle: { fontSize: 10 },
            width: 48,
          },
          {
            id: 'volume',
            scaleType: 'linear',
            position: 'right',
            tickLabelStyle: { fontSize: 10 },
            width: 54,
            valueFormatter: (value) => `${Number(value).toLocaleString()} PTS`,
          },
        ]}
        margin={{ top: 16, bottom: 12, left: 8, right: 12 }}
      >
        <LinePlot />
        <BarPlot />
        <ChartsXAxis axisId="x" display="auto" />
        <ChartsYAxis axisId="price" label="Price" />
        <ChartsYAxis axisId="volume" label="Volume" />
        <ChartsTooltip />
      </ChartContainer>
    </div>
  );
}
