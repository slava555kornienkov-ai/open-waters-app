import { create } from "zustand";
import { findUserByPhone, createUser, updateUserSpins, addBonus, type DbUser } from "@/lib/supabase";

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
  role: UserRole;
}

interface AppState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  toast: Toast | null;
  showToast: (toast: Toast) => void;
  bookingForm: BookingForm;
  updateBookingForm: (partial: Partial<BookingForm>) => void;
  resetBookingForm: () => void;
  spinsAvailable: number;
  setSpinsAvailable: (n: number | ((prev: number) => number)) => void;
  syncSpinsFromDb: () => Promise<void>;
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
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

const defaultBooking: BookingForm = {
  date: new Date().toISOString().split("T")[0],
  time: "10:00", duration: 2, boards: 1,
  instructor: false, rescuers: false, bonusesUsed: 0, paymentMethod: "qr",
};

function dbUserToUser(dbUser: DbUser): UserData {
  return {
    name: dbUser.name,
    phone: dbUser.phone,
    bonusBalance: dbUser.bonus_balance || 0,
    visitsCount: dbUser.visits_count || 0,
    totalSpent: dbUser.total_spent || 0,
    referralCode: dbUser.referral_code || "",
    invitedCount: 0,
    earnedFromReferrals: 0,
    role: (dbUser.role as UserRole) || "user",
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: "booking",
  setActiveTab: (tab) => set({ activeTab: tab }),
  toast: null,
  showToast: (toast) => { set({ toast }); setTimeout(() => set({ toast: null }), 3000); },
  bookingForm: { ...defaultBooking },
  updateBookingForm: (partial) => set((state) => ({ bookingForm: { ...state.bookingForm, ...partial } })),
  resetBookingForm: () => set({ bookingForm: { ...defaultBooking } }),
  spinsAvailable: 0,
  setSpinsAvailable: (n) => {
    const val = typeof n === "function" ? n(get().spinsAvailable) : n;
    set({ spinsAvailable: val });
    // Sync to DB
    const phone = get().user?.phone;
    if (phone) updateUserSpins(phone, val);
  },
  syncSpinsFromDb: async () => {
    const phone = get().user?.phone;
    if (!phone) return;
    const dbUser = await findUserByPhone(phone);
    if (dbUser) set({ spinsAvailable: dbUser.spins_available || 0 });
  },
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
  user: null,
  isAuthenticated: false,

  login: async (phone: string, password: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const dbUser = await findUserByPhone(cleanPhone);
    if (!dbUser) return { success: false, error: "Аккаунт не найден" };
    if (dbUser.password !== password) return { success: false, error: "Неверный пароль" };
    const userData = dbUserToUser(dbUser);
    set({
      user: userData,
      isAuthenticated: true,
      userRole: userData.role,
      spinsAvailable: dbUser.spins_available || 0,
      notifications: [],
      unreadCount: 0,
      wheelPrizes: [],
    });
    return { success: true };
  },

  register: async (name: string, phone: string, password: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    // Check if exists
    const existing = await findUserByPhone(cleanPhone);
    if (existing) return { success: false, error: "Этот номер уже зарегистрирован" };
    // Create
    const dbUser = await createUser(name, phone, password);
    if (!dbUser) return { success: false, error: "Ошибка создания аккаунта" };
    const userData = dbUserToUser(dbUser);
    set({
      user: userData,
      isAuthenticated: true,
      userRole: "user",
      spinsAvailable: 3,
      notifications: [],
      unreadCount: 0,
      wheelPrizes: [],
    });
    return { success: true };
  },

  logoutUser: () => {
    set({
      user: null,
      isAuthenticated: false,
      userRole: "user",
      notifications: [],
      unreadCount: 0,
      wheelPrizes: [],
      spinsAvailable: 0,
    });
  },

  darkMode: localStorage.getItem("darkMode") === "true",
  setDarkMode: (v) => { localStorage.setItem("darkMode", String(v)); set({ darkMode: v }); },
}));
