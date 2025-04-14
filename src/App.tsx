import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Create from '@/pages/Create';
import Maps from '@/pages/Maps';
import Results from '@/pages/Results';
import MapViewer from '@/pages/MapViewer';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/results/:taskId" element={<Results />} />
        <Route path="/mapviewer/:taskId" element={<MapViewer />} />
      </Routes>
    </Layout>
  );
}

export default App;
