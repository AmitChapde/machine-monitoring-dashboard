import { Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout/Layout";
import ScatterPage from "./Pages/ScatterPage";
import TreePage from "./Pages/TreePage";

function App() {
  return (
    // The main App component sets up the routing for the application.
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ScatterPage />} />
        <Route path="/tree" element={<TreePage />} />
      </Route>
    </Routes>
  );
}

export default App;
