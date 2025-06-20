// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
const AdminContent = lazy(() => import('./components/AdminContent'));
const FileManager  = lazy(() => import('./components/FileManager'));
import Header         from './components/Header';
import PageDefinition from './components/PageDefinition';
import HomePage       from './components/HomePage';
import PageViewer from './components/PageViewer';
import usePageFiles   from './hooks/usePageFiles';

export default function App() {
  const pages = usePageFiles();

  return (
    <BrowserRouter>
      <Header pages={pages} />
      <Routes>
        <Route path="/admin/files"    element={
      <Suspense fallback={<p className="top-block">Loading editor…</p>}>
        <FileManager />
      </Suspense>
    } />
        <Route path="/admin/settings" element={<PageDefinition />} />
        <Route path="/admin/content"  element={
      <Suspense fallback={<p className="top-block">Loading editor…</p>}>
        <AdminContent />
      </Suspense>
    } />

        {/* Dynamic page routes (no /p prefix) */}
        <Route path="/:name" element={<PageViewer />} />

        <Route path="/"               element={<HomePage pages={pages} />} />
      </Routes>
    </BrowserRouter>
  );
}
