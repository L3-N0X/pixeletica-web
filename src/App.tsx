import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import StatusPage from './pages/StatusPage';
import MapViewerPage from './pages/MapViewerPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <ChakraProvider theme={system}>
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
    </ChakraProvider>
  );
};

export default App;
