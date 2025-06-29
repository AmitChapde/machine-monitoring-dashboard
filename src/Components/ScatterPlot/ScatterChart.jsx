import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// This component creates a D3.js scatter chart within a React component.
const ScatterChart = ({ data, threshold, onPointClick }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // chart dimensions and margins.
    const width = 1200;
    const height = 350;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    // Set up the x-axis (time scale)
    const xTimes = data.map((d) => d.x * 1000);
    const timeMin = d3.min(xTimes);
    const timeMax = d3.max(xTimes);

    // calculate time step for ideal signal alignment
    const totalDuration = timeMax - timeMin;
    const approxPoints = 20;

    const x = d3
      .scaleTime()
      .domain([timeMin, timeMax])
      .range([margin.left, width - margin.right]);

    // Set up the y-axis (linear scale).
    const yMax = d3.max(data, (d) => d.y);
    const yMin = d3.min(data, (d) => d.y);
    const yBuffer = (yMax - yMin) * 0.1;

    const y = d3
      .scaleLinear()
      .domain([Math.max(0, yMin - yBuffer), yMax + yBuffer])
      .range([height - margin.bottom, margin.top]);

    // Create and add the x-axis
    const xAxis = d3
      .axisBottom(x)
      .ticks(d3.timeWeek.every(1))
      .tickFormat(d3.timeFormat("%b %d"));

    // Create and add the y-axis
    const yAxis = d3.axisLeft(y);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .attr("class", "x-axis")
      .call(xAxis);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    //X label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .text("Time");

    // Y label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .text("Values");

    // threshold line
    const thresholdLine = threshold;

    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", y(thresholdLine))
      .attr("y2", y(thresholdLine))
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 4");

    // zoom
    const zoom = d3
      .zoom()
      .scaleExtent([1, 40])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", zoomed);

    svg.call(zoom);

    // Create a group for the data points with a clip path.
    const gPoints = svg.append("g").attr("clip-path", "url(#clip)");

    // Draw the data points as circles.
    gPoints
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(new Date(d.x * 1000)))
      .attr("cy", (d) => y(d.y))
      .attr("r", 2)
      // Color points based on whether they are an anomaly.
      .attr("fill", (d) => {
        if (d.anomaly === true) return "#c62828";
        if (d.anomaly === false) return "#4caf50";
        return "#000000";
      })
      .attr("stroke", "none")
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("r", 5);
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(
            `time: ${new Date(d.x * 1000).toLocaleString()}<br/>
   value: ${d.y.toFixed(2)}`
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this).attr("r", 2);
        d3.select("#tooltip").style("opacity", 0);
      })
      .on("click", function (event, d) {
        onPointClick?.(d.cycleId, d.anomaly);
      });

    // Zoom function to update positions on zoom.
    function zoomed(event) {
      const transform = event.transform;

      const zx = transform.rescaleX(x);

      svg.select(".x-axis").call(xAxis.scale(zx));

      gPoints
        .selectAll("circle")
        .attr("cx", (d) => zx(new Date(d.x * 1000)))
        .attr("cy", (d) => y(d.y));
    }
  }, [data, threshold, onPointClick]);

  return (
    <>
      <svg ref={ref} width={1200} height={400}>
        <defs>
          <clipPath id="clip">
            <rect x="0" y="0" width={1200} height={400} />
          </clipPath>
        </defs>
      </svg>

      <div
        id="tooltip"
        style={{
          position: "absolute",
          opacity: 0,
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "5px",
          pointerEvents: "none",
        }}
      ></div>
    </>
  );
};

export default ScatterChart;
