/* src/CampTable.jsx  – JSON version
   Renders a table of events; each cell is analysed at runtime:
   • https://….(png|jpg|gif|webp|svg)  →  <img>
   • any https URL                     →  <a>
   • raw HTML (starts < ends >)        →  dangerouslySetInnerHTML
   • otherwise                         →  plain text                           */

import React from "react";
import { useSheet } from "./UseCamps";   // ← path to your new hook
import "./CampTable.css";

/** Decide how to render the cell value */
function renderCell(value = "") {
  const v = value.trim();

  // image extensions
  if (/^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)$/i.test(v)) {
    return <img src={v} alt="" style={{ maxWidth: 150 }} />;
  }

  // generic URL
  if (/^https?:\/\//i.test(v)) {
    return (
      <a href={v} target="_blank" rel="noopener noreferrer">
        {v}
      </a>
    );
  }

  // naïve “looks like HTML” check
  if (v.startsWith("<") && v.endsWith(">")) {
    /* eslint-disable react/no-danger */
    return <span dangerouslySetInnerHTML={{ __html: v }} />;
    /* eslint-enable react/no-danger */
  }

  return v;                                   // plain text fallback
}

export default function CampTable() {
  // JSON hook – no CSV URL argument needed
  const { events } = useSheet();
  const rows = events || [];
  const columns = rows.length
   ? Object.keys(rows[0])               // take keys from the first row
   : [];

  if (!rows.length) return <p>Loading camp list…</p>;

  return (
    <table className="camp-table">
      <thead>
        <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {columns.map((c) => (
              <td key={c}>{renderCell(row[c])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
