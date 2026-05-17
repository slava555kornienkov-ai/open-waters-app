import { useState } from "react";
import { useNavigate } from "react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  Settings, HelpCircle, MapPin, LogOut, ChevronRight,
  Sparkles, Calendar, Wallet, Users, Share2, RefreshCw, Bell, Shield, X, QrCode
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";

const mockVisits = [
  { id: 1, date: "14.05.2026", time: "10:00 - 12:00", duration: 2, boards: 1, instructor: true, rescuers: false, price: 2800, status: "completed" as const, earnedBonuses: 140 },
  { id: 2, date: "10.05.2026", time: "14:00 - 16:00", duration: 2, boards: 2, instructor: false, rescuers: false, price: 3200, status: "completed" as const, earnedBonuses: 160 },
  { id: 3, date: "02.05.2026", time: "11:00 - 13:00", duration: 2, boards: 1, instructor: true, rescuers: true, price: 5300, status: "completed" as const, earnedBonuses: 265 },
];

const userData = {
  name: "Ольга Смирнова", phone: "+7 (999) 123-45-67",
  bonusBalance: 1250, visitsCount: 8, totalSpent: 15600,
  referralCode: "OW-OLGA-77",
  invitedCount: 2, earnedFromReferrals: 600,
};

// Loyalty levels: [threshold, name, color, discount]
const LEVELS: [number, string, string, number][] = [
  [0,    "Бронзовый",  "#B45309", 0],
  [2000, "Серебряный", "#94A3B8", 5],
  [5000, "Золотой",    "#F59E0B", 10],
  [10000,"Платиновый", "#0EA5E9", 15],
];

function getLoyaltyInfo(spent: number) {
  let currentIdx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (spent >= LEVELS[i][0]) currentIdx = i;
  }
  const [, name, color, discount] = LEVELS[currentIdx];
  const nextThreshold = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1][0] : LEVELS[currentIdx][0] * 2;
  const progress = Math.min(100, ((spent - LEVELS[currentIdx][0]) / (nextThreshold - LEVELS[currentIdx][0])) * 100);
  const remaining = nextThreshold - spent;
  return { name, color, discount, progress: Math.max(0, progress), remaining: Math.max(0, remaining), nextName: currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1][1] : "MAX" };
}

