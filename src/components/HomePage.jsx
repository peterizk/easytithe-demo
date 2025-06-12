import ReactMarkdown from "react-markdown";
import remarkGfm     from "remark-gfm";
import rehypeRaw     from "rehype-raw";
import useBlobText   from "../hooks/useBlobText";   // <-- note ../hooks

export default function HomePage() {
  const { text, loading } = useBlobText("content.md");

  if (loading)       return <p className="p-4">Loading…</p>;
  if (!text.trim())  return <p className="p-4">Content coming soon.</p>;

  return (
 <div className="container">
    <div className="prose">
       <ReactMarkdown
        children={text}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}  /* lets you embed raw HTML if needed */
      />
    </div>
    </div>
  );
}
