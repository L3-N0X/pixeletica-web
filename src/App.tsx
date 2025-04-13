import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Create from '@/pages/Create';
import Maps from '@/pages/Maps';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/maps" element={<Maps />} />
      </Routes>
    </Layout>
  );
}

export default App;