export function ProfileScreen() {
  const navigate = useNavigate();
  const { showToast, notifications, unreadCount, markAllRead, userRole } = useAppStore();
  const { logout } = useAuth();
  const [qrData, setQrData] = useState(`ow-check-${Date.now()}`);
  const [showNotifs, setShowNotifs] = useState(false);

  const refreshQr = () => {
    setQrData(`ow-check-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    showToast({ message: "QR-код обновлен", type: "success" });
  };

  const shareReferral = async () => {
    const text = `Присоединяйся к Open Waters! Мой реферальный код: ${userData.referralCode}\n+300 бонусов за первое посещение!`;
    if (navigator.share) { await navigator.share({ title: "Open Waters", text }); }
    else { await navigator.clipboard.writeText(text); showToast({ message: "Ссылка скопирована!", type: "success" }); }
  };

  // Yandex Maps review - opens in new tab
  const openYandex = () => {
    try {
      window.open("https://yandex.ru/maps/org/open_waters/", "_blank", "noopener,noreferrer");
    } catch {
      showToast({ message: "Не удалось открыть Яндекс Карты", type: "error" });
    }
  };

  const goToSettings = () => navigate("/settings");
  const goToSupport = () => navigate("/support");
  const goToAdmin = () => navigate("/admin");

  // My bookings with status
  const myBookings = [
    { id: "b1", date: "18.05.2026", time: "10:00", duration: 2, price: 2800, status: "pending" as const },
    { id: "b2", date: "14.05.2026", time: "10:00 - 12:00", duration: 2, price: 2800, status: "confirmed" as const },
    { id: "b3", date: "10.05.2026", time: "14:00 - 16:00", duration: 2, price: 3200, status: "completed" as const },
  ];

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo-user.jpg" alt="Open Waters" className="w-8 h-8 object-cover rounded-full" />
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Профиль</h1>
        </div>
        <button onClick={() => setShowNotifs(true)} className="relative p-2 active:scale-90 transition-transform">
          <Bell size={20} style={{ color: unreadCount > 0 ? "#F97316" : "var(--text-secondary)" }} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">{unreadCount}</span>
          )}
        </button>
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
                  <button onClick={markAllRead} className="text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-70" style={{ color: "var(--teal-500)", background: "rgba(6,182,212,0.08)" }}>
                    Прочитать все
                  </button>
                )}
                <button onClick={() => setShowNotifs(false)} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90" style={{ background: "rgba(148,163,184,0.15)" }}>
                  <X size={16} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
            </div>
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "50vh" }}>
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl transition-all" style={{ background: n.read ? "rgba(248,250,252,1)" : "rgba(6,182,212,0.04)", borderLeft: n.read ? "none" : "3px solid #06B6D4" }}>
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{n.title}</p>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{n.timestamp}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-center text-sm py-8" style={{ color: "var(--text-muted)" }}>Нет уведомлений</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Card */}
      <div className="mx-4 rounded-2xl liquid-glass p-5 animate-in fade-in slide-in-from-bottom-5 duration-500">
        <div className="flex flex-col items-center">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #22D3EE, #60A5FA)", padding: "3px" }}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-brand)", background: "linear-gradient(135deg, #06B6D4, #0891B2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {userData.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
          </div>
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>{userData.name}</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{userData.phone}</p>
          <div className="flex gap-2 mt-4 w-full justify-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(6,182,212,0.1)" }}>
              <Sparkles size={14} style={{ color: "var(--teal-600)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--teal-600)" }}>{userData.bonusBalance.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(6,182,212,0.1)" }}>
              <Calendar size={14} style={{ color: "var(--teal-600)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--teal-600)" }}>{userData.visitsCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(6,182,212,0.1)" }}>
              <Wallet size={14} style={{ color: "var(--teal-600)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--teal-600)" }}>{userData.totalSpent.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty */}
      {(() => {
        const li = getLoyaltyInfo(userData.totalSpent);
        return (
          <div className="mx-4 mt-3 rounded-2xl surface-solid p-4 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: li.color }} />
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{li.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${li.color}18`, color: li.color }}>скидка {li.discount}%</span>
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{userData.totalSpent.toLocaleString()} ₽</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(6,182,212,0.1)" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${li.progress}%`, background: `linear-gradient(90deg, ${li.color}, #22D3EE)` }} />
            </div>
            <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
              {li.remaining > 0 ? `До ${li.nextName}: ${li.remaining.toLocaleString()} ₽` : "Максимальный уровень!"}
            </p>
          </div>
        );
      })()}

      {/* QR Code */}
      <div className="mx-4 mt-3 rounded-2xl liquid-glass p-5 flex flex-col items-center animate-in fade-in slide-in-from-bottom-5 duration-500 delay-200">
        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>QR-код для входа</h3>
        <div className="mt-3 p-3 bg-white rounded-xl shadow-sm">
          <QRCodeSVG value={qrData} size={140} level="M" />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Покажите на ресепшн</p>
        <button onClick={refreshQr} className="flex items-center gap-1.5 mt-2 text-sm font-medium transition-opacity hover:opacity-80 active:scale-95" style={{ color: "var(--teal-500)" }}>
          <RefreshCw size={14} /> Обновить код
        </button>
      </div>

      {/* My Bookings */}
      <div className="mx-4 mt-3 rounded-2xl surface-solid p-4 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-300">
        <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Мои бронирования</h3>
        {myBookings.map((b, i) => (
          <div key={b.id} className={`py-3 ${i < myBookings.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{b.date}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: b.status === "completed" ? "rgba(16,185,129,0.1)" : b.status === "confirmed" ? "rgba(6,182,212,0.1)" : "rgba(249,115,22,0.1)",
                  color: b.status === "completed" ? "#059669" : b.status === "confirmed" ? "var(--teal-600)" : "#F97316",
                }}>
                {b.status === "completed" ? "Выполнено" : b.status === "confirmed" ? "Подтверждена" : "Ожидает подтверждения"}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{b.time} · {b.duration} часа</span>
              <span className="text-sm font-bold" style={{ color: "var(--teal-600)" }}>{b.price.toLocaleString()} ₽</span>
            </div>
          </div>
        ))}
      </div>

      {/* Visit History */}
      <div className="mx-4 mt-3 rounded-2xl surface-solid p-4 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-300">
        <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>История посещений</h3>
        {mockVisits.map((visit, i) => (
          <div key={visit.id} className={`py-3 ${i < mockVisits.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{visit.date}</span>
              <span className="text-sm font-bold" style={{ color: "var(--teal-600)" }}>{visit.price.toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{visit.time} · {visit.duration} часа</span>
              <span className="text-xs font-semibold" style={{ color: "#10B981" }}>+{visit.earnedBonuses}</span>
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Доски: {visit.boards} | Инструктор: {visit.instructor ? "Да" : "Нет"} | Спасатели: {visit.rescuers ? "Да" : "Нет"}</p>
          </div>
        ))}
      </div>

      {/* Referral */}
      <div className="mx-4 mt-3 rounded-2xl liquid-glass p-4 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-400">
        <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Пригласите друга</h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>+300 бонусов за каждого друга</p>
        <button onClick={shareReferral}
          className="w-full mt-3 h-12 rounded-xl glossy-glass flex items-center justify-center gap-2 text-white font-semibold transition-transform active:scale-95"
          style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", fontFamily: "var(--font-brand)" }}>
          <Share2 size={18} /> Поделиться ссылкой
        </button>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5"><Users size={14} style={{ color: "var(--text-muted)" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>Приглашено: {userData.invitedCount}</span></div>
          <div className="flex items-center gap-1.5"><Sparkles size={14} style={{ color: "var(--text-muted)" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>Заработано: {userData.earnedFromReferrals}</span></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mx-4 mt-3 mb-6 space-y-2 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-500">
        {[
          { icon: Settings, label: "Настройки", action: goToSettings },
          { icon: HelpCircle, label: "Поддержка", action: goToSupport },
          { icon: MapPin, label: "Отзыв на Яндекс Картах", action: openYandex },
          // Employee → QR Scanner only
          ...(userRole === "employee" ? [{ icon: QrCode, label: "QR Сканер", action: goToAdmin }] : []),
          // Admin → full admin panel
          ...(userRole === "admin" ? [{ icon: Shield, label: "Админ-панель", action: goToAdmin }] : []),
        ].map((item, i) => (
          <button key={i} onClick={item.action}
            className="w-full flex items-center justify-between p-4 rounded-xl surface-solid transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <item.icon size={20} style={{ color: item.label.includes("Админ") || item.label.includes("Сканер") ? "var(--teal-600)" : "var(--text-secondary)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</span>
            </div>
            <ChevronRight size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        ))}

        <button onClick={logout} className="w-full flex items-center justify-between p-4 rounded-xl surface-solid transition-all active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <LogOut size={20} style={{ color: "#F97316" }} />
            <span className="text-sm font-medium" style={{ color: "#F97316" }}>Выйти</span>
          </div>
        </button>
      </div>
    </div>
  );
}
