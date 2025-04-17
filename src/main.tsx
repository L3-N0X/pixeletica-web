'use client';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/theme-provider';
import { ErrorBoundary } from 'react-error-boundary';

function fallBackRenderer({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert" className="w-full h-screen flex items-center justify-center">
      <div className="bg-destructive text-white p-4 rounded">
        <h2 className="text-lg font-bold">Something went wrong:</h2>
        <p>{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="mt-4 bg-card text-card-foreground p-2 rounded w-full hover:bg-card/80 transition-colors"
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary
      fallbackRender={fallBackRenderer}
      onReset={(details) => {
        // Reset the state of your app so the error doesn't happen again
        console.log('Resetting app state:', details);
      }}
    >
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="pixeletica-theme">
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
