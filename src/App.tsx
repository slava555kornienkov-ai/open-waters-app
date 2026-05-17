import { Routes, Route, useLocation, Navigate } from "react-router";
import { useEffect } from "react";
import { AppLayout } from "./components/AppLayout";
import { ProfileScreen } from "./pages/ProfileScreen";
import { WheelScreen } from "./pages/WheelScreen";
import { BookingScreen } from "./pages/BookingScreen";
import { PromotionsScreen } from "./pages/PromotionsScreen";
import { SupportScreen } from "./pages/SupportScreen";
import { BookingConfirmScreen } from "./pages/BookingConfirmScreen";
import { SettingsScreen } from "./pages/SettingsScreen";
import { AdminScreen } from "./pages/AdminScreen";
import { SubscriptionConfirmScreen } from "./pages/SubscriptionConfirmScreen";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { useAuth } from "./hooks/useAuth";

// Telegram back button handler
function useTelegramBackButton() {
  const location = useLocation();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const subPages = ["/settings", "/admin", "/booking-confirm", "/subscription-confirm"];
    const isSubPage = subPages.some((p) => location.pathname.startsWith(p));

    if (isSubPage) {
      tg.BackButton.show();
      const handleBack = () => { window.history.back(); };
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton.offClick(handleBack);
        tg.BackButton.hide();
      };
    } else {
      tg.BackButton.hide();
    }
  }, [location.pathname]);
}

// Auth guard — redirects to login if not authenticated
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="app-viewport flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-cyan-200 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  useTelegramBackButton();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route path="/" element={<BookingScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/wheel" element={<WheelScreen />} />
        <Route path="/booking" element={<BookingScreen />} />
        <Route path="/promotions" element={<PromotionsScreen />} />
        <Route path="/support" element={<SupportScreen />} />
        {/* Sub-pages without bottom nav */}
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/booking-confirm" element={<BookingConfirmScreen />} />
        <Route path="/subscription-confirm" element={<SubscriptionConfirmScreen />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return <AppContent />;
}
