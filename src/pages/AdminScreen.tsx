import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, TrendingUp, Users, CalendarDays,
  CheckCircle, XCircle, QrCode, Search, Bell, UserCog, Crown, Camera
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { QrScanner } from "@/components/QrScanner";

// ─── Mock Data ──────────────────────────────────────────
const mockDashboard = { totalRevenue: 84700, totalBookings: 34, activeUsers: 56, pendingPayments: 5, monthlyRevenue: 28400 };

interface Booking { id: number; bookingNumber: string; userName: string; phone: string; date: string; time: string; duration: number; boards: number; instructor: boolean; totalPrice: number; paymentStatus: string; status: string; earnedBonuses: number; }
const mockBookings: Booking[] = [
  { id: 1, bookingNumber: "OW123", userName: "Анна П", phone: "+79991234567", date: "16.05", time: "10:00", duration: 2, boards: 1, instructor: false, totalPrice: 1700, paymentStatus: "confirmed", status: "confirmed", earnedBonuses: 85 },
  { id: 2, bookingNumber: "OW124", userName: "Иван С", phone: "+79992345678", date: "16.05", time: "14:00", duration: 3, boards: 2, instructor: true, totalPrice: 11600, paymentStatus: "pending", status: "pending", earnedBonuses: 580 },
  { id: 3, bookingNumber: "OW125", userName: "Мария К", phone: "+79993456789", date: "17.05", time: "11:00", duration: 1, boards: 1, instructor: false, totalPrice: 2000, paymentStatus: "confirmed", status: "completed", earnedBonuses: 100 },
  { id: 4, bookingNumber: "OW126", userName: "Дмитрий В", phone: "+79994567890", date: "17.05", time: "16:00", duration: 4, boards: 1, instructor: true, totalPrice: 8700, paymentStatus: "card", status: "pending", earnedBonuses: 435 },
  { id: 5, bookingNumber: "OW127", userName: "Ольга С", phone: "+79995678901", date: "18.05", time: "10:00", duration: 2, boards: 1, instructor: false, totalPrice: 1700, paymentStatus: "confirmed", status: "completed", earnedBonuses: 85 },
  { id: 6, bookingNumber: "OW128", userName: "Павел Н", phone: "+79996789012", date: "18.05", time: "12:00", duration: 3, boards: 3, instructor: true, totalPrice: 17400, paymentStatus: "pending", status: "pending", earnedBonuses: 870 },
];

interface AppUser { id: number; name: string; phone: string; visitsCount: number; bonusBalance: number; totalSpent: number; loyaltyLevel: string; spinsAvailable: number; role: string; }
const mockUsers: AppUser[] = [
  { id: 1, name: "Ольга Смирнова", phone: "+79991234567", visitsCount: 8, bonusBalance: 1250, totalSpent: 15600, loyaltyLevel: "silver", spinsAvailable: 2, role: "user" },
  { id: 2, name: "Анна Петрова", phone: "+79992345678", visitsCount: 5, bonusBalance: 340, totalSpent: 8200, loyaltyLevel: "bronze", spinsAvailable: 1, role: "user" },
  { id: 3, name: "Иван Сидоров", phone: "+79993456789", visitsCount: 12, bonusBalance: 2100, totalSpent: 24500, loyaltyLevel: "gold", spinsAvailable: 3, role: "admin" },
  { id: 4, name: "Мария Козлова", phone: "+79994567890", visitsCount: 3, bonusBalance: 120, totalSpent: 4300, loyaltyLevel: "bronze", spinsAvailable: 0, role: "employee" },
  { id: 5, name: "Дмитрий Волков", phone: "+79995678901", visitsCount: 7, bonusBalance: 980, totalSpent: 12800, loyaltyLevel: "silver", spinsAvailable: 2, role: "user" },
];

