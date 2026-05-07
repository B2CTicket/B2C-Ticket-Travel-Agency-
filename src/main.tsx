
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log("main.tsx: Starting render process");

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("main.tsx: App rendered");
} else {
  console.error("main.tsx: Root element not found");
  document.body.innerHTML = "<h1>SYSTEM ERROR: #root missing from DOM</h1>";
}
