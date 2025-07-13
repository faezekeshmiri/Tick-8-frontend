// Sidebar.tsx
import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Drawer
      variant="permanent"
      color="primary"
      anchor={theme.direction === "rtl" ? "right" : "left"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        // width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          height: "100%", // Important: only take parent height
          top: "auto", // Cancel fixed top positioning
          bottom: "auto", // Cancel fixed bottom positioning
          position: "relative", // Crucial: remove fixed behavior
          boxSizing: "border-box",
          borderRight: theme.direction === "ltr" ? "1px solid #ddd" : "none",
          borderLeft: theme.direction === "rtl" ? "1px solid #ddd" : "none",
          bgcolor: "primary.main",
        },
      }}
    >
      <List>
        {[HomeIcon, SettingsIcon, InfoIcon].map((Icon, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              disableRipple
              sx={{
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              <IconButton
                color="primary"
                size="large"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "white",
                  transition: "all 0.3s ease-in-out",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  "&:hover": {
                    transform: "scale(1.15)",
                    boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
                    bgcolor: "primary.light",
                  },
                }}>
                <Icon fontSize="inherit" />
              </IconButton>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
