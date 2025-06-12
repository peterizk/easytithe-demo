import { useEffect, useState } from "react";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);

  /* fetch list on mount + after any change */
  async function refresh() {
    const r = await fetch("/api/pages-list");
    setFiles(await r.json());
  }
  useEffect(() => { refresh(); }, []);

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
    await fetch(`/api/delete/${encodeURIComponent(name)}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl mb-2">Manage Files</h2>

      {/* Upload section */}
      <div className="mb-4">
        <input type="file" onChange={e => setUploadFile(e.target.files[0])} />
        <button
          className="ml-2 px-3 py-1 bg-blue-700 text-white rounded"
          onClick={handleUpload}
          disabled={!uploadFile}
        >
          Upload
        </button>
      </div>

      {/* Existing files list */}
      <table className="border-collapse w-full">
        <thead>
          <tr><th className="border px-2">File</th><th className="border px-2"> </th></tr>
        </thead>
        <tbody>
          {files.map(f => (
            <tr key={f}>
              <td className="border px-2">{f}</td>
              <td className="border px-2 text-right">
                <button
                  className="px-2 py-0.5 bg-red-600 text-white rounded"
                  onClick={() => handleDelete(f)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {!files.length && (
            <tr><td colSpan="2" className="border px-2 py-4 text-center text-sm text-gray-500">
              No files uploaded.
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
