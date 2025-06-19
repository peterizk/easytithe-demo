// src/components/FileManager.jsx
import { useEffect, useState } from "react";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);

  async function loadFiles() {
    const resp = await fetch("/api/pages-list");
    setFiles(await resp.json());
  }
  async function loadSelection() {
    const resp = await fetch("/api/blob/selected-pages.json");
    if (resp.ok) {
      try {
        const data = await resp.json();
        setSelected(Array.isArray(data) ? data : []);
      } catch {
        setSelected([]);
      }
    }
  }

  useEffect(() => {
    loadFiles();
    loadSelection();
  }, []);

  async function handleUpload() {
    if (!uploadFile) return;
    const fd = new FormData(); fd.append("file", uploadFile);
    await fetch("/api/upload", { method: "POST", body: fd });
    setUploadFile(null);
    await loadFiles();
  }

  function toggleSelect(name) {
    setSelected(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.includes(name)
        ? list.filter(n => n !== name)
        : [...list, name];
    });
  }

  async function saveSelection() {
    await fetch("/api/blob/selected-pages.json", {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Array.isArray(selected) ? selected : []),
    });
    alert("Navigation updated");
  }

  async function handleDelete(name) {
    if (!window.confirm(`Delete ${name}?`)) return;
    await fetch(`/api/delete/${encodeURIComponent(name)}`, { method: "DELETE" });
    await loadFiles();
    setSelected(prev => (Array.isArray(prev) ? prev : []).filter(n => n !== name));
  }

  return (
    <div className="app-wrapper">
      <h2 className="page-heading">Manage Files</h2>
      <div className="top-block mb-4">
        <input type="file" onChange={e => setUploadFile(e.target.files[0])} />
        <button className="btn btn-primary ml-2" onClick={handleUpload} disabled={!uploadFile}>
          Upload
        </button>
      </div>

      <table className="camp-table zebra w-full border-collapse">
        <thead><tr><th>Show?</th><th>File</th><th></th></tr></thead>
        <tbody>
          {files.map(f => (
            <tr key={f}>
              <td className="border px-2 text-center">
                <input type="checkbox" checked={selected.includes(f)} onChange={() => toggleSelect(f)} />
              </td>
              <td className="border px-2">{f}</td>
              <td className="border px-2 text-right">
                <button className="btn btn-danger" onClick={() => handleDelete(f)}>Delete</button>
              </td>
            </tr>
          ))}
          {!files.length && (
            <tr><td colSpan="3" className="border px-2 py-4 text-center">No files uploaded.</td></tr>
          )}
        </tbody>
      </table>
      <div className="mt-4">
        <button className="btn btn-primary" onClick={saveSelection}>Save Navigation</button>
      </div>
    </div>
  );
}