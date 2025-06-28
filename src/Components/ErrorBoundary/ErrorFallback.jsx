import { Box, Typography, Button, Paper } from "@mui/material";

const ErrorFallback = ({ error, resetError }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      p={2}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600 }}>
        <Typography variant="h4" color="error" gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {error?.message || error.toString()}
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={resetError}
          sx={{ mt: 2 }}
        >
          Try again
        </Button>
      </Paper>
    </Box>
  );
};

export default ErrorFallback;
