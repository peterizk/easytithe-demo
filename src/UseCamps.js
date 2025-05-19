/* UseCamps.js   – now fetches Google‑Sheets JSON instead of CSV   */
import { useEffect, useState } from "react";
import fetch from "cross-fetch";

const SHEET_ID   = import.meta.env.VITE_GOOGLE_SHEET_ID;
const SHEET_NAME = import.meta.env.VITE_GOOGLE_SHEET_NAME;
const API_KEY    = import.meta.env.VITE_GOOGLE_API_KEY;

const RANGE = `${encodeURIComponent(SHEET_NAME)}!A1:Z1000`;
const URL   = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

export function useSheet() {
  const [columns, setColumns] = useState([]);
  const [rows,    setRows]    = useState([]);

  useEffect(() => {
    fetch(URL, { cache: "no-store" })
      .then((r) => r.json())
      .then(({ values }) => {
        if (!values || values.length === 0) return;
        const [header, ...body] = values;

        const objects = body.map((line) =>
          header.reduce((obj, h, i) => ({ ...obj, [h]: line[i] || "" }), {})
        );

        setColumns(header);
        setRows(objects);
      })
      .catch(console.error);
  }, []);

  return { columns, rows };
}
