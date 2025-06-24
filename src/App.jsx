import { Route, Router, Routes } from "react-router-dom";
import "./App.css";
import ScatterPage from "./Pages/ScatterPage";
import TreePage from "./Pages/TreePage";

function App() {
  return <>
    <Routes>
      <Route path="/" element={<ScatterPage/>}/>
      <Route path="/tree" element={<TreePage/>}/>
    </Routes>
  </>;
}

export default App;
