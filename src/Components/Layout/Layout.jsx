import { Outlet } from "react-router-dom";
import SideBar from "../SideBar/SideBar.jsx";
import { Box } from "@mui/material";
import Header from '../Header/Header.jsx'


const Layout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Header />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
