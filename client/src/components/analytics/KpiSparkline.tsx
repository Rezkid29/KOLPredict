import * as React from "react";
import { ChartContainer } from "@mui/x-charts/ChartContainer";
import { LinePlot } from "@mui/x-charts/LineChart";
import { BarPlot } from "@mui/x-charts/BarChart";
import { ChartsXAxis } from "@mui/x-charts/ChartsXAxis";
import { ChartsTooltip } from "@mui/x-charts/ChartsTooltip";
import { ChartsAxisHighlight } from "@mui/x-charts/ChartsAxisHighlight";

type KpiSparklineProps = {
  labels: (string | number)[];
  // Back-compat single series
  values?: number[];
  // Preferred explicit series
  yesValues?: number[];
  noValues?: number[];
  height?: number;
  color?: string; // back-compat color for single series
  yesColor?: string;
  noColor?: string;
  type?: 'line' | 'bar';
};

export function KpiSparkline({ labels, values, yesValues, noValues, height = 112, color, yesColor, noColor, type = 'line' }: KpiSparklineProps) {
  return (
    <div className="w-full">
      <ChartContainer
        height={height}
        series={(() => {
          const series: any[] = [];
          const yesData = yesValues ?? values ?? [];
          if (yesData.length > 0) {
            series.push({
              type,
              data: yesData,
              color: yesColor ?? color ?? '#22c55e', // green for YES
              showMark: false,
              area: type === 'line' && !noValues,
            });
          }
          if (noValues && noValues.length > 0) {
            series.push({
              type,
              data: noValues,
              color: noColor ?? '#ef4444', // red for NO
              showMark: false,
              area: false,
            });
          }
          return series;
        })()}
        xAxis={[{
          data: labels,
          scaleType: 'band',
          id: 'x',
          height: 20,
        }]}
        yAxis={[{ min: 0, max: 1 }]}
        margin={{ top: 6, bottom: 2, left: 0, right: 0 }}
      >
        <LinePlot />
        <BarPlot />
        <ChartsXAxis axisId="x" display="auto" />
        <ChartsAxisHighlight />
        <ChartsTooltip />
      </ChartContainer>
    </div>
  );
}
