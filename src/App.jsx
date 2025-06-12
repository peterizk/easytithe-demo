import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Header         from './components/Header';
import FileManager    from './components/FileManager';
import PageDefinition from './components/PageDefinition';
import HomePage       from './components/HomePage';
import AdminContent   from './components/AdminContent';
import SettingsCog    from './components/SettingsCog';
import usePageFiles from "./hooks/usePageFiles"; 

 export default function App() {
  const pages = usePageFiles();
   return (
     <BrowserRouter>
      <Header />
      <SettingsCog />
       <nav className="site-nav">
        <a href="/" className="mr-4">Home</a>
          {pages.map(name => (
          <a key={name} href={`/p/${name}`} className="ml-4">
          {name
          .replace(/\.[^.]+$/, "")   // drop extension
          .replace(/[-_]/g, " ")     // dashes/underscores → spaces
          .replace(/\b\w/g, c => c.toUpperCase())}  {/* title-case */}
          </a>
        ))}
        <a href="/admin/content" className="ml-4">Admin Login</a>
        </nav>

       <Routes>
         <Route path="/admin/files"    element={<FileManager />} />
         <Route path="/admin/settings" element={<PageDefinition />} />
         <Route path="/admin/content"  element={<AdminContent />} />
         <Route path="/"               element={<HomePage />} />
       </Routes>
     </BrowserRouter>
   );
 }