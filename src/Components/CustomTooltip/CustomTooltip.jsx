import { format } from "date-fns";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: "#fff", border: "1px solid #ccc", padding: 10, borderRadius: 5 }}>
        <p><strong>Cycle ID:</strong> {data.cycleId}</p>
        <p><strong>Start Time:</strong> {format(new Date(data.start_time), "PPpp")}</p>
        <p><strong>End Time:</strong> {format(new Date(data.end_time), "PPpp")}</p>
        <p><strong>Distance:</strong> {data.y}</p>
        <p><strong>Anomaly:</strong> {data.anomaly ? "Yes" : "No"}</p>
      </div>
    );
  }

  return null;
};
export default CustomTooltip;