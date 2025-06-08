import React from "react";
import "./App.css";

import Header from "./components/Header";
import CampTable from "./CampTable";
import HTMLBlock from "./components/HTMLBlock";
import { useSheet } from "./UseCamps";
import usePageFiles from "./hooks/usePageFiles";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";

import DOMPurify from "dompurify";

/* ────────────────────────────────
   Helper component for dropped pages
   ──────────────────────────────── */
function FilePage({ pages }) {
  const { slug } = useParams();
  const page = pages.find((p) => p.slug === slug);
  if (!page) return <h1>404 Not Found</h1>;

  return (
    <iframe
      src={page.url}
      title={page.label}
      className="page-iframe"
      style={{ width: "100%", height: "80vh", border: "none" }}
    />
  );
}

/* ────────────────────────────────
   App root
   ──────────────────────────────── */
export default function App() {
  // Sheet‑driven settings & error (CampTable fetches rows itself)
  const { settings, error } = useSheet();
  const pages = usePageFiles();      // dynamic list from /static-pages

  if (error) return <p>Error loading data: {error.message}</p>;
  if (!settings) return <p>Loading…</p>;

  return (
    <BrowserRouter>
      <Header />

      {/* Navigation menu (home + dropped pages) */}
      <nav className="site-nav">
        <Link to="/">Home</Link>
        {pages.map((p) => (
          <Link key={p.slug} to={`/${p.slug}`}>
            {p.label}
          </Link>
        ))}
      </nav>

      <Routes>
        {/* Home route */}
        <Route
          path="/"
          element={
            <div className="app-wrapper">
              {settings.PageHeading && (
                <h1
                  className="page-heading"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(settings.PageHeading),
                  }}
                />
              )}

              <HTMLBlock html={settings.TopSection} className="top-block" />
              <CampTable />
              <HTMLBlock
                html={settings.BottomSection}
                className="bottom-block"
              />
            </div>
          }
        />

        {/* Catch‑all for any static HTML file dropped via SFTP */}
        <Route path="/:slug" element={<FilePage pages={pages} />} />
      </Routes>
    </BrowserRouter>
  );
}
