// src/components/FileManager.jsx
import { useEffect, useState } from "react";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);

  // fetch list and current selection
  async function refresh() {
    const [listResp, selResp] = await Promise.all([
      fetch("/api/pages-list"),
      fetch("/api/blob/selected-pages.json"),
    ]);

    const files = await listResp.json();

    let sel = [];
    if (selResp.ok) {
      try {
        const data = await selResp.json();
        sel = Array.isArray(data) ? data : [];
      } catch {
        sel = [];
      }
    }

    setFiles(files);
    setSelected(sel);
  }

  useEffect(() => {
    refresh();
  }, []);

  // upload handler
  async function handleUpload() {
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append("file", uploadFile);
    await fetch("/api/upload", { method: "POST", body: fd });
    setUploadFile(null);
    await refresh();
  }

  // toggle inclusion in nav
  function toggleSelect(name) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  // save nav manifest
  async function saveSelection() {
    await fetch("/api/blob/selected-pages.json", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });
    alert("Navigation updated");
  }

  // delete handler
  async function handleDelete(name) {
    if (!window.confirm(`Delete ${name}?`)) return;
    await fetch(`/api/delete/${encodeURIComponent(name)}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="app-wrapper">
      <h2 className="page-heading">Manage Files</h2>
      <div className="top-block">
        <input
          type="file"
          onChange={(e) => setUploadFile(e.target.files[0])}
        />
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!uploadFile}
        >
          Upload
        </button>
      </div>

      <table className="camp-table zebra">
        <thead>
          <tr>
            <th>Show?</th>
            <th>File</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <tr key={f}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(f)}
                  onChange={() => toggleSelect(f)}
                />
              </td>
              <td>{f}</td>
              <td style={{ textAlign: "right" }}>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(f)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {!files.length && (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "1rem 0" }}>
                No files uploaded.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "1rem" }}>
        <button className="btn btn-primary" onClick={saveSelection}>
          Save Navigation
        </button>
      </div>
    </div>
  );
}
