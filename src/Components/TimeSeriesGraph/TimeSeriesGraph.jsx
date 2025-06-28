import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const TimeSeriesGraph = ({ actualData, idealData }) => {
  const ref = useRef();

  useEffect(() => {
    if (!actualData || actualData.length === 0) return;
 

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    // transform idealData to x/y pairs
    const idealXY = idealData.map((y, i) => ({ x: i, y }));

    const combinedData = [...actualData, ...idealXY];

    // scales
    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min(combinedData, (d) => d.x),
        d3.max(combinedData, (d) => d.x),
      ])
      .nice()
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(combinedData, (d) => d.y),
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .text("Time (seconds)");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("Signal Strength");

    // line generator
    const lineGenerator = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // actual data line
    svg
      .append("path")
      .datum(actualData)
      .attr("fill", "none")
      .attr("stroke", "#1e88e5")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);

    // ideal data line
    svg
      .append("path")
      .datum(idealXY)
      .attr("fill", "none")
      .attr("stroke", "#43a047")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5 5")
      .attr("d", lineGenerator);

    // points + tooltip
    const tooltip = d3
      .select("#timeseries-tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("opacity", 0)
      .style("pointer-events", "none");

    svg
      .selectAll("circle")
      .data(actualData)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 3)
      .attr("fill", "#1e88e5")
      .on("mouseenter", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`Time: ${d.x.toFixed(2)}<br/>Value: ${d.y.toFixed(2)}`)
          .style("left", event.pageX + 5 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      });
  }, [actualData, idealData]);

  return (
    <>
      <svg ref={ref} width={1000} height={400}></svg>
      
    </>
  );
};

export default TimeSeriesGraph;
