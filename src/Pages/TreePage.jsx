import { Typography, Paper, Box } from "@mui/material";

const TreePage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tree Visualizer
      </Typography>
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mt: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="body2">
          This page will show your hierarchical visualizations.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TreePage;
