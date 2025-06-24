import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import SideBar from "../SideBar/SideBar";

function Header({title}) {
  return (
    <AppBar position="fixed" sx={{color:'#272e3f'}}>
      <Toolbar>
        <SideBar />
        <Typography variant="h6" noWrap component="div" >
          Machine Monitoring Dashboard
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        
      </Toolbar>
    </AppBar>
  );
}

export default Header;
