import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import MapPage from "./pages/MapPage";

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <MapPage />
  </ThemeProvider>
);

export default App;
