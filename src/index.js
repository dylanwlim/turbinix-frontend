// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Keep your global styles
import App from './App';
import { ThemeProvider } from './theme-provider'; // <-- Import the provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap the entire App component */}
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme"> {/* Use props from your theme-provider if needed */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you have a reportWebVitals function, keep it outside the provider or wherever it was.
// reportWebVitals();