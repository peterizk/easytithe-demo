// src/components/Header.jsx
import React from "react";

export default function Header({ pages }) {
  return (
    <header className="app-header">
       <div className="container header-container">
        <h3 className="app-title">Holy Resurrection & St. Mark Coptic Orthodox Church of Chicago</h3>
        </div>

      {/* Navigation row */}
      <div className="container" style={{ marginTop: '2rem' }}>
        <nav className="site-nav header-nav">
          <a href="/" className="mr-4">Home</a>
          {pages.map(name => (
            <a
              key={name}
              href={`/p/${name}`}
              className="ml-4"
            >
              {name
                .replace(/\.[^.]+$/, "")            // drop extension
                .replace(/[-_]/g, " ")              // dashes/underscores → spaces
                .replace(/\b\w/g, c => c.toUpperCase()) // title-case
              }
            </a>
          ))}
          <a href="/admin/files" className="ml-4">Admin</a>
        </nav>
      </div>
    </header>
  );
}