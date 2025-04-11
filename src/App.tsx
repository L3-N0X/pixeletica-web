import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '@pages/HomePage';
import MapViewerPage from '@pages/MapViewerPage';
import ImageUploadPage from '@pages/ImageUploadPage';
import ResultsPage from '@pages/ResultsPage';
import NotFoundPage from '@pages/NotFoundPage';
import MainLayout from '@components/layouts/MainLayout';

const App: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map/:mapName" element={<MapViewerPage />} />
        <Route path="/upload" element={<ImageUploadPage />} />
        <Route path="/results/:taskId" element={<ResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
