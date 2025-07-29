import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
} from "@mui/material";

const Header: React.FC = () => {
  const theme = useTheme();
  const isRTL = theme.direction === "rtl";
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false); // Simulated login state
  const onLogout = () => {
    setIsLoggedIn(false);
  };

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
          {isLoggedIn ? (
            <Button
              color="inherit"
              className="text-white hover:bg-primary-light transition-colors"
              onClick={onLogout}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button
                color="inherit"
                className="text-white hover:bg-primary-light transition-colors"
                onClick={() => setIsLoggedIn((prev) => !prev)}
              >
                Login
              </Button>
              <Button
                variant="contained"
                className="text-primary-contrast hover:bg-primary-light transition-colors"
                onClick={() => setIsLoggedIn((prev) => !prev)}
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
