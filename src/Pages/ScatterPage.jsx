import { Typography, Paper, Box } from "@mui/material";

const ScatterPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Scatter Plot
      </Typography>
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mt: 2,
          borderRadius: 2,
        }}
      >
        <Box sx={{ mt: 2 }}>
          <ul style={{ marginTop: "16px" }}>
            <li>Scatter Plot - For correlation analysis</li>
            <li>Tree Visualizer - For hierarchical data representation</li>
          </ul>
        </Box>
      </Paper>
    </Box>
  );
};

export default ScatterPage;
