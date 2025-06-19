import { useState, useEffect } from "react";
import ReactMde from 'react-mde';
import 'react-mde/lib/styles/css/react-mde-all.css';
import useBlobText from "../hooks/useBlobText";

export default function AdminContent() {
  const { text, loading, save } = useBlobText("content.md");
  const [value, setValue] = useState("");
  const [tab, setTab]     = useState("write");

  useEffect(() => { if (!loading) setValue(text); }, [loading, text]);

  if (loading) return <p className="page-heading">Loading…</p>;

  return (
     <div className="app-wrapper">
      <h2 className="page-heading">Edit Page Content (Markdown)</h2>
     <ReactMde
        value={value}
        onChange={setValue}
        selectedTab={tab}
        onTabChange={setTab}
        generateMarkdownPreview={md =>
          import("marked").then(({ marked }) => marked.parse(md))
        }
      />
      <button className="btn btn-primary"
        onClick={() => save(value)}
      >
        Save
      </button>
    </div>
  );
}
