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
  // Roles
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "timestamp">) => void;
  markAllRead: () => void;
}

const defaultBooking: BookingForm = {
  date: new Date().toISOString().split("T")[0],
  time: "10:00", duration: 2, boards: 1,
  instructor: false, rescuers: false, bonusesUsed: 0, paymentMethod: "qr",
};

const defaultNotifications: Notification[] = [
  { id: "1", title: "Бронирование подтверждено", message: "Ваша бронь на 16.05 10:00 подтверждена", read: false, timestamp: "14:32" },
  { id: "2", title: "Новая акция!", message: "Скидка 20% на будние дни", read: false, timestamp: "Вчера" },
];

export const useAppStore = create<AppState>((set) => ({
  activeTab: "booking",
  setActiveTab: (tab) => set({ activeTab: tab }),
  toast: null,
  showToast: (toast) => { set({ toast }); setTimeout(() => set({ toast: null }), 3000); },
  hideToast: () => set({ toast: null }),
  bookingForm: { ...defaultBooking },
  updateBookingForm: (partial) => set((state) => ({ bookingForm: { ...state.bookingForm, ...partial } })),
  resetBookingForm: () => set({ bookingForm: { ...defaultBooking } }),
  spinsAvailable: 3,
  setSpinsAvailable: (n) => set((state) => ({ spinsAvailable: typeof n === "function" ? n(state.spinsAvailable) : n })),
  wheelPrizes: [],
  addWheelPrize: (prize) => set((state) => ({ wheelPrizes: [...state.wheelPrizes, prize] })),
  activeSubscription: null,
  setActiveSubscription: (sub) => set({ activeSubscription: sub }),
  // Roles — default is "user", change to "employee" or "admin" as needed
  userRole: "user" as UserRole,
  setUserRole: (role) => set({ userRole: role }),
  // Notifications
  notifications: defaultNotifications,
  unreadCount: defaultNotifications.filter(n => !n.read).length,
  addNotification: (n) => set((state) => {
    const newN: Notification = { ...n, id: Date.now().toString(), timestamp: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) };
    return { notifications: [newN, ...state.notifications], unreadCount: state.unreadCount + 1 };
  }),
  markAllRead: () => set((state) => ({ notifications: state.notifications.map(n => ({ ...n, read: true })), unreadCount: 0 })),
}));
