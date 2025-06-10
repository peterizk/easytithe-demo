// src/hooks/usePageFiles.js
import { useState, useEffect } from 'react';

export default function usePageFiles() {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    fetch(`/api/pages-list?_=${Date.now()}`)   // cache‑buster
      .then((r) => r.json())
      .then(setPages)
      .catch(() => setPages([]));
  }, []);

  return pages;
}
