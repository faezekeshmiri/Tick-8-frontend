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
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button
                size="large"
                color="inherit"
                // className="text-white hover:primary.light transition-colors"
                onClick={() => setIsLoggedIn((prev) => !prev)}
              >
                Login
              </Button>
              <Button
                variant="contained"
                size="large"
                color="inherit"
                // sx={{
                //   bgcolor: "primary.main",
                //   color: "white",
                //   transition: "all 0.3s ease-in-out",
                //   boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                //   "&:hover": {
                //     transform: "scale(1.05)",
                //     boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
                //     bgcolor: "primary.light",
                //   },
                // }}
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
