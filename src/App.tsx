import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, defaultTheme } from 'evergreen-ui';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import StatusPage from './pages/StatusPage';
import MapViewerPage from './pages/MapViewerPage';
import NotFoundPage from './pages/NotFoundPage';

// Custom dark theme based on Evergreen UI
const darkTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: {
      ...defaultTheme.colors.background,
      tint1: '#1E1E1E',
      tint2: '#2D2D2D',
      overlay: 'rgba(0, 0, 0, 0.7)',
      yellowTint: '#4A3F2C',
      blueTint: '#252F3F',
      greenTint: '#243B35',
      orangeTint: '#42311F',
      redTint: '#3E292B',
      purpleTint: '#382C3F',
      tealTint: '#203A3E',
    },
    text: {
      ...defaultTheme.colors.text,
      default: '#E6E6E6',
      dark: '#CCCCCC',
      muted: '#999999',
    },
    intent: {
      ...defaultTheme.colors.intent,
      none: '#4B9E91', // Dark teal-greenish accent
    },
  },
  fontFamilies: {
    ...defaultTheme.fontFamilies,
    display: '"Merriweather", serif',
    ui: '"Source Serif Pro", serif',
  },
};

const App: React.FC = () => {
  return (
    <ThemeProvider value={darkTheme}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="create" element={<CreatePage />} />
            <Route path="status/:taskId" element={<StatusPage />} />
            <Route path="map/:mapId" element={<MapViewerPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
