import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Box,
} from "@mui/material";
import {
  ScatterPlot as ScatterPlotIcon,
  AccountTree as TreeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;
const collapsedWidth = 64;

const SideBar = ({ open }) => {
  const navigate=useNavigate();

  const handleNavigation = () => {
    navigate('/');
  };

  const handleTreeNavigation=()=>{
    navigate('/tree');
  }

  const mainItems = [
    { text: "Scatter Data", icon: <ScatterPlotIcon /> ,onClick:()=>handleNavigation()},
    { text: "Tree Visualizer", icon: <TreeIcon />  ,onClick:()=>handleTreeNavigation()},
  ];


  const drawerContent = (
    <Box sx={{ overflow: "hidden" }}>
      <Box sx={{ height: 64 }} />
      <Box sx={{ px: open ? 2 : 1, py: 1 }}>
        <List sx={{ py: 0 }}>
          {mainItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
              onClick={item.onClick}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  borderRadius: 1,
                  mb: 0.5,
                  backgroundColor: item.active ? "#e3f2fd" : "transparent",
                  color: item.active ? "#1976d2" : "inherit",
                  "&:hover": {
                    backgroundColor: item.active ? "#bbdefb" : "#f5f5f5",
                  },    
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: "border-box",
          transition: "width 0.3s ease",
          backgroundColor: "#fafafa",
          borderRight: "1px solid #e0e0e0",
          overflowX: "hidden",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default SideBar;
