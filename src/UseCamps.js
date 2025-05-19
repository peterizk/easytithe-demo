/* UseCamps.js   – now fetches Google‑Sheets JSON instead of CSV   */
// src/hooks/useCamps.js

import { useState, useEffect } from 'react';
import fetch from "cross-fetch";

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const API_KEY  = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;

/** General helper to fetch any sheet range */
async function fetchSheet(range) {
  const res = await fetch(`${BASE_URL}/${range}?key=${API_KEY}`);
  if (!res.ok) throw new Error(`${range} fetch failed: ${res.statusText}`);
  const { values } = await res.json();
  return values;
}

/** Custom hook that returns both events and settings */
export function useSheet() {
  const [events,  setEvents]  = useState([]);
  const [settings, setSettings] = useState(null);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // 1) Load Events data
        const evValues = await fetchSheet('Events!A1:Z1000');
        const [evHeader, ...evRows] = evValues;
        const evObjects = evRows.map(row =>
          evHeader.reduce((obj, col, i) => ({ ...obj, [col]: row[i] || '' }), {})
        );

        // 2) Load Settings data
        const stValues = await fetchSheet('Settings!A1:D2');
        const [stHeader, stRow] = stValues;
        const stObject = stHeader.reduce((obj, col, i) => ({
          ...obj,
          [col]: stRow[i] || ''
        }), {});

        if (mounted) {
          setEvents(evObjects);
          setSettings(stObject);
        }
      } catch (err) {
        console.error('Data load error:', err);
        if (mounted) setError(err);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  return { events, settings, error };
}
