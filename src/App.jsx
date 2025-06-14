// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header         from './components/Header';
import FileManager    from './components/FileManager';
import PageDefinition from './components/PageDefinition';
import HomePage       from './components/HomePage';
import AdminContent   from './components/AdminContent';
import SettingsCog    from './components/SettingsCog';
import usePageFiles   from './hooks/usePageFiles';

export default function App() {
  const pages = usePageFiles();

  return (
    <BrowserRouter>
      <Header pages={pages} />
      <SettingsCog />
      <Routes>
        <Route path="/admin/files"    element={<FileManager />} />
        <Route path="/admin/settings" element={<PageDefinition />} />
        <Route path="/admin/content"  element={<AdminContent />} />
        <Route path="/"               element={<HomePage pages={pages} />} />
      </Routes>
    </BrowserRouter>
  );
}
