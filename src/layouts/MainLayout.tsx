import React, { ReactNode, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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

const MainLayout: React.FC<MainLayoutProps> = ({ children, direction = "ltr" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const avatarData: SidebarAvatar = {
    name: user?.display_name ?? "User",
    imageUrl: user?.avatar_url ?? "",
    email: user?.email ?? "",
  };
  const [dir, setDir] = useState<"ltr" | "rtl">(direction);

  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "row" }}>
        <Sidebar
          items={[
            {
              icon: <HomeIcon />,
              title: "Home",
              onClick: () => navigate("/"),
            },
            {
              icon: <CategoryIcon />,
              title: "Categories",
              onClick: () => navigate("/categories"),
            },
            {
              icon: <DeleteOutlineIcon />,
              title: "Trash",
              onClick: () => navigate("/trash"),
            },
            {
              icon: <SettingsIcon />,
              title: "Settings",
              onClick: () => navigate("/profile"),
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
