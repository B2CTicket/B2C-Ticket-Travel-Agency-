
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import './src/index.css';

/* 
// Register Service Worker for PNR/Route Tracking and Offline Support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
*/

console.log("Bootstrap: index.tsx executing");

window.onerror = (msg, url, lineNo, columnNo, error) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color: red; padding: 20px;">Runtime Error: ${msg}</div>`;
  }
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
    <App />
);
