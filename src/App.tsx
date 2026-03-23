import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { Header } from "./components/Header";
import { CircleCanvas } from "./components/CircleCanvas";
import { WallpaperGallery } from "./components/WallpaperGallery";

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
});

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('generator');

  const renderContent = () => {
    switch (currentTab) {
      case 'gallery':
        return <WallpaperGallery sortBy="recent" />;
      case 'trending':
        return <WallpaperGallery sortBy="trending" />;
      case 'popular':
        return <WallpaperGallery sortBy="popular" />;
      default:
        return <CircleCanvas />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CssBaseline />
        <div className="App">
          <Header currentTab={currentTab} onTabChange={setCurrentTab} />
          {renderContent()}
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
