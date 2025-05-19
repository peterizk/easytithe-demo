// src/components/HTMLBlock.jsx
import DOMPurify from 'dompurify';

/** 
 * Renders trusted HTML from the sheet, sanitized.
 */
export default function HTMLBlock({ html, className }) {
  if (!html) return null;
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html)
      }}
    />
  );
}
