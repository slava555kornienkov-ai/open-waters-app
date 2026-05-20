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
import { useAppStore } from "./store/useAppStore";

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
      return () => { tg.BackButton.offClick(handleBack); tg.BackButton.hide(); };
    } else {
      tg.BackButton.hide();
    }
  }, [location.pathname]);
}

export default function App() {
  useTelegramBackButton();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/booking" replace /> : <Login />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/booking" replace /> : <Login />} />
      <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/" replace />}>
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/wheel" element={<WheelScreen />} />
        <Route path="/booking" element={<BookingScreen />} />
        <Route path="/promotions" element={<PromotionsScreen />} />
        <Route path="/support" element={<SupportScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/booking-confirm" element={<BookingConfirmScreen />} />
        <Route path="/subscription-confirm" element={<SubscriptionConfirmScreen />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
