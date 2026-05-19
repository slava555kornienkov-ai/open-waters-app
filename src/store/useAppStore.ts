import { create } from "zustand";

type Tab = "profile" | "wheel" | "booking" | "promotions" | "support";
type UserRole = "user" | "employee" | "admin";

interface Toast {
  message: string;
  type: "success" | "error" | "info";
}

interface BookingForm {
  date: string;
  time: string;
  duration: number;
  boards: number;
  instructor: boolean;
  rescuers: boolean;
  bonusesUsed: number;
  paymentMethod: "qr" | "card";
}

interface WheelPrize {
  id: string; label: string; type: "discount" | "bonus" | "free"; value: number; color: string;
}

interface Notification {
  id: string; title: string; message: string; read: boolean; timestamp: string;
}

interface UserData {
  name: string;
  phone: string;
  bonusBalance: number;
  visitsCount: number;
  totalSpent: number;
  referralCode: string;
  invitedCount: number;
  earnedFromReferrals: number;
}

interface AppState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  toast: Toast | null;
  showToast: (toast: Toast) => void;
  hideToast: () => void;
  bookingForm: BookingForm;
  updateBookingForm: (partial: Partial<BookingForm>) => void;
  resetBookingForm: () => void;
  spinsAvailable: number;
  setSpinsAvailable: (n: number | ((prev: number) => number)) => void;
  wheelPrizes: WheelPrize[];
  addWheelPrize: (prize: WheelPrize) => void;
  activeSubscription: { hours: number; totalHours: number } | null;
  setActiveSubscription: (sub: { hours: number; totalHours: number } | null) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "timestamp">) => void;
  markAllRead: () => void;
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  updateUser: (partial: Partial<UserData>) => void;
  isAuthenticated: boolean;
  login: (userData: UserData) => void;
  logoutUser: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

const defaultBooking: BookingForm = {
  date: new Date().toISOString().split("T")[0],
  time: "10:00", duration: 2, boards: 1,
  instructor: false, rescuers: false, bonusesUsed: 0, paymentMethod: "qr",
};

// Load user from localStorage
function loadUser(): UserData | null {
  try {
    const raw = localStorage.getItem("ow_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveUser(u: UserData | null) {
  if (u) localStorage.setItem("ow_user", JSON.stringify(u));
  else localStorage.removeItem("ow_user");
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "booking",
  setActiveTab: (tab) => set({ activeTab: tab }),
  toast: null,
  showToast: (toast) => { set({ toast }); setTimeout(() => set({ toast: null }), 3000); },
  hideToast: () => set({ toast: null }),
  bookingForm: { ...defaultBooking },
  updateBookingForm: (partial) => set((state) => ({ bookingForm: { ...state.bookingForm, ...partial } })),
  resetBookingForm: () => set({ bookingForm: { ...defaultBooking } }),
  spinsAvailable: 0,
  setSpinsAvailable: (n) => set((state) => ({ spinsAvailable: typeof n === "function" ? n(state.spinsAvailable) : n })),
  wheelPrizes: [],
  addWheelPrize: (prize) => set((state) => ({ wheelPrizes: [...state.wheelPrizes, prize] })),
  activeSubscription: null,
  setActiveSubscription: (sub) => set({ activeSubscription: sub }),
  userRole: "user" as UserRole,
  setUserRole: (role) => set({ userRole: role }),
  notifications: [],
  unreadCount: 0,
  addNotification: (n) => set((state) => {
    const newN: Notification = { ...n, id: Date.now().toString(), timestamp: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) };
    return { notifications: [newN, ...state.notifications], unreadCount: state.unreadCount + 1 };
  }),
  markAllRead: () => set((state) => ({ notifications: state.notifications.map(n => ({ ...n, read: true })), unreadCount: 0 })),
  user: loadUser(),
  isAuthenticated: !!loadUser(),
  setUser: (user) => { saveUser(user); set({ user, isAuthenticated: !!user }); },
  updateUser: (partial) => set((state) => {
    const updated = state.user ? { ...state.user, ...partial } : null;
    if (updated) saveUser(updated);
    return { user: updated };
  }),
  login: (userData) => { saveUser(userData); set({ user: userData, isAuthenticated: true }); },
  logoutUser: () => { saveUser(null); localStorage.removeItem("auth_token"); set({ user: null, isAuthenticated: false, notifications: [], unreadCount: 0, wheelPrizes: [], spinsAvailable: 0 }); },
  darkMode: localStorage.getItem("darkMode") === "true",
  setDarkMode: (v) => { localStorage.setItem("darkMode", String(v)); set({ darkMode: v }); },
}));
