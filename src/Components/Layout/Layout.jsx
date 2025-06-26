import { useState } from "react"
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material"
import Header from '../Header/Header';
import SideBar from "../SideBar/SideBar";
import { Outlet } from "react-router-dom";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const theme = createTheme({
    palette: {
      mode: "light",
      background: {
        default: "#f5f5f5",
        paper: "#ffffff",
        transition:"margin 0.5s ease-in-out"
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#ffffff",
            color: "#000000",
          },
        },
      },
    },
  })

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <Header onMenuClick={handleMenuClick} />
        <SideBar open={sidebarOpen} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8, 
            ml: sidebarOpen ? 0 : 0, 
            transition: "margin 0.3s ease",
          }}
        >
          <Outlet/>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default Layout;
