// Sidebar.tsx
import React, { useState, useContext } from "react";
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
import { useNavigate } from "react-router-dom";

import {
  SidebarItem,
  SubmenuItem,
  SidebarAvatar,
} from "../../types/Sidebar.types";
import SidebarSubmenu from "./SidebarSubmenu";
import { ThemeModeContext } from "../../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../../assets/theme";

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
  variant?: "permanent" | "temporary";
  open?: boolean;
  onClose?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ items, avatar, variant = "permanent", open, onClose }) => {
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeModeContext);
  const palette = (isDarkMode ? darkTheme : lightTheme).palette;
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [submenuItems, setSubmenuItems] = useState<SubmenuItem[]>([]);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [submenuTitle, setSubmenuTitle] = useState("");

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
  const drawerPaperShadow =
    theme.direction === "ltr"
      ? "8px 0 24px -4px rgba(0, 0, 0, 0.15), 4px 0 12px -2px rgba(0, 0, 0, 0.1)"
      : "-8px 0 24px -4px rgba(0, 0, 0, 0.15), -4px 0 12px -2px rgba(0, 0, 0, 0.1)";

  const drawerSx =
    variant === "permanent"
      ? {
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            height: "100%",
            top: "auto",
            bottom: "auto",
            position: "relative",
            boxSizing: "border-box",
            borderInlineEnd: `1px solid ${theme.palette.divider}`,
            backgroundColor: palette.primary.main,
            boxShadow: drawerPaperShadow,
          },
        }
      : {
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            backgroundColor: palette.primary.main,
            boxShadow: "8px 0 32px -4px rgba(0, 0, 0, 0.2), 4px 0 12px -2px rgba(0, 0, 0, 0.12)",
          },
        };

  return (
    <>
      <Drawer
        variant={variant}
        open={variant === "temporary" ? open : true}
        onClose={onClose}
        anchor={theme.direction === "rtl" ? "right" : "left"}
        sx={drawerSx}
        slotProps={{
          paper: {
            sx: { backgroundColor: palette.primary.main },
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
                onMouseEnter={(e) => {
                  if (item.submenuItems && item.submenuItems.length > 0) {
                    handleMouseEnter(e, item.submenuItems, item.title);
                  }
                }}
                onClick={(e) => {
                  if (item.onClick) {
                    item.onClick();
                    onClose?.();
                    return;
                  }
                  if (item.submenuItems && item.submenuItems.length > 0) {
                    handleMouseEnter(e, item.submenuItems, item.title);
                  }
                }}
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
              cursor: "pointer",
            }}
            onMouseEnter={(e) => handleMouseEnter(e, [], "User Profile")}
          >
            <Avatar
              alt={avatar.name}
              src={avatar.imageUrl || undefined}
              sx={{
                width: { xs: 48, sm: 50, md: 52 },
                height: { xs: 48, sm: 50, md: 52 },
                minWidth: 44,
                minHeight: 44,
                backgroundColor: avatar.imageUrl
                  ? palette.primary.light
                  : stringToColor(avatar.name),
                color: avatar.imageUrl ? "inherit" : palette.primary.contrastText,
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.15)",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
                  backgroundColor: avatar.imageUrl
                    ? palette.primary.main
                    : stringToColor(avatar.name),
                  color: avatar.imageUrl ? "inherit" : palette.primary.contrastText,
                },
                fontSize: 32,
              }}
              onClick={() => {
                navigate("/profile");
                onClose?.();
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
