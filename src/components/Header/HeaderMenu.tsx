import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IconButton, ListItemIcon, ListItemText } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import { ThemeModeContext } from "../../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../../assets/theme";

type HeaderMenuProps = {
  onLogout: () => void;
};

export default function HeaderMenu({ onLogout }: HeaderMenuProps) {
  const { isDarkMode, toggleTheme } = React.useContext(ThemeModeContext);
  const palette = (isDarkMode ? darkTheme : lightTheme).palette;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  const handleDarkMode = () => {
    handleClose();
    toggleTheme();
  };

  return (
    <div>
      <IconButton
        id="menu-button"
        aria-controls={open ? "menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        color="primary"
        size="large"
        sx={{
          width: { xs: 44, sm: 46, md: 48 },
          height: { xs: 44, sm: 46, md: 48 },
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "white",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            bgcolor: "primary.light",
          },
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "menu-button",
          },
        }}
      >
        <MenuItem onClick={handleDarkMode}>
          <ListItemIcon>
            {isDarkMode ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
}
