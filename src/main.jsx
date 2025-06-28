import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary.jsx";
import ErrorFallback from "./Components/ErrorBoundary/ErrorFallback.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SnackbarProvider maxSnack={3}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SnackbarProvider>
    </ErrorBoundary>
  </StrictMode>
);
