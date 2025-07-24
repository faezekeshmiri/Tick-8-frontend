// Sidebar.tsx
import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  useTheme,
} from "@mui/material";

import { SidebarItem, SubmenuItem } from "../../types/Sidebar.types";
import SidebarSubmenu from "./SidebarSubmenu";

type SidebarProps = {
  items: SidebarItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const theme = useTheme();
  // const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [submenuItems, setSubmenuItems] = useState<SubmenuItem[]>([]);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [submenuTitle, setSubmenuTitle] = useState("");
  const drawerWidth = {
    xs: 76,  // extra small (mobile)
    sm: 80,  // small (tablets)
    md: 72,  // medium (desktops)
  };

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLElement>,
    items: SubmenuItem[],
    title: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSubmenuItems(items);
    setSubmenuTitle(title);
    setSubmenuOpen(true);
  };

  const handleClose = () => {
    setTimeout(() => {
      // Delay closing to allow submenu to render
      setSubmenuOpen(false);
      setAnchorEl(null);
    }
    , 300);
   
  };
  // Todo: fix closing submenu when moving out of the sidebar item but not the sidebar itself
  return (
    <>
      <Drawer
        variant="permanent"
        color="primary"
        anchor={theme.direction === "rtl" ? "right" : "left"}
        sx={{
          // width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            // width: drawerWidth,
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
          {items.map((item, index) => (
            <ListItem key={index} disablePadding>
                <ListItemButton
                  disableRipple
                  sx={{
                    paddingY: 0.5,
                    marginY: 1,
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                  onMouseEnter={(e) =>
                    handleMouseEnter(e, item.submenuItems || [], item.title)
                  }
                  onClick={(e) =>
                    handleMouseEnter(e, item.submenuItems || [], item.title)
                  }
                >
                  <IconButton
                    color="primary"
                    size="large"
                    sx={{
                      width: { xs: 44, sm: 46, md: 48 },
                      height: { xs: 44, sm: 46, md: 48 },
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
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <SidebarSubmenu
        anchorEl={anchorEl}
        open={submenuOpen}
        items={submenuItems}
        title={submenuTitle}
        onClose={handleClose}
      />
    </>
  );
};

export default Sidebar;
