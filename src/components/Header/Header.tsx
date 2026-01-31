import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import HeaderMenu from "./HeaderMenu";
import { useAuth } from "../../contexts/AuthContext";

const Header: React.FC = () => {
  const theme = useTheme();
  const isRTL = theme.direction === "rtl";
  const { isAuthenticated, logout } = useAuth();

  return (
    <AppBar
      position="static"
      className="shadow-md"
      color="primary"
      enableColorOnDark
    >
      <Toolbar
        className={`flex justify-between items-center ${
          isRTL ? "flex-row-reverse" : "flex-row"
        }`}
        sx={{
          height: "72px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        {/* Logo */}
        <Box>
          <Typography variant="h5" component="div">
            LOGO
          </Typography>
        </Box>

        {/* Buttons */}
        <Box className="flex gap-2">
          {isAuthenticated ? (
            <HeaderMenu onLogout={logout} />
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                color="inherit"
                className="text-white hover:bg-primary-light dark:hover:bg-primary-light-dark transition-colors"
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                className="text-primary-contrast hover:bg-primary-light dark:hover:bg-primary-light-dark transition-colors"
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
