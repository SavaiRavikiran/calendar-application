import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./config/auth";
import App from './App.tsx';
import './index.css';

const msalInstance = new PublicClientApplication(msalConfig);

// Account selection logic is handled by the library
msalInstance.initialize().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </StrictMode>
  );
});