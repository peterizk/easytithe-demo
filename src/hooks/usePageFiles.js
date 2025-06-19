// src/hooks/usePageFiles.js
import { useState, useEffect } from "react";

export default function usePageFiles() {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    async function load() {
      let selected = [];
      try {
        const resp = await fetch("/api/blob/selected-pages.json");
        if (resp.ok) {
          const data = await resp.json();
          selected = Array.isArray(data) ? data : [];
        }
      } catch (e) {
        console.warn("No selection manifest:", e);
      }

      const resp2 = await fetch("/api/pages-list");
      const files = await resp2.json();

      setPages(files.filter((name) => selected.includes(name)));
    }
    load();
  }, []);

  return pages;
}