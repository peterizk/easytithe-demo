import { useEffect, useState } from "react";

export function useSheet(csvUrl) {
  const [columns, setColumns] = useState([]);   // ["Camp", "Dates", …]
  const [rows, setRows] = useState([]);         // [{ Camp:"x", Dates:"y", … }]

  useEffect(() => {
    const url = csvUrl + "&cb=" + Date.now();   // cache-buster
    fetch(url, { cache: "no-store" })
      .then((r) => r.text())
      .then((csv) => {
        const lines = csv.trim().split("\n");
        const headers = lines[0].split(",");
        const data = lines.slice(1).map((line) => {
        const cells = line.split(",");

        const unescape = (s = "") => {
        if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
          return s.replace(/""/g, '"').trim();   // ""  → "
          };
          return headers.reduce((obj, h, i) => {
            obj[h] = unescape(cells[i]);
            return obj;
          }, {});
        });

        setColumns(headers);
        setRows(data);
      })
      .catch(console.error);
  }, [csvUrl]);

  return { columns, rows };
}