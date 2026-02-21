import React, { ReactNode, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { SidebarAvatar } from "../types/Sidebar.types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface MainLayoutProps {
  children: ReactNode;
  direction?: "ltr" | "rtl";
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  direction = "ltr",
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const avatarData: SidebarAvatar = {
    name: user?.display_name ?? "User",
    imageUrl: user?.avatar_url ?? "",
    email: user?.email ?? "",
  };
  const [dir, setDir] = useState<"ltr" | "rtl">(direction);
  const HEADER_HEIGHT = 64;

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
            { icon: <SettingsIcon />, title: "Settings", onClick: () => navigate("/profile") },
            {
              icon: <InfoIcon />,
              title: "About",
              submenuItems: [
                { label: "Dashboard", onClick: () => console.log("Dashboard") },
                { label: "Reports", onClick: () => console.log("Reports") },
              ],
            },
            ...(user?.role === "admin"
              ? [{ icon: <AdminPanelSettingsIcon />, title: "Admin", onClick: () => navigate("/admin") }]
              : []),
          ]}
          avatar={avatarData}
        />
        <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
