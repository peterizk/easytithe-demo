// src/components/PageViewer.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import useBlobText from '../hooks/useBlobText';
import usePageFiles from '../hooks/usePageFiles';

export default function PageViewer() {
  const { name } = useParams();
  const pages = usePageFiles();

  const fileName = React.useMemo(() => {
    if (/\.[^.]+$/.test(name)) return name;
    const match = pages.find(
      fn => fn.replace(/\.[^.]+$/, '') === name
    );
    return match || `${name}.html`;
  }, [name, pages]);

  const ext = fileName.split('.').pop().toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
    return (
      <div className="container">
        <img
          src={`/api/blob/${fileName}`}
          alt={fileName}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    );
  }
  if (ext === 'pdf') {
    return (
      <div className="container">
        <iframe
          src={`/api/blob/${fileName}`}
          className="page-iframe"
        />
      </div>
    );
  }

  const { text, loading } = useBlobText(fileName);
  if (loading) return <p className="top-block">Loading…</p>;
  if (!text.trim()) return <p className="top-block">Page not found.</p>;

  return (
    <div className="container">
      <div className="prose">
        <ReactMarkdown
          children={text}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        />
      </div>
    </div>
  );
}