import { Typography, Paper, Box } from "@mui/material";
import TreeVisualization from "../Components/TreeVisualizationComponent/TreeVisualization";

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
        <Box sx={{ height: "70vh", mt: 2 }}>
          <TreeVisualization />
        </Box>
      </Paper>
    </Box>
  );
};

export default TreePage;
