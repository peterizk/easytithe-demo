// src/main.jsx
import "./App.css";
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

import App from './App';

/**
 * React 17 entrypoint uses ReactDOM.render instead of createRoot
 */
ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
