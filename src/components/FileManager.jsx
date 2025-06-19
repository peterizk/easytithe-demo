// src/components/FileManager.jsx
import { useEffect, useState } from "react";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);

  /* fetch list on mount + after any change */
  async function refresh() {
    const r = await fetch("/api/pages-list");
    setFiles(await r.json());
  }
  useEffect(() => {
    refresh();
  }, []);

  /* upload handler */
  async function handleUpload() {
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append("file", uploadFile);
    await fetch("/api/upload", { method: "POST", body: fd });
    setUploadFile(null);
    await refresh();
  }

  /* delete handler */
  async function handleDelete(name) {
    if (!window.confirm(`Delete ${name}?`)) return;
    await fetch(`/api/delete/${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
    refresh();
  }

  return (
    <div className="app-wrapper">
      {/* Use your page-heading style for consistency */}
      <h2 className="page-heading">Manage Files</h2>

      {/* Upload section: top-block gives sensible padding */}
      <div className="top-block">
        <input
          type="file"
          onChange={(e) => setUploadFile(e.target.files[0])}
        />
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!uploadFile}
          style={{ marginLeft: "0.5rem" }}  /* small spacing */
        >
          Upload
        </button>
      </div>

      {/* File list table uses your camp-table + zebra styles */}
      <table className="camp-table zebra">
        <thead>
          <tr>
            <th>File</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <tr key={f}>
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
              <td colSpan="2" style={{ textAlign: "center", padding: "1rem 0" }}>
                No files uploaded.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