// ─── Component ──────────────────────────────────────────
export function AdminScreen() {
  const navigate = useNavigate();
  const { showToast, userRole } = useAppStore();
  const [tab, setTab] = useState("dashboard");
  const [bookingsList, setBookingsList] = useState(mockBookings);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [qrValue, setQrValue] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [usersList] = useState(mockUsers);

  // Employee only sees QR scanner → default to qr tab
  const isAdmin = userRole === "admin";
  const isEmployee = userRole === "employee";

  // If employee, force QR tab and simplify
  const currentTab = isEmployee ? "qr" : tab;

  const filteredBookings = bookingsList.filter(b => {
    const mSearch = !search || b.userName.toLowerCase().includes(search.toLowerCase()) || b.bookingNumber.toLowerCase().includes(search.toLowerCase());
    const mStatus = filterStatus === "all" || b.status === filterStatus || (filterStatus === "pending_payment" && b.paymentStatus === "pending");
    return mSearch && mStatus;
  });

  const confirmPayment = (id: number) => { setBookingsList(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: "confirmed", status: "confirmed" } : b)); showToast({ message: "Оплата подтверждена!", type: "success" }); };
  const declinePayment = (id: number) => { setBookingsList(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: "declined" } : b)); showToast({ message: "Оплата отклонена", type: "error" }); };
  const confirmVisit = (id: number) => { setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: "completed" } : b)); showToast({ message: "Визит подтвержден!", type: "success" }); };

  const handleQrScan = () => {
    if (!qrValue.trim()) return;
    const booking = bookingsList.find(b => b.bookingNumber.toLowerCase() === qrValue.trim().toLowerCase());
    if (booking) {
      showToast({ message: `Найдено: ${booking.userName}`, type: "success" });
      if (booking.status !== "completed") confirmVisit(booking.id);
    } else { showToast({ message: "Бронирование не найдено", type: "error" }); }
    setQrValue("");
  };

  const adminTabs = [
    { key: "dashboard", label: "Сводка", icon: TrendingUp },
    { key: "bookings", label: "Брони", icon: CalendarDays },
    { key: "users", label: "Клиенты", icon: Users },
    { key: "qr", label: "QR", icon: QrCode },
  ];

  return (
    <div className="min-h-full pb-4">
      {/* Camera QR overlay */}
      {showCamera && <QrScanner onScan={(code) => { setShowCamera(false); setQrValue(code); showToast({ message: `QR: ${code.slice(0, 20)}`, type: "success" }); const b = bookingsList.find(x => code.includes(x.bookingNumber)); if (b && b.status !== "completed") confirmVisit(b.id); }} onClose={() => setShowCamera(false)} />}

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate("/profile")} className="w-8 h-8 rounded-full surface-solid flex items-center justify-center active:scale-90 transition-transform">
          <ChevronLeft size={18} style={{ color: "var(--text-primary)" }} />
        </button>
        <img src="/logo-user.jpg" alt="Open Waters" className="w-7 h-7 object-cover rounded-full" />
        <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
          {isAdmin ? "Админ-панель" : isEmployee ? "QR Сканер" : "Панель"}
        </h1>
      </div>

      {/* Admin tabs */}
      {isAdmin && (
        <div className="flex gap-1 p-1 mx-4 mt-2 rounded-xl surface-solid">
          {adminTabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                style={{ background: currentTab === t.key ? "white" : "transparent", color: currentTab === t.key ? "var(--teal-600)" : "var(--text-muted)", boxShadow: currentTab === t.key ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Employee: simple QR page */}
      {isEmployee && (
        <div className="px-4 mt-4 animate-in fade-in duration-300">
          <div className="surface-solid rounded-xl p-5 text-center">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3" style={{ background: "rgba(6,182,212,0.1)" }}>
              <QrCode size={28} style={{ color: "var(--teal-600)" }} />
            </div>
            <h3 className="text-base font-bold" style={{ fontFamily: "var(--font-brand)" }}>Сканер QR-кода</h3>
            <p className="text-xs mt-1 mb-4" style={{ color: "var(--text-muted)" }}>Отсканируйте QR клиента для подтверждения визита</p>
            <button onClick={() => setShowCamera(true)}
              className="w-full h-14 rounded-xl text-white font-semibold text-base flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.97] mb-3"
              style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", fontFamily: "var(--font-brand)" }}>
              <Camera size={20} /> Сканировать камерой
            </button>
            <input type="text" placeholder="Или введите номер вручную" value={qrValue} onChange={e => setQrValue(e.target.value)}
              className="w-full h-11 px-4 rounded-xl surface-solid text-sm text-center outline-none mb-2" style={{ color: "var(--text-primary)" }} />
            <button onClick={handleQrScan} className="w-full h-10 rounded-xl text-white font-semibold text-sm" style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", fontFamily: "var(--font-brand)" }}>
              Проверить
            </button>
          </div>
          <div className="mt-3 surface-solid rounded-xl p-3">
            <p className="text-[10px] mb-2" style={{ color: "var(--text-muted)" }}>Активные бронирования:</p>
            <div className="flex flex-wrap gap-1.5">
              {bookingsList.filter(b => b.status !== "completed").slice(0, 6).map(b => (
                <button key={b.id} onClick={() => { setQrValue(b.bookingNumber); }} className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: "rgba(6,182,212,0.08)", color: "var(--teal-600)" }}>{b.bookingNumber}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── ADMIN CONTENT ─── */}
      {isAdmin && currentTab === "dashboard" && (
        <div className="px-4 mt-4 space-y-3 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Выручка", value: `${mockDashboard.totalRevenue.toLocaleString()} ₽`, icon: TrendingUp, color: "#10B981" }, { label: "За месяц", value: `${mockDashboard.monthlyRevenue.toLocaleString()} ₽`, icon: TrendingUp, color: "#06B6D4" }, { label: "Броней", value: String(mockDashboard.totalBookings), icon: CalendarDays, color: "#6366F1" }, { label: "Клиентов", value: String(mockDashboard.activeUsers), icon: Users, color: "#F59E0B" }].map((c, i) => (
              <div key={i} className="surface-solid rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1"><c.icon size={12} style={{ color: c.color }} /><span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{c.label}</span></div>
                <p className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)" }}>{c.value}</p>
              </div>
            ))}
          </div>
          {mockDashboard.pendingPayments > 0 && (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
              <Bell size={20} style={{ color: "#F97316" }} />
              <div><p className="text-sm font-semibold" style={{ color: "#F97316" }}>{mockDashboard.pendingPayments} ожидают оплаты</p></div>
            </div>
          )}
          <div className="surface-solid rounded-xl p-4">
            <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "var(--font-brand)" }}>Последние бронирования</h3>
            {bookingsList.slice(0, 5).map(b => (
              <div key={b.id} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                <div><p className="text-xs font-semibold">{b.userName}</p><p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{b.date} {b.time}</p></div>
                <div className="text-right"><p className="text-xs font-bold" style={{ color: "var(--teal-600)" }}>{b.totalPrice.toLocaleString()} ₽</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdmin && currentTab === "bookings" && (
        <div className="px-4 mt-4 animate-in fade-in duration-300">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="text" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-9 pl-8 pr-3 rounded-lg surface-solid text-xs outline-none" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 px-2 rounded-lg surface-solid text-xs outline-none">
              <option value="all">Все</option><option value="pending">Ожидает</option><option value="confirmed">Подтверждено</option><option value="completed">Выполнено</option>
            </select>
          </div>
          <div className="space-y-2">
            {filteredBookings.map(b => (
              <div key={b.id} className="surface-solid rounded-xl p-3">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold" style={{ color: "var(--teal-600)" }}>{b.bookingNumber}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: b.status === "completed" ? "rgba(16,185,129,0.1)" : b.status === "confirmed" ? "rgba(6,182,212,0.1)" : "rgba(249,115,22,0.1)", color: b.status === "completed" ? "#059669" : b.status === "confirmed" ? "var(--teal-600)" : "#F97316" }}>{b.status === "completed" ? "Выполнено" : b.status === "confirmed" ? "Подтверждено" : "Ожидает"}</span>
                    </div>
                    <p className="text-sm font-semibold mt-0.5">{b.userName}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{b.date} {b.time} · {b.duration}ч · {b.boards} {b.boards === 1 ? "доска" : "доски"}</p>
                  </div>
                  <div className="text-right"><p className="text-sm font-bold">{b.totalPrice.toLocaleString()} ₽</p></div>
                </div>
                <div className="flex gap-2 mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  {b.paymentStatus === "pending" && (<><button onClick={() => confirmPayment(b.id)} className="flex-1 h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1" style={{ background: "rgba(6,182,212,0.1)", color: "var(--teal-600)" }}><CheckCircle size={12} /> Подтвердить</button><button onClick={() => declinePayment(b.id)} className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}><XCircle size={12} /></button></>)}
                  {b.status === "confirmed" && <button onClick={() => confirmVisit(b.id)} className="w-full h-8 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1" style={{ background: "linear-gradient(90deg,#10B981,#06B6D4)" }}><CheckCircle size={12} /> Подтвердить визит (+{b.earnedBonuses})</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdmin && currentTab === "users" && (
        <div className="px-4 mt-4 animate-in fade-in duration-300 space-y-4">
          {/* Staff section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Администраторы и сотрудники</h3>
            <div className="space-y-2">
              {usersList.filter(u => u.role === "admin" || u.role === "employee").map(u => (
                <div key={u.id} className="surface-solid rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: u.role === "admin" ? "linear-gradient(135deg,#F59E0B,#F97316)" : "linear-gradient(135deg,#06B6D4,#0891B2)" }}>
                    {u.role === "admin" ? <Crown size={16} className="text-white" /> : <UserCog size={16} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{u.phone}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: u.role === "admin" ? "rgba(245,158,11,0.1)" : "rgba(6,182,212,0.1)", color: u.role === "admin" ? "#F59E0B" : "#06B6D4" }}>{u.role === "admin" ? "Администратор" : "Сотрудник"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All users */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Все клиенты</h3>
            <div className="space-y-2">
              {usersList.map(u => (
                <div key={u.id} className="surface-solid rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#22D3EE,#60A5FA)" }}>
                    <span className="text-xs font-bold text-white">{u.name.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{u.phone}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{u.visitsCount} визитов</span>
                      <span className="text-[10px]" style={{ color: "var(--teal-600)" }}>{u.bonusBalance} бонусов</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0"><p className="text-xs font-bold">{u.totalSpent.toLocaleString()} ₽</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QR Tab — shared for admin & employee */}
      {isAdmin && currentTab === "qr" && (
        <div className="px-4 mt-4 animate-in fade-in duration-300">
          <button onClick={() => setShowCamera(true)} className="w-full h-16 rounded-xl text-white font-semibold text-base flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.97] mb-3" style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", fontFamily: "var(--font-brand)" }}>
            <Camera size={22} /> Сканировать камерой
          </button>
          <div className="surface-solid rounded-xl p-4 text-center">
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Или введите вручную:</p>
            <input type="text" placeholder="Например: OW123" value={qrValue} onChange={e => setQrValue(e.target.value)} className="w-full h-10 px-4 rounded-xl surface-solid text-sm text-center outline-none mb-2" />
            <button onClick={handleQrScan} className="w-full h-10 rounded-xl text-white font-semibold text-sm" style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", fontFamily: "var(--font-brand)" }}>Проверить</button>
          </div>
          <div className="mt-3 surface-solid rounded-xl p-3">
            <p className="text-[10px] mb-2" style={{ color: "var(--text-muted)" }}>Активные:</p>
            <div className="flex flex-wrap gap-1.5">
              {bookingsList.filter(b => b.status !== "completed").slice(0, 6).map(b => (
                <button key={b.id} onClick={() => { setQrValue(b.bookingNumber); }} className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: "rgba(6,182,212,0.08)", color: "var(--teal-600)" }}>{b.bookingNumber}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
