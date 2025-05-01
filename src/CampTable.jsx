import { useSheet } from "./UseCamps";    // new name
import "./CampTable.css";

function renderCell(value) {
  const isImg = /^https?:\/\/.+\.(png|jpe?g|gif|webp)$/i.test(value);
  const isUrl = /^https?:\/\//i.test(value);

  if (isImg) return <img src={value} alt="" style={{ maxWidth: 120 }} />;
  if (isUrl) return <a href={value}>{value}</a>;

  // naïve rich-text allowance (bold, italics, <br>, etc.)
  if (/<[a-z][\s\S]*>/i.test(value))
    return <span dangerouslySetInnerHTML={{ __html: value }} />;

  return value; // plain text
}

export default function CampTable() {
  const { columns, rows } = useSheet(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLd6Nq6pDMIaXbMq6cEmnRMLa1gK0ar02_zVUVhkQy1enSDvEQQdFN-lRs9PAXIrHAPR5Pf2d4ZP6-/pub?output=csv"
  );

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
