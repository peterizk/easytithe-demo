/* src/services/sheets.js
   Fetch rows from a Google Sheet and
   return them as an array of objects. */

// ❶ For Node ≤17 add cross‑fetch; for Node 18+ built‑in fetch works
import fetch from 'cross-fetch';             // keep; harmless in Node 18+

const SHEET_ID   = import.meta.env.VITE_GOOGLE_SHEET_ID;
const SHEET_NAME = import.meta.env.VITE_GOOGLE_SHEET_NAME;
const API_KEY    = import.meta.env.VITE_GOOGLE_API_KEY;

const RANGE = `${encodeURIComponent(SHEET_NAME)}!A1:Z1000`;
const URL   = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

export async function getEvents () {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Sheets API ${res.status}`);
  const { values } = await res.json();
  if (!values || values.length === 0) return [];
  const [header, ...rows] = values;
  return rows.map(r =>
    header.reduce((o, col, i) => ({ ...o, [col]: r[i] || '' }), {})
  );
}
