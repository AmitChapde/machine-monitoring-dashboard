import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const TimeSeriesGraph = ({ actualData, idealData }) => {
  const ref = useRef();

  useEffect(() => {
    if (
      !actualData ||
      Object.keys(actualData).length === 0 ||
      !idealData ||
      idealData.length === 0
    ) {
      console.log(
        "TimeSeriesGraph: Waiting for both actualData and idealData to be available."
      );
      return; // Abort the render until both data sets are ready
    }

    console.log("Actual Data Received:", actualData);
    console.log("Ideal Data Received:", idealData);

    // transform actual data (object of time:value)

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

    console.log("Ideal Data after mapping (inspect for NaN):", idealXY);

    const combinedData = [...actualDataArray, ...idealXY];

    const width = 1000;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // x scale
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(combinedData, (d) => d.x)) // Use d3.extent for a robust domain
      .nice()
      .range([margin.left, width - margin.right]);

    // y scale
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(combinedData, (d) => d.y)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // x axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // y axis
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
      .text("Time)");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("values");

    // line generator
    const lineGenerator = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // plot actual
    svg
      .append("path")
      .datum(actualDataArray)
      .attr("fill", "none")
      .attr("stroke", "#1e88e5")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);

    // plot ideal
    svg
      .append("path")
      .datum(idealXY)
      .attr("fill", "none")
      .attr("stroke", "#B2EBF2")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5 5")
      .attr("d", lineGenerator);

    // tooltip
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
      .data(actualDataArray)
      .join("circle")
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
  }, [actualData, idealData]);

  return (
    <>
      <svg ref={ref} width={1000} height={400}></svg>
      <div id="timeseries-tooltip"></div>
    </>
  );
};

export default TimeSeriesGraph;
