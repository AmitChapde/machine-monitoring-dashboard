import React, { useMemo } from "react";
import { generateYTicks, generateXTicks } from "../../utils/scatterChartUtil";
import CustomTooltip from "../CustomTooltip/CustomTooltip";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";

const ScatterChartComponent = React.memo(function ScatterChartComponent({
  data = {},
  threshold,
  validationlimits,
  selectedTool,
  showComparison,
  clickedPoint,
}) {
  const scatterPoints = data.scatterData || [];

  const { minX, maxX, maxY } = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < scatterPoints.length; i++) {
      const p = scatterPoints[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if ((p.y || 0) > maxY) maxY = p.y || 0;
    }

    return { minX, maxX, maxY };
  }, [scatterPoints]);

  const getDotColor = (anomaly) => {
    if (anomaly === true) return "#c62828e1";
    if (anomaly === false) return "#4caf4fcb";
    return "#3333339f";
  };
  return (
    <ScatterChart
      width={1200}
      height={300}
      margin={{
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      }}
    >
      <CartesianGrid />
      <XAxis
        type="number"
        dataKey="x"
        domain={[minX, maxX]}
        ticks={generateXTicks(minX, maxX)}
        tickFormatter={(t) => new Date(t * 1000).toLocaleDateString()}
        name="Time"
      />
      <YAxis
        type="number"
        dataKey="y"
        ticks={generateYTicks(maxY)}
        name="values"
      />
      {/* <Tooltip content={<CustomTooltip />} /> */}
      <Scatter name="cycles" data={scatterPoints} fill="#8884d8">
        {scatterPoints.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={getDotColor(entry.anomaly)} />
        ))}
      </Scatter>
    </ScatterChart>
  );
});

export default ScatterChartComponent;
