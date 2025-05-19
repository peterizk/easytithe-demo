import React from "react";
import "./App.css";
import CampTable from "./CampTable";
import { useSheet } from "./UseCamps";
import HTMLBlock from "./components/HTMLBlock";
import Header from "./components/Header";

export default function App() {
  // Pull in your data
  const { events, settings, error } = useSheet();

  // Error state
  if (error) {
    return <p>Error loading data: {error.message}</p>;
  }

  // Loading state
  if (!settings) {
    return <p>Loading…</p>;
  }

  // Render once data is ready
  return (
    <>
      <Header />

      <div className="app-wrapper">
      {/* Page heading from sheet */}
      {settings.PageHeading && (
        <h1 className="page-heading">{settings.PageHeading}</h1>
      )}

      {/* Optional HTML above the table */}
      <HTMLBlock html={settings.TopSection} className="top-block" />

      {/* Your camps table */}
      <CampTable />

      {/* Optional HTML below the table */}
      <HTMLBlock html={settings.BottomSection} className="bottom-block" />
       </div>
    </>
  );
}
