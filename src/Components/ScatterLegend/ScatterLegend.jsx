import { Box, Paper, Typography } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";

export default function ScatterLegend() {
  return (
    <Paper
      sx={{
        p: 1,
        mt: 0.5,
        borderRadius: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <Box display="flex" alignItems="center" gap={0.5}>
        <CircleIcon sx={{ color: "green", fontSize: 14 }} />
        <Typography variant="caption">Cycle Anomaly: False</Typography>
      </Box>

      <Box display="flex" alignItems="center" gap={0.5}>
        <CircleIcon sx={{ color: "red", fontSize: 14 }} />
        <Typography variant="caption">Cycle Anomaly: True</Typography>
      </Box>

      <Box display="flex" alignItems="center" gap={0.5}>
        <CircleIcon sx={{ color: "black", fontSize: 14 }} />
        <Typography variant="caption">Cycle Anomaly: Null</Typography>
      </Box>

      <Box display="flex" alignItems="center" gap={0.5}>
        <HorizontalRuleIcon
          sx={{ color: "red", fontSize: 14, borderBottom: "2px dashed red" }}
        />
        <Typography variant="caption">Threshold</Typography>
      </Box>
    </Paper>
  );
}
