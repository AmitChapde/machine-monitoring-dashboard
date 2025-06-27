import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const ScatterChart = ({ data, threshold, onPointClick }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 1200;
    const height = 350;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.x * 1000)))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y)])
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

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
    if (threshold !== undefined) {
      svg
        .append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", y(threshold))
        .attr("y2", y(threshold))
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4 4");
    }

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

    const gPoints = svg.append("g").attr("clip-path", "url(#clip)");

    gPoints
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(new Date(d.x * 1000)))
      .attr("cy", (d) => y(d.y))
      .attr("r", 2)
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
            `cycleId: ${d.cycleId}<br/>y: ${d.y.toFixed(
              2
            )}<br/>time: ${new Date(d.x * 1000).toLocaleString()}`
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

    function zoomed(event) {
      gPoints.attr("transform", event.transform);
      gPoints.selectAll("circle").attr("r", 2 / transform.k);
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
