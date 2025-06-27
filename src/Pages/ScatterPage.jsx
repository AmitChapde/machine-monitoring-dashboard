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
import {
  getChangeLogData,
  getPredictionData,
  getCycleData,
} from "../services/mockApi";
import { mapCycleData } from "../utils/mapCycleData";
import ScatterChart from "../Components/ScatterPlot/ScatterChart";
import TimeSeriesGraph from "../Components/TimeSeriesGraph/TimeSeriesGraph";
import ScatterLegend from "../Components/ScatterLegend/ScatterLegend";
import { useSnackbar } from "notistack";

const ScatterPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [machineId, setMachineId] = useState("SSP0173");
  const [toolOptions, setToolOptions] = useState([]);
  const [selectedTool, setSelectedTool] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [unprocessedSequences, setUnprocessedSequences] = useState(null);
  const [rawPrediction, setRawPrediction] = useState(null);
  const [rawChangeLog, setRawChangeLog] = useState(null);
  const [scatterData, setScatterData] = useState({});
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [actualSignal, setActualSignal] = useState(null);
  const [idealSignal, setIdealSignal] = useState(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

 
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
    } catch (e) {
      console.error("ChangeLog fetch error", e);
    }
  };

  fetchData();
}, [machineId, fromTime, toTime]);

  // fetch ideal signal after tools are loaded and selected
  // useEffect(() => {
  //   if (!selectedTool || !rawChangeLog) return;

  //   const ideal =
  //     rawChangeLog?.Result?.[0]?.learned_parameters?.[selectedTool]
  //       ?.average_list ?? [];
  //   setIdealSignal(ideal);
  // }, [selectedTool, rawChangeLog]);

  // useEffect(() => {
  //   const fetchActualSignal = async () => {
  //     if (!selectedCycle || selectedAnomaly == null) return;

  //     try {
  //       const anomalyType =
  //         selectedAnomaly === true
  //           ? "red"
  //           : selectedAnomaly === false
  //           ? "green"
  //           : "black";

  //       const response = await getCycleData({
  //         machine_id: machineId,
  //         cyclelog_id: selectedCycle,
  //         signal: "spindle_1_load",
  //         anomalyType,
  //       });
  //       console.log("Fetched cycle data:", response);
  //       const mapped = Object.entries(response).map(([x, y]) => ({
  //         x: parseFloat(x),
  //         y,
  //       }));
  //       setActualSignal(mapped);
  //     } catch (err) {
  //       console.error("Error fetching timeseries cycle data", err);
  //     }
  //   };

  //   fetchActualSignal();
  // }, [selectedCycle, selectedAnomaly]);

  const handleSearch = () => {
    if (!fromTime || !toTime) {
      enqueueSnackbar("Please select both start and end times.", {
        variant: "error",
      });
      return;
    }
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

          <TextField
            label="Start Time"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            sx={{ minWidth: 250 }}
          />

          <TextField
            label="End Time"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            sx={{ minWidth: 250 }}
          />

          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="tool-label">Tools</InputLabel>
            <Select
              labelId="tool-label"
              value={selectedTool}
              label="Tools"
              onChange={(e) => setSelectedTool(e.target.value)}
            >
              {toolOptions.map((tool) => (
                <MenuItem key={tool.id} value={tool.id}>
                  {tool.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 3,
          mt: 2,
          borderRadius: 2,
          alignItems: "center",
        }}
      >
        {scatterData.scatterData?.length > 0 ? (
          <>
            <ScatterChart
              data={scatterData.scatterData}
              threshold={scatterData?.threshold}
              validationLimits={scatterData?.validationLimits}
              selectedTool={selectedTool}
              showComparison={showComparison}
              onPointClick={(cycleId, anomaly) => {
                console.log("clicked cycle id", cycleId, anomaly);
                setSelectedCycle(cycleId);
                setSelectedAnomaly(anomaly);
              }}
            />

            <ScatterLegend />
          </>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No data available for the selected filters.
          </Typography>
        )}
      </Paper>

      {/* Graph 2 */}
      <Paper sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        {selectedCycle && actualSignal && idealSignal && (
          <TimeSeriesGraph actualData={actualSignal} idealData={idealSignal} />
        )}
      </Paper>
    </Box>
  );
};

export default ScatterPage;
