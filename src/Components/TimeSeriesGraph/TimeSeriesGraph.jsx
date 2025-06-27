import { useEffect, useRef } from "react";
import * as d3 from "d3";

const TimeSeriesGraph = ({ actualData, idealData }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!actualData || !idealData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear on redraw

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(actualData, (d) => d.x))
      .range([margin.left, width - margin.right]);

    const yMax = d3.max([
      d3.max(actualData, (d) => d.y),
      d3.max(idealData, (d) => d.y),
    ]);

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([height - margin.bottom, margin.top]);

    // actual signal
    svg
      .append("path")
      .datum(actualData)
      .attr("fill", "none")
      .attr("stroke", "#0091EA")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y))
      );

    // ideal signal
    svg
      .append("path")
      .datum(idealData.map((y, i) => ({ x: i, y })))
      .attr("fill", "none")
      .attr("stroke", "#B2EBF2")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 2")
      .attr(
        "d",
        d3
          .line()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y))
      );

    // axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));
  }, [actualData, idealData]);

  return <svg ref={svgRef} width={800} height={400}></svg>;
};

export default TimeSeriesGraph;
