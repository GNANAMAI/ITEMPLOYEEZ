import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/AppShell";
import { AppRoutes } from "@/routes";
import "@/theme/global.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppShell>
          <App />
        </AppShell>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
