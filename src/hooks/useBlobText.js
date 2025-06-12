import { useState, useEffect } from "react";

export default function useBlobText(blobName) {
  const [text, setText] = useState("");
  const [loading, setL] = useState(true);
  const [error, setErr] = useState(null);

  useEffect(() => {
    fetch(`/api/blob/${blobName}`)
      .then(r => r.ok ? r.text() : Promise.reject(r.status))
      .then(t => { setText(t); setL(false); })
      .catch(e => { setErr(e); setL(false); });
  }, [blobName]);

  async function save(next) {
    const r = await fetch(`/api/blob/${blobName}`, {
      method: "PUT",
      headers: { "Content-Type": "text/markdown" },
      body: next
    });
    if (!r.ok) throw new Error(`Save failed ${r.status}`);
    setText(next);
  }

  return { text, loading, error, save };
}
