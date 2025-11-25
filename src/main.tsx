import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { SocketProvider } from "./components/providers/SocketProvider.tsx";
import { ThemeProvider } from "./components/providers/ThemeProvider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SocketProvider>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <App />
        <Toaster />
      </ThemeProvider>
    </SocketProvider>
  </StrictMode>,
);
