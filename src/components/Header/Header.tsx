import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import HeaderMenu from "./HeaderMenu";
import { useAuth } from "../../contexts/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const handleLogout = () => {
    logout().catch(console.error);
  };

  return (
    <AppBar
      position="static"
      color="primary"
      enableColorOnDark
      sx={{
        boxShadow:
          "0 8px 16px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64, md: 72 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onMenuClick && (
            <IconButton
              color="inherit"
              aria-label={t('nav.openMenu')}
              onClick={onMenuClick}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h5" component="div">
            {t('nav.logo')}
          </Typography>
        </Box>

        <Box className="flex gap-2">
          {isAuthenticated ? (
            <HeaderMenu onLogout={handleLogout} />
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                color="inherit"
                className="text-white hover:bg-primary-light dark:hover:bg-primary-light-dark transition-colors"
              >
                {t('nav.login')}
              </Button>
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                className="text-primary-contrast hover:bg-primary-light dark:hover:bg-primary-light-dark transition-colors"
              >
                {t('nav.signUp')}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
