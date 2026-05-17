import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import { TRPCProvider } from "@/providers/trpc";
import App from "./App.tsx";

// Telegram WebApp initialization - runs immediately
function initTelegram() {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor("#06B6D4");
      tg.setBackgroundColor("#F0F9FF");
    }
  } catch {
    // Not in Telegram or SDK not loaded
  }

  // Hide loading screen after app mounts
  setTimeout(() => {
    const loader = document.getElementById("loading-screen");
    if (loader) loader.classList.add("hidden");
  }, 800);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
);

initTelegram();
