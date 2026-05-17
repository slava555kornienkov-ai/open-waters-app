import { Routes, Route, useLocation } from "react-router";
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
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Telegram back button handler
function useTelegramBackButton() {
  const location = useLocation();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const subPages = ["/settings", "/admin", "/booking-confirm"];
    const isSubPage = subPages.some((p) => location.pathname.startsWith(p));

    if (isSubPage) {
      tg.BackButton.show();
      const handleBack = () => {
        if (location.pathname === "/settings" || location.pathname === "/admin") {
          window.history.back();
        } else {
          window.history.back();
        }
      };
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

function AppContent() {
  useTelegramBackButton();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
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
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return <AppContent />;
}
