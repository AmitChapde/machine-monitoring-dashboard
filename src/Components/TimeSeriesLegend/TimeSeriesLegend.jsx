import React from "react";

const TimeSeriesLegend = () => {
  const legendContainerStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    marginTop: "10px",
    fontSize: "14px",
    fontFamily: "sans-serif",
  };

  const legendItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  };

  return (
    <div className="time-series-legend-container" style={legendContainerStyle}>
      {/* Ideal Line Legend Item (Dashed Green) */}
      <div className="legend-item ideal" style={legendItemStyle}>
        <svg width="25" height="15">
          {/* Use a line element to represent the dashed line style */}
          <line
            x1="0"
            y1="7.5"
            x2="25"
            y2="7.5"
            stroke=" #B2EBF2"
            strokeWidth="2"
            strokeDasharray="5,5" // Creates the dashed pattern
          />
        </svg>
        <span>Ideal</span>
      </div>

      {/* Actual Line Legend Item (Solid Blue) */}
      <div className="legend-item actual" style={legendItemStyle}>
        <svg width="25" height="15">
          {/* Use a line element to represent the solid line style */}
          <line
            x1="0"
            y1="7.5"
            x2="25"
            y2="7.5"
            stroke="#0091EA"
            strokeWidth="2"
          />
        </svg>
        {/* Display the timestamp passed as a prop */}
        <span>Actual </span>
      </div>
    </div>
  );
};

export default TimeSeriesLegend;
