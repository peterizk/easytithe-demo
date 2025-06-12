import { useState, useEffect } from "react";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import useBlobText from "../hooks/useBlobText";

export default function AdminContent() {
  const { text, loading, save } = useBlobText("content.md");
  const [value, setValue] = useState("");
  const [tab, setTab]     = useState("write");

  useEffect(() => { if (!loading) setValue(text); }, [loading, text]);

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl mb-3">Edit Page Content (Markdown)</h2>
      <ReactMde
        value={value}
        onChange={setValue}
        selectedTab={tab}
        onTabChange={setTab}
        generateMarkdownPreview={md =>
          import("marked").then(({ marked }) => marked.parse(md))
        }
      />
      <button
        className="mt-3 px-4 py-1 rounded bg-green-700 text-white"
        onClick={() => save(value)}
      >
        Save
      </button>
    </div>
  );
}
