import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const TimeSeriesGraph = ({ actualData, idealData, showIdealSignal }) => {
  const ref = useRef();

  useEffect(() => {
    if (
      !actualData ||
      Object.keys(actualData).length === 0 ||
      !idealData ||
      idealData.length === 0
    ) {
      return;
    }

    const actualDataArray = actualData;

    actualDataArray.sort((a, b) => a.x - b.x);

    const timeKeys = actualDataArray.map((d) => d.x);

    // transform ideal data, align to same time points
    const idealXY = idealData
      .map((y, i) => {
        // Check if the corresponding x value exists.
        if (timeKeys[i] !== undefined) {
          return {
            x: timeKeys[i],
            y: Number.parseFloat(y),
          };
        }
        // Return null for points that don't have an x coordinate.
        return null;
      })
      // Filter out all the null entries.
      .filter((d) => d !== null);

    const combinedData = [...actualDataArray, ...idealXY];

    const width = 1000;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // x scale
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(combinedData, (d) => d.x))
      .nice()
      .range([margin.left, width - margin.right]);

    // y scale
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(combinedData, (d) => d.y)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // x axis
    const xAxis = d3.axisBottom(xScale);
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    // y axis
    const yAxis = d3.axisLeft(yScale);
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    // labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .text("Time");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("values");

    // line generator for the actual data
    const lineGenerator = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // plot actual data as a solid line
    svg
      .append("path")
      .datum(actualDataArray)
      .attr("fill", "none")
      .attr("stroke", "#1e88e5")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);

    if (showIdealSignal) {
      svg
        .append("path")
        .datum(idealXY)
        .attr("fill", "none")
        .attr("stroke", "#B2EBF2")
        .attr("stroke-width", 2)
        .attr("d", lineGenerator);

      // Plot ideal data as dots (circles)
      svg
        .selectAll(".ideal-dot")
        .data(idealXY)
        .join("circle")
        .attr("class", "ideal-dot")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", 3)
        .attr("fill", "#00bcd4")

        .on("mouseenter", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(
              `<br/>Time: ${d.x.toFixed(2)}<br/>Value: ${d.y.toFixed(2)}`
            )
            .style("left", event.pageX + 5 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseleave", () => {
          tooltip.style("opacity", 0);
        });
    }
    // tooltip
    const tooltip = d3
      .select("#timeseries-tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("opacity", 0)
      .style("pointer-events", "none");

    // Add circles for the actual data to enable tooltips

    svg
      .selectAll(".actual-dot")
      .data(actualDataArray)
      .join("circle")
      .attr("class", "actual-dot")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 3)
      .attr("fill", "#0091EA")
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
  }, [actualData, idealData, showIdealSignal]);

  return (
    <>
      <svg ref={ref} width={1000} height={400}></svg>
      <div id="timeseries-tooltip" style={{ pointerEvents: "none" }}></div>
    </>
  );
};

export default TimeSeriesGraph;
