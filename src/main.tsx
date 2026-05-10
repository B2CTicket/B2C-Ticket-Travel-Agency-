
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    const { hasError, error } = this.state as { hasError: boolean; error: any };
    if (hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: '#fff', minHeight: '100vh' }}>
          <h1>Something went wrong rendering the App.</h1>
          <pre>{error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log("main.tsx: Starting render process");

// PWA Service Worker Registration
/* 
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW Registered:', reg))
      .catch(err => console.log('SW Registration Failed:', err));
  });
}
*/

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log("main.tsx: App rendered");
} else {
  console.error("main.tsx: Root element not found");
  document.body.innerHTML = "<h1>SYSTEM ERROR: #root missing from DOM</h1>";
}
