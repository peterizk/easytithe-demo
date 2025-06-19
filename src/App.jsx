// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header         from './components/Header';
import FileManager    from './components/FileManager';
import PageDefinition from './components/PageDefinition';
import HomePage       from './components/HomePage';
import PageViewer from './components/PageViewer';
import AdminContent   from './components/AdminContent';
import usePageFiles   from './hooks/usePageFiles';

export default function App() {
  const pages = usePageFiles();

  return (
    <BrowserRouter>
      <Header pages={pages} />
      <Routes>
        <Route path="/admin/files"    element={<FileManager />} />
        <Route path="/admin/settings" element={<PageDefinition />} />
        <Route path="/admin/content"  element={<AdminContent />} />

        {/* Dynamic page routes (no /p prefix) */}
        <Route path="/:name" element={<PageViewer />} />

        <Route path="/"               element={<HomePage pages={pages} />} />
      </Routes>
    </BrowserRouter>
  );
}
