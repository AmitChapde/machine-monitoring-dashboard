import { useState, useEffect, Suspense } from "react";
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
  useTheme,
  useMediaQuery,
  Grid,
  Stack,
} from "@mui/material";
import filterDataByTool from "../utils/filterDataByTool";
import {
  getChangeLogData,
  getPredictionData,
  getCycleData,
} from "../services/mockApi";
import TimeSeriesGraph from "../Components/TimeSeriesGraph/TimeSeriesGraph";
import ScatterLegend from "../Components/ScatterLegend/ScatterLegend";
import Loader from "../Components/Common/Loader";
import { useSnackbar } from "notistack";
import { lazy } from "react";

const ScatterChart = lazy(() =>
  import("../Components/ScatterPlot/ScatterChart")
);

const ScatterPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

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
  // const [showComparison, setShowComparison] = useState(false);
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
          toolId: Math.floor(Number.parseInt(toolId) / 100),
          count,
        }));
        setUnprocessedSequences(unprocessedArray);
      } catch (e) {
        console.error("ChangeLog fetch error", e);
      }
    };

    fetchData();
  }, [machineId, fromTime, toTime]);

  useEffect(() => {
    if (!selectedTool || !rawChangeLog) return;

    const ideal =
      rawChangeLog?.Result?.[0]?.learned_parameters?.[selectedTool]
        ?.average_list ?? [];
    setIdealSignal(ideal);
  }, [selectedTool, rawChangeLog]);

  useEffect(() => {
    const fetchActualSignal = async () => {
      if (!selectedCycle || selectedAnomaly == null) return;

      try {
        const anomalyType =
          selectedAnomaly === true
            ? "red"
            : selectedAnomaly === false
            ? "green"
            : "black";

        const response = await getCycleData({
          machine_id: machineId,
          cyclelog_id: selectedCycle,
          signal: "spindle_1_load",
          anomalyType,
        });

        const rawCycleData =
          response?.Result?.data?.[selectedCycle]?.cycle_data?.spindle_1_load ??
          {};

        const mapped = Object.entries(rawCycleData).map(([x, y]) => ({
          x: Number.parseFloat(x),
          y,
        }));

        if (!rawCycleData || Object.keys(rawCycleData).length === 0) {
          enqueueSnackbar(
            "No time series data available for the selected cycle.",
            {
              variant: "warning",
            }
          );
          return;
        }

        setActualSignal(mapped);
      } catch (err) {
        console.error("Error fetching timeseries cycle data", err);
        enqueueSnackbar(
          "No time series data available for the selected cycle.",
          {
            variant: "error",
          }
        );
      }
    };

    fetchActualSignal();
  }, [selectedCycle, selectedAnomaly]);

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

    setScatterData(filtered);
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        sx={{
          textAlign: { xs: "center", md: "left" },
          mb: { xs: 2, md: 3 },
        }}
      >
        Scatter Data
      </Typography>

      {/* Filters */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          mt: 2,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="machine-label">Machine</InputLabel>
              <Select
                labelId="machine-label"
                value={machineId}
                label="Machine"
                onChange={(e) => setMachineId(e.target.value)}
                size={isMobile ? "small" : "medium"}
              >
                <MenuItem value="SSP0173">SSP0173</MenuItem>
                <MenuItem value="SSP0167">SSP0167</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel id="tool-label">Tools</InputLabel>
              <Select
                labelId="tool-label"
                value={selectedTool}
                label="Tools"
                onChange={(e) => setSelectedTool(e.target.value)}
                size={isMobile ? "small" : "medium"}
              >
                {toolOptions.map((tool) => (
                  <MenuItem key={tool.id} value={tool.id}>
                    {tool.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              size={isMobile ? "small" : "medium"}
              sx={{
                backgroundColor: "#272e3f",
                color: "#fff",
                borderColor: "#512DA8",
                textTransform: "none",
                minHeight: { xs: 36, sm: 40, md: 56 },
              }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Unprocessed Sequences */}
      {unprocessedSequences && (
        <Paper
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            mt: 2,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            flexWrap="wrap"
            useFlexGap
          >
            <Typography
              variant="body1"
              sx={{
                mr: { sm: 1 },
                mb: { xs: 1, sm: 0 },
                fontSize: { xs: "0.875rem", md: "1rem" },
              }}
            >
              Unprocessed Sequences:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {unprocessedSequences.map((seq) => (
                <Chip
                  key={seq.toolId}
                  label={`${seq.toolId}: ${seq.count}`}
                  variant="filled"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    backgroundColor: "#673AB7",
                    color: "#fff",
                    borderColor: "#512DA8",
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", md: "0.875rem" },
                  }}
                />
              ))}
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Scatter Chart */}
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          p: { xs: 1, sm: 2, md: 3 },
          mt: 2,
          borderRadius: 2,
          alignItems: "center",
          overflow: "hidden",
          minHeight: { xs: 300, sm: 400, md: 500 },
        }}
      >
        {scatterData.scatterData?.length > 0 ? (
          <Suspense fallback={<Loader />}>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: { xs: 1, md: 2 },
              }}
            >
              <ScatterChart
                data={scatterData.scatterData}
                threshold={scatterData?.threshold}
                validationLimits={scatterData?.validationLimits}
                selectedTool={selectedTool}
                onPointClick={(cycleId, anomaly) => {
                  console.log("clicked cycle id", cycleId, anomaly);
                  setSelectedCycle(cycleId);
                  setSelectedAnomaly(anomaly);
                }}
              />

              <ScatterLegend />
            </Box>
          </Suspense>
        ) : (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{
              textAlign: "center",
              fontSize: { xs: "0.875rem", md: "1rem" },
              py: { xs: 2, md: 4 },
            }}
          >
            No data available for the selected filters.
          </Typography>
        )}
      </Paper>

      {/* Graph 2 */}
      <Paper
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          mt: 2,
          borderRadius: 2,
          overflow: "hidden",
          minHeight: { xs: 250, sm: 300, md: 400 },
        }}
      >
        {selectedCycle && actualSignal && idealSignal ? (
          <>
            <Box
              sx={{
                width: "100%",
                height: { xs: 250, sm: 300, md: 400 },
                overflow: "hidden",
              }}
            >
              <TimeSeriesGraph
                actualData={actualSignal}
                idealData={idealSignal}
              />
            </Box>
          </>
        ) : (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{
              textAlign: "center",
              fontSize: { xs: "0.875rem", md: "1rem" },
              py: { xs: 2, md: 4 },
            }}
          >
            No data available for the selected filters.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ScatterPage;
