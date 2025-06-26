import { useState, useEffect } from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Box,
  Paper,
  Select,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import filterDataByTool from "../utils/filterDataByTool";
import { getChangeLogData, getPredictionData } from "../services/mockApi";
import ScatterChartComponent from "../Components/ScatterPlot/ScatterChartComponent";

const ScatterPage = () => {
  const [machineId, setMachineId] = useState("SSP0173");
  const [toolOptions, setToolOptions] = useState([]);
  const [selectedTool, setSelectedTool] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [unprocessedSequences, setUnprocessedSequences] = useState(null);
  const [rawPrediction, setRawPrediction] = useState(null);
  const [rawChangeLog, setRawChangeLog] = useState(null);
  const [scatterData, setScatterData] = useState({});
  const [clickedPoint, setClickedPoint] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const changeLog = await getChangeLogData({
          machine_id: machineId,
          from_time: fromTime,
          to_time: toTime,
        });

        const prediction = await getPredictionData({
          machine_id: machineId,
          from_time: fromTime,
          to_time: toTime,
        });

        setRawPrediction(prediction);
        setRawChangeLog(changeLog);

        const toolMap = changeLog?.Result?.length
          ? changeLog.Result[0]?.config_parameters?.tool_sequence_map
          : null;

        if (toolMap) {
          const toolOpts = Object.entries(toolMap).map(([key, value]) => ({
            id: key,
            label: `${value}`,
          }));
          setToolOptions(toolOpts);

          if (!toolOpts.find((t) => t.id === selectedTool)) {
            setSelectedTool(toolOpts[0]?.id ?? "");
          }
        } else {
          setToolOptions([]);
          setSelectedTool("");
        }

        const unprocessedArray = Object.entries(
          prediction.unprocessed_sequences
        ).map(([toolId, count]) => ({
          toolId: Math.floor(parseInt(toolId) / 100),
          count,
        }));

        setUnprocessedSequences(unprocessedArray);
      } catch (err) {
        console.error("Error during data fetch:", err);
      }
    };

    fetchData();
  }, [machineId, fromTime, toTime]);

  const handleSearch = () => {
    if (!rawPrediction || !rawChangeLog || !selectedTool) return;

    const filtered = filterDataByTool(
      rawPrediction,
      rawChangeLog,
      selectedTool
    );
    console.log("Filtered Data:", filtered);
    setScatterData(filtered);
  };



  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Scatter Data
      </Typography>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          {/* Machine Selector */}
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="machine-label">Machine</InputLabel>
            <Select
              labelId="machine-label"
              value={machineId}
              label="Machine"
              onChange={(e) => setMachineId(e.target.value)}
            >
              <MenuItem value="SSP0173">SSP0173</MenuItem>
              <MenuItem value="SSP0167">SSP0167</MenuItem>
            </Select>
          </FormControl>

          {/* From Time */}
          <TextField
            label="Start Time"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            sx={{ minWidth: 250 }}
          />

          {/* To Time */}
          <TextField
            label="End Time"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            sx={{ minWidth: 250 }}
          />

          {/* Tool Selector */}
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="tool-label">Tools</InputLabel>
            <Select
              labelId="tool-label"
              value={selectedTool}
              label="Tool"
              onChange={(e) => setSelectedTool(e.target.value)}
            >
              {toolOptions.map((tool) => (
                <MenuItem key={tool.id} value={tool.id}>
                  {tool.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search */}
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              backgroundColor: "#272e3f",
              color: "#fff",
              borderColor: "#512DA8",
              textTransform: "none",
            }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* Unprocessed Sequences */}
      {unprocessedSequences && (
        <Paper sx={{ p: 3, mt: 2, borderRadius: 2 }}>
          <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
            <Typography variant="body1" sx={{ mr: 1 }}>
              Unprocessed Sequences:
            </Typography>
            {unprocessedSequences.map((seq) => (
              <Chip
                key={seq.toolId}
                label={`${seq.toolId}: ${seq.count}`}
                variant="filled"
                size="medium"
                sx={{
                  backgroundColor: "#673AB7",
                  color: "#fff",
                  borderColor: "#512DA8",
                  fontWeight: "bold",
                }}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Scatter Chart */}
      <Paper sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        {scatterData.scatterData?.length > 0 ? (
          <ScatterChartComponent
            data={scatterData}
            threshold={scatterData?.threshold}
            validationLimits={scatterData?.validationLimits}
            selectedTool={selectedTool}
            showComparison={showComparison}
            onPointClick={setClickedPoint}
          />
        ) : (
          <Typography variant="body1" color="textSecondary">
            No data available for the selected filters.
          </Typography>
        )}
      </Paper>

      {/* Graph 2 (Placeholder) */}
      <Paper sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Typography>Time Series Graph (Graph 2)</Typography>
        <Box></Box>
      </Paper>
    </Box>
  );
};
export default ScatterPage;
