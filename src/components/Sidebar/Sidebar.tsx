// Sidebar.tsx
import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  useTheme,
  Avatar,
  Box,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import {
  SidebarItem,
  SubmenuItem,
  SidebarAvatar,
} from "../../types/Sidebar.types";
import SidebarSubmenu from "./SidebarSubmenu";

// Utility to generate a color from a string
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`;
  return color;
}

type SidebarProps = {
  items: SidebarItem[];
  avatar?: SidebarAvatar;
};

const Sidebar: React.FC<SidebarProps> = ({ items, avatar }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [submenuItems, setSubmenuItems] = useState<SubmenuItem[]>([]);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [submenuTitle, setSubmenuTitle] = useState("");
  const drawerWidth = {
    xs: 76, // extra small (mobile)
    sm: 80, // small (tablets)
    md: 72, // medium (desktops)
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
    }, 300);
  };
  // Todo: fix closing submenu when moving out of the sidebar item but not the sidebar itself
  // Todo: Replace sx in-line styles with Tailwind classes or styled components or makeStyles for better maintainability
  return (
    <>
      <Drawer
        variant="permanent"
        color="primary"
        anchor={theme.direction === "rtl" ? "right" : "left"}
        sx={{
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
          {items.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                disableRipple
                sx={{
                  paddingY: 0.5,
                  // paddingX: 2,
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
                    width: { xs: 48, sm: 50, md: 52 },
                    height: { xs: 48, sm: 50, md: 52 },
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
        {/* Avatar at the bottom */}
        {avatar && (
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              left: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              paddingY: 0.5,
              marginY: 1,
            }}
            onMouseEnter={(e) => handleMouseEnter(e, [], "User Profile")}
            onClick={(e) => handleMouseEnter(e, [], "User Profile")}
          >
            <Avatar
              alt={avatar.name}
              src={avatar.imageUrl || undefined}
              sx={{
                width: { xs: 48, sm: 50, md: 52 },
                height: { xs: 48, sm: 50, md: 52 },
                bgcolor: avatar.imageUrl
                  ? "primary.light"
                  : stringToColor(avatar.name),
                color: avatar.imageUrl ? "inherit" : "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.15)",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
                  bgcolor: avatar.imageUrl
                    ? "primary.main"
                    : stringToColor(avatar.name),
                },
                fontSize: 32,
              }}
            >
              {!avatar.imageUrl ? <AccountCircleIcon fontSize="large" /> : null}
            </Avatar>
          </Box>
        )}
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
