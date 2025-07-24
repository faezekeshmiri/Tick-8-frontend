// SidebarSubmenu.tsx
import React from "react";
import {
  Popper,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ClickAwayListener,
  Fade,
  useTheme,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import { SubmenuItem } from "../../types/Sidebar.types";

type SidebarSubmenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  title: string;
  items: SubmenuItem[];
  onClose: () => void;
};

const SidebarSubmenu: React.FC<SidebarSubmenuProps> = ({
  anchorEl,
  open,
  title,
  items,
  onClose,
}) => {
  const theme = useTheme();
  const offsetX = theme.direction === "rtl" ? 5 : -5;
  const offsetY = anchorEl?.offsetHeight ? anchorEl.offsetHeight / 2 : 0;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      // onMouseEnter={() => {
      //   // Prevent closing when hovering over the submenu
      //   if (anchorEl) {
      //     anchorEl.onmouseleave = null;
      //   }
      // }}
      placement="right-start"
      transition
      disablePortal
      modifiers={[
        {
          name: "offset",
          options: {
            offset: [offsetY, offsetX],
          },
        },
      ]}
      sx={{
        zIndex: (theme) => theme.zIndex.tooltip + 1,
        minWidth: 140,
        maxWidth: { xs: 180, sm: 220 },
        p: 0.5,
      }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper elevation={4} onMouseLeave={onClose}>
            <ClickAwayListener onClickAway={onClose}>
              <Box>
                {title && (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        px: 2,
                        py: 1,
                        fontWeight: "bold",
                        color: "text.secondary",
                      }}
                    >
                      {title}
                    </Typography>
                    {items.length > 0 && <Divider />}
                  </>
                )}
                {items.length > 0 && <List>
                  {items.map((item, i) => (
                    <ListItem key={i} disablePadding>
                      <ListItemButton onClick={item.onClick}>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List> }
              </Box>
            </ClickAwayListener>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default SidebarSubmenu;
