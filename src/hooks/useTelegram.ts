import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          query_id?: string;
        };
        version: string;
        platform: string;
        colorScheme: "light" | "dark";
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        showPopup: (params: { title?: string; message: string; buttons?: { id: string; type?: string; text: string }[] }) => Promise<string>;
        showAlert: (message: string) => Promise<void>;
        showConfirm: (message: string) => Promise<boolean>;
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive: boolean) => void;
          hideProgress: () => void;
          setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        onEvent: (eventType: string, callback: () => void) => void;
        offEvent: (eventType: string, callback: () => void) => void;
      };
    };
  }
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const [tgUser, setTgUser] = useState<Window["Telegram"]["WebApp"]["initDataUnsafe"]["user"] | null>(null);

  const getWebApp = () => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      return window.Telegram.WebApp;
    }
    return null;
  };

  useEffect(() => {
    const webApp = getWebApp();
    if (!webApp) {
      // Not in Telegram - hide loading screen anyway
      const loader = document.getElementById("loading-screen");
      if (loader) loader.classList.add("hidden");
      setIsReady(true);
      return;
    }

    // Initialize Telegram WebApp
    try {
      webApp.ready();
      webApp.expand();
      webApp.setHeaderColor("#06B6D4");
      webApp.setBackgroundColor("#F0F9FF");
      webApp.enableClosingConfirmation();

      if (webApp.initDataUnsafe?.user) {
        setTgUser(webApp.initDataUnsafe.user);
      }
    } catch (e) {
      console.warn("Telegram WebApp init error:", e);
    }

    // Hide loading screen
    const loader = document.getElementById("loading-screen");
    if (loader) {
      setTimeout(() => loader.classList.add("hidden"), 500);
    }
    setIsReady(true);

    // Listen for viewport changes
    const handleViewport = () => {
      const vh = webApp.viewportStableHeight;
      document.documentElement.style.setProperty("--tg-viewport-height", `${vh}px`);
    };
    handleViewport();
    webApp.onEvent("viewportChanged", handleViewport);

    return () => {
      webApp.offEvent("viewportChanged", handleViewport);
    };
  }, []);

  const haptic = {
    light: () => getWebApp()?.HapticFeedback?.impactOccurred("light"),
    medium: () => getWebApp()?.HapticFeedback?.impactOccurred("medium"),
    success: () => getWebApp()?.HapticFeedback?.notificationOccurred("success"),
    error: () => getWebApp()?.HapticFeedback?.notificationOccurred("error"),
  };

  return {
    webApp: getWebApp(),
    isReady,
    tgUser,
    isInTelegram: !!getWebApp(),
    haptic,
    showAlert: (msg: string) => getWebApp()?.showAlert(msg),
    showConfirm: (msg: string) => getWebApp()?.showConfirm(msg),
    setMainButton: (params: { text: string; onClick: () => void }) => {
      const wa = getWebApp();
      if (!wa) return;
      wa.MainButton.setText(params.text);
      wa.MainButton.onClick(params.onClick);
      wa.MainButton.show();
    },
    hideMainButton: () => {
      const wa = getWebApp();
      if (!wa) return;
      wa.MainButton.hide();
    },
  };
}
