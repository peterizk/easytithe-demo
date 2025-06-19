// src/components/Header.jsx
import React from "react";
import SettingsCog from "./SettingsCog";

export default function Header({ pages }) {
  return (
    <header className="app-header">
       <div className="container header-container">
        <h1 className="app-title" text-align="center">Holy Resurrection & St. Mark Coptic Orthodox Church of Chicago</h1>
      <SettingsCog /> 
      </div>

      {/* Navigation row */}
        <nav className="site-nav">
          <a href="/">Home</a>

          {pages.map((name) => {
            const label = name
              .replace(/\.[^.]+$/, "")      // drop extension
              .replace(/[-_]/g, " ")        // dashes/underscores → spaces
              .replace(/\b\w/g, (c) => c.toUpperCase()); // title-case

            return (
              <a key={name} href={`/p/${name}`}>
                {label}
              </a>
            );
          })}

          <a href="/admin/files">Admin</a>
        </nav>
    </header>
  );
}