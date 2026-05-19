import { useState } from "react";
import { useNavigate } from "react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  Settings, HelpCircle, MapPin, LogOut, ChevronRight,
  Sparkles, Calendar, Wallet, Users, Share2, RefreshCw, Bell, Shield, X, QrCode
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function ProfileScreen() {
  const navigate = useNavigate();
  const { showToast, notifications, unreadCount, markAllRead, user, logoutUser, userRole } = useAppStore();
  const [qrData, setQrData] = useState(`ow-check-${Date.now()}`);
  const [showNotifs, setShowNotifs] = useState(false);
  const baseUrl = import.meta.env.BASE_URL || "/";

  const refreshQr = () => {
    setQrData(`ow-check-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    showToast({ message: "QR-код обновлен", type: "success" });
  };

  const shareReferral = async () => {
    const code = user?.referralCode || "OW-REF";
    const text = `Присоединяйся к Open Waters! Мой реферальный код: ${code}\n+300 бонусов за первое посещение!`;
    if (navigator.share) { await navigator.share({ title: "Open Waters", text }); }
    else { await navigator.clipboard.writeText(text); showToast({ message: "Ссылка скопирована!", type: "success" }); }
  };

  const openYandex = () => {
    try { window.open("https://yandex.ru/maps/-/CPcLJZmt", "_blank"); } catch {}
  };

  const handleLogout = () => {
    logoutUser();
    showToast({ message: "Вы вышли из аккаунта", type: "info" });
    navigate("/login");
  };

  const userName = user?.name || "Гость";
  const userPhone = user?.phone || "";
  const bonusBalance = user?.bonusBalance || 0;
  const visitsCount = user?.visitsCount || 0;
  const totalSpent = user?.totalSpent || 0;
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={`${baseUrl}logo-user.jpg`} alt="Open Waters" className="w-8 h-8 object-cover rounded-full" />
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Профиль</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/settings")} className="p-2 rounded-full active:scale-90 transition-transform" style={{ background: "rgba(6,182,212,0.08)" }}>
            <Settings size={20} style={{ color: "var(--teal-600)" }} />
          </button>
          <button onClick={() => setShowNotifs(true)} className="relative p-2 active:scale-90 transition-transform">
            <Bell size={20} style={{ color: unreadCount > 0 ? "#F97316" : "var(--text-secondary)" }} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">{unreadCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications Modal */}
      {showNotifs && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => setShowNotifs(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-[430px] mx-auto surface-solid rounded-t-2xl p-5 animate-in slide-in-from-bottom duration-300" style={{ maxHeight: "70vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Уведомления</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ color: "var(--teal-500)", background: "rgba(6,182,212,0.08)" }}>Прочитать все</button>
                )}
                <button onClick={() => setShowNotifs(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(148,163,184,0.15)" }}><X size={16} style={{ color: "var(--text-muted)" }} /></button>
              </div>
            </div>
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "50vh" }}>
              {notifications.length === 0 ? (
                <p className="text-center text-sm py-8" style={{ color: "var(--text-muted)" }}>Нет уведомлений</p>
              ) : notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl" style={{ background: n.read ? "rgba(248,250,252,1)" : "rgba(6,182,212,0.04)", borderLeft: n.read ? "none" : "3px solid #06B6D4" }}>
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{n.title}</p>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{n.timestamp}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Card */}
      <div className="mx-4 rounded-2xl liquid-glass p-5">
        <div className="flex flex-col items-center">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #22D3EE, #60A5FA)", padding: "3px" }}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-brand)", background: "linear-gradient(135deg, #06B6D4, #0891B2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{initials}</span>
            </div>
          </div>
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>{userName}</h2>
          {userPhone && <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{userPhone}</p>}
          <div className="flex gap-2 mt-4 w-full justify-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(6,182,212,0.1)" }}>
              <Sparkles size={14} style={{ color: "var(--teal-600)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--teal-600)" }}>{bonusBalance.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(6,182,212,0.1)" }}>
              <Calendar size={14} style={{ color: "var(--teal-600)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--teal-600)" }}>{visitsCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(6,182,212,0.1)" }}>
              <Wallet size={14} style={{ color: "var(--teal-600)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--teal-600)" }}>{totalSpent.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="mx-4 mt-3 rounded-2xl liquid-glass p-5 flex flex-col items-center">
        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>QR-код для входа</h3>
        <div className="mt-3 p-3 bg-white rounded-xl shadow-sm">
          <QRCodeSVG value={qrData} size={140} level="M" />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Покажите на ресепшн</p>
        <button onClick={refreshQr} className="flex items-center gap-1.5 mt-2 text-sm font-medium" style={{ color: "var(--teal-500)" }}>
          <RefreshCw size={14} /> Обновить код
        </button>
      </div>

      {/* Referral */}
      <div className="mx-4 mt-3 rounded-2xl liquid-glass p-4">
        <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Пригласите друга</h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>+300 бонусов за каждого друга</p>
        <button onClick={shareReferral} className="w-full mt-3 h-12 rounded-xl glossy-glass flex items-center justify-center gap-2 text-white font-semibold transition-transform active:scale-95"
          style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", fontFamily: "var(--font-brand)" }}>
          <Share2 size={18} /> Поделиться ссылкой
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mx-4 mt-3 mb-6 space-y-2">
        {[
          { icon: HelpCircle, label: "Поддержка", action: () => navigate("/support") },
          { icon: MapPin, label: "Отзыв на Яндекс Картах", action: openYandex },
          ...(userRole === "admin" || userRole === "employee" ? [{ icon: Shield, label: "Админ-панель", action: () => navigate("/admin") }] : []),
        ].map((item, i) => (
          <button key={i} onClick={item.action} className="w-full flex items-center justify-between p-4 rounded-xl surface-solid transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <item.icon size={20} style={{ color: "var(--text-secondary)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</span>
            </div>
            <ChevronRight size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        ))}

        <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 rounded-xl surface-solid transition-all active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <LogOut size={20} style={{ color: "#F97316" }} />
            <span className="text-sm font-medium" style={{ color: "#F97316" }}>Выйти</span>
          </div>
        </button>
      </div>
    </div>
  );
}
