import React, { ReactNode, useEffect, useState } from "react";
import { AppBar, Box, Button, Paper, Toolbar, Typography } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { SidebarAvatar } from "../types/Sidebar.types";

interface MainLayoutProps {
  children: ReactNode;
  direction?: "ltr" | "rtl";
}

const avatarData: SidebarAvatar = {
  name: "Jane Doe",
  // imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  imageUrl: "",
  email: "jane.doe@example.com",
};

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  direction = "ltr",
}) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [dir, setDir] = useState<"ltr" | "rtl">(direction);
  const HEADER_HEIGHT = 64;
  const FOOTER_HEIGHT = 48;

  // Material UI theme
  const theme = React.useMemo(
    () =>
      createTheme({
        direction: dir,
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode, dir]
  );

  // Apply direction to the <html> element
  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      {/* <AppBar position="static" sx={{ height: HEADER_HEIGHT }}>
        <Toolbar>
          <Typography variant="h6" component="div">
            My App
          </Typography>
        </Toolbar>
      </AppBar> */}
      <Header />
      {/* Main Content Area */}
      {/* Body with Sidebar + Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "row" }}>
        <Sidebar
          items={[
            {
              icon: <HomeIcon />,
              title: "Home",
              submenuItems: [
                { label: "Dashboard", onClick: () => console.log("Dashboard") },
                { label: "Reports", onClick: () => console.log("Reports") },
              ],
            },
            { icon: <SettingsIcon />, title: "Settings" },
            {
              icon: <InfoIcon />,
              title: "About",
              submenuItems: [
                { label: "Dashboard", onClick: () => console.log("Dashboard") },
                { label: "Reports", onClick: () => console.log("Reports") },
              ],
            },
          ]}
          avatar={avatarData}
        />
        <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
          {children}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          height: FOOTER_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
        }}
      >
        <Typography variant="body2">© 2025 Your App</Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;
