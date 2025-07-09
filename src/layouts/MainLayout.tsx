import React, { ReactNode, useEffect, useState } from "react";
import { Box, CssBaseline, Paper } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import clsx from "clsx";

interface MainLayoutProps {
  children: ReactNode;
  direction?: "ltr" | "rtl";
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, direction = "ltr" }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [dir, setDir] = useState<"ltr" | "rtl">(direction);

  // Material UI theme
  const theme = React.useMemo(
    () =>
      createTheme({
        direction: dir,
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode, dir]
  );

  // Apply direction to the <html> element
  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);

  return (
    <Box
      className={clsx(
        "min-h-screen flex flex-col",
        dir === "rtl" ? "text-right" : "text-left"
      )}
    >
      {/* Header */}
      <header className="w-full p-4 bg-blue-600 text-white text-xl shadow-md">
        <Paper>
          <h1>Theme test</h1>
        </Paper>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {children}
      </main>

      {/* Footer (optional) */}
      <footer className="w-full p-4 bg-gray-200 text-center">
        &copy; 2025 Tick-8
      </footer>
    </Box>
  );
};

export default MainLayout;
