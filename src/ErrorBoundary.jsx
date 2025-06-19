// src/ErrorBoundary.jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // this will print in your terminal when running `npm run dev` or `npm start`
    console.error('ErrorBoundary caught:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      const { error, info } = this.state;
      return (
        <div style={{ padding: 20, whiteSpace: 'pre-wrap' }}>
          <h1>Something went wrong:</h1>
          <h2 style={{ color: 'crimson' }}>
            {error?.toString() /* show the full error message */}
          </h2>
          <details style={{ marginTop: 10 }}>
            <summary>Stack Trace</summary>
            {info?.componentStack || error?.stack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
