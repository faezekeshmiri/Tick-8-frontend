import React, { ReactNode, useEffect, useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { SidebarAvatar, SidebarItem } from "../types/Sidebar.types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface MainLayoutProps {
  children: ReactNode;
  direction?: "ltr" | "rtl";
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, direction = "ltr" }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const avatarData: SidebarAvatar = {
    name: user?.display_name ?? "User",
    imageUrl: user?.avatar_url ?? "",
    email: user?.email ?? "",
  };

  const baseItems: SidebarItem[] = [
    { icon: <HomeIcon />, title: "Home", onClick: () => navigate("/") },
    { icon: <CategoryIcon />, title: "Categories", onClick: () => navigate("/categories") },
    { icon: <DeleteOutlineIcon />, title: "Trash", onClick: () => navigate("/trash") },
    { icon: <SettingsIcon />, title: "Settings", onClick: () => navigate("/settings") },
    ...(user?.role === "admin"
      ? [{ icon: <AdminPanelSettingsIcon />, title: "Admin", onClick: () => navigate("/admin") } as SidebarItem]
      : []),
  ];
  const items = isMobile
    ? baseItems.map((item) => ({
        ...item,
        onClick: () => {
          item.onClick?.();
          setMobileDrawerOpen(false);
        },
      }))
    : baseItems;

  const [dir, setDir] = useState<"ltr" | "rtl">(direction);

  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Header onMenuClick={isMobile ? () => setMobileDrawerOpen(true) : undefined} />
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "row", overflow: "hidden" }}>
        <Sidebar
          items={items}
          avatar={avatarData}
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileDrawerOpen : undefined}
          onClose={isMobile ? () => setMobileDrawerOpen(false) : undefined}
        />
        <Box component="main" sx={{ flexGrow: 1, minHeight: 0, minWidth: 0, p: 2, overflow: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
