"use client"
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material"
import { Menu as MenuIcon } from "@mui/icons-material"

const Header = ({ onMenuClick}) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#272e3f",
        color: "#ffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
    >
      <Toolbar>
        <IconButton color="inherit" aria-label="open drawer" onClick={onMenuClick} edge="start" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1,gap:"0.2rem"}}>
         
          <Typography variant="h6" noWrap component="div">
            Scatter Data
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header;
