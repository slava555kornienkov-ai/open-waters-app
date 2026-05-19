import { useState } from "react";
import { useNavigate } from "react-router";
import { Minus, Plus, Check, QrCode, CreditCard, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { PRICING, SUBSCRIPTIONS } from "@/config/appConfig";

const baseUrl = import.meta.env.BASE_URL || "/";

const WEEKDAY_PRICES: Record<number, number> = {};
for (const p of PRICING.basePrices) { WEEKDAY_PRICES[p.duration] = p.price; }
const WEEKEND_PRICES: Record<number, number> = { 1: 2000, 2: 3200, 3: 4200, 4: 5000 };
const EXTRA_HOUR_WEEKDAY = PRICING.extraHourPrice;
const EXTRA_HOUR_WEEKEND = 700;

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const DAYS_SHORT = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function getMonthDays(year: number, month: number): { date: string; day: number; isToday: boolean; isPast: boolean }[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon=0
  const today = new Date();
  today.setHours(0,0,0,0);
  const days: { date: string; day: number; isToday: boolean; isPast: boolean }[] = [];
  // Empty cells before start
  for (let i = 0; i < startDayOfWeek; i++) days.push({ date: "", day: 0, isToday: false, isPast: true });
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split("T")[0];
    days.push({ date: dateStr, day: d, isToday: date.getTime() === today.getTime(), isPast: date < today });
  }
  return days;
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  return day === 0 || day === 6;
}

function calculateTotal(weekend: boolean, hours: number, boards: number, instructor: boolean, rescuers: boolean, bonusesUsed: number): number {
  const prices = weekend ? WEEKEND_PRICES : WEEKDAY_PRICES;
  let basePrice = 0;
  if (hours <= 4) {
    basePrice = prices[hours] || 0;
  } else {
    basePrice = prices[4] || 0;
    const extraRate = weekend ? EXTRA_HOUR_WEEKEND : EXTRA_HOUR_WEEKDAY;
    basePrice += (hours - 4) * extraRate;
  }
  let total = basePrice * boards;
  if (instructor) total += PRICING.extras.instructor.pricePerHour * hours;
  if (rescuers) total += PRICING.extras.rescuers.pricePerHour * hours;
  total -= bonusesUsed;
  return Math.max(0, total);
}

export function BookingScreen() {
  const navigate = useNavigate();
  const { bookingForm, updateBookingForm, showToast } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(bookingForm.date);
  const [selectedTime, setSelectedTime] = useState(bookingForm.time);
  const [duration, setDuration] = useState(bookingForm.duration);
  const [boards, setBoards] = useState(bookingForm.boards);
  const [instructor, setInstructor] = useState(bookingForm.instructor);
  const [rescuers, setRescuers] = useState(bookingForm.rescuers);
  const [bonusesUsed, setBonusesUsed] = useState(bookingForm.bonusesUsed);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card">("qr");
  const [showPricing, setShowPricing] = useState(false);
  const [pricingTab, setPricingTab] = useState<"weekday" | "weekend">("weekday");

  // Calendar state - month view
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  // Subscription modal
  const [subModal, setSubModal] = useState<typeof SUBSCRIPTIONS[0] | null>(null);

  const weekend = isWeekend(selectedDate);
  const userBonuses = 1250;
  const maxDuration = selectedTime ? Math.min(11, 21 - parseInt(selectedTime.split(":")[0])) : 11;
  const total = calculateTotal(weekend, duration, boards, instructor, rescuers, bonusesUsed);
  const maxBonuses = Math.floor(total * 0.3);
  const timeSlots = Array.from({ length: 11 }, (_, i) => `${10 + i}:00`);
  const calendarDays = getMonthDays(calYear, calMonth);

  const changeMonth = (delta: number) => {
    let newMonth = calMonth + delta;
    let newYear = calYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setCalMonth(newMonth);
    setCalYear(newYear);
  };

  const handleBook = () => {
    updateBookingForm({ date: selectedDate, time: selectedTime, duration, boards, instructor, rescuers, bonusesUsed, paymentMethod });
    showToast({ message: "Бронирование создано!", type: "success" });
    navigate("/booking-confirm");
  };

  const handleBuySubscription = (sub: typeof SUBSCRIPTIONS[0]) => {
    // Save subscription data and redirect to confirmation
    updateBookingForm({ paymentMethod });
    navigate("/subscription-confirm", { state: { sub } });
    setSubModal(null);
  };

  return (
    <div className="min-h-full pb-4">
      {/* Subscription Modal */}
      {subModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => setSubModal(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-[430px] mx-auto surface-solid rounded-t-2xl p-5 animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
              Абонемент на {subModal.hours} часов
            </h3>
            <p className="text-2xl font-bold mt-2" style={{ color: "var(--teal-600)" }}>{subModal.price.toLocaleString()} ₽</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Экономия {subModal.savings}% по сравнению с разовой арендой
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm"><span style={{ color: "var(--text-secondary)" }}>Часов</span><span className="font-semibold">{subModal.hours}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: "var(--text-secondary)" }}>Стоимость</span><span className="font-semibold">{subModal.price.toLocaleString()} ₽</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: "var(--text-secondary)" }}>Экономия</span><span className="font-semibold" style={{ color: "#10B981" }}>{subModal.savings}%</span></div>
            </div>
            <button
              onClick={() => handleBuySubscription(subModal)}
              className="w-full mt-5 h-12 rounded-xl text-white font-semibold transition-all active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", fontFamily: "var(--font-brand)" }}
            >
              Купить абонемент
            </button>
            <button onClick={() => setSubModal(null)} className="w-full mt-2 h-10 text-sm transition-opacity hover:opacity-70" style={{ color: "var(--text-muted)" }}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <img src={`${baseUrl}logo-user.jpg`} alt="Open Waters" className="w-9 h-9 object-cover rounded-full" />
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
          Бронирование
        </h1>
      </div>

      {/* Hero Image */}
      <div className="mx-4 rounded-2xl overflow-hidden h-28 relative animate-in fade-in zoom-in-95 duration-500">
        <img src={`${baseUrl}hero-sup.jpg`} alt="SUP boards" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <p className="text-white text-xs opacity-90">Open Waters</p>
          <p className="text-white text-base font-bold" style={{ fontFamily: "var(--font-brand)" }}>Аренда SUP</p>
        </div>
      </div>

      {/* Pricing Block */}
      <div className="mx-4 mt-3 rounded-2xl liquid-glass p-4 animate-in fade-in slide-in-from-bottom-5 duration-400">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
            Стоимость аренды
          </h3>
          <button onClick={() => setShowPricing(!showPricing)} className="text-xs font-medium transition-opacity hover:opacity-70" style={{ color: "var(--teal-500)" }}>
            {showPricing ? "Скрыть" : "Показать"}
          </button>
        </div>
        {showPricing && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-1 p-1 rounded-xl surface-solid mb-3">
              {(["weekday","weekend"] as const).map((tab) => (
                <button key={tab} onClick={() => setPricingTab(tab)} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: pricingTab === tab ? "white" : "transparent", color: pricingTab === tab ? "var(--teal-600)" : "var(--text-muted)", boxShadow: pricingTab === tab ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>
                  {tab === "weekday" ? "Будни" : "Выходные"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(pricingTab === "weekday"
                ? Object.entries(WEEKDAY_PRICES).map(([h,p]) => ({ hours: Number(h), price: p, extra: h === "4" ? `+${EXTRA_HOUR_WEEKDAY}/ч` : "" }))
                : Object.entries(WEEKEND_PRICES).map(([h,p]) => ({ hours: Number(h), price: p, extra: h === "4" ? `+${EXTRA_HOUR_WEEKEND}/ч` : "" }))
              ).map((item) => (
                <div key={item.hours} className="surface-solid rounded-lg p-2.5 text-center">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.hours} {item.hours === 1 ? "час" : item.hours < 5 ? "часа" : "часов"}</span>
                  <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text-primary)", fontFamily: "var(--font-brand)" }}>{item.price.toLocaleString()} ₽</p>
                  {item.extra && <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{item.extra}</span>}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex justify-between text-xs"><span style={{ color: "var(--text-secondary)" }}>Инструктор</span><span className="font-semibold">2 000 ₽/час</span></div>
              <div className="flex justify-between text-xs mt-1"><span style={{ color: "var(--text-secondary)" }}>Спасатели</span><span className="font-semibold">2 500 ₽/час</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Cards - CLICKABLE */}
      <div className="mt-3 px-4">
        <h3 className="text-sm font-bold mb-2" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Абонементы</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {SUBSCRIPTIONS.map((sub) => (
            <button
              key={sub.hours}
              onClick={() => setSubModal(sub)}
              className="flex-shrink-0 w-[170px] surface-solid rounded-xl p-4 snap-start text-left transition-all active:scale-[0.97] hover:shadow-md"
              style={{ boxShadow: "0 2px 12px rgba(8,145,178,0.06)" }}
            >
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
                {sub.hours} <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>часов</span>
              </p>
              <p className="text-base font-bold mt-1" style={{ color: "var(--teal-600)" }}>{sub.price.toLocaleString()} ₽</p>
              <div className="flex items-center justify-between mt-2">
                <div className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                  Экономия {sub.savings}%
                </div>
                <ShoppingCart size={14} style={{ color: "var(--teal-500)" }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MONTH CALENDAR PICKER */}
      <div className="mx-4 mt-3 rounded-2xl surface-solid p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Выберите дату</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform" style={{ background: "rgba(6,182,212,0.08)" }}>
              <ChevronLeft size={16} style={{ color: "var(--teal-600)" }} />
            </button>
            <span className="text-xs font-semibold min-w-[90px] text-center" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
              {MONTHS[calMonth]} {calYear}
            </span>
            <button onClick={() => changeMonth(1)} className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform" style={{ background: "rgba(6,182,212,0.08)" }}>
              <ChevronRight size={16} style={{ color: "var(--teal-600)" }} />
            </button>
          </div>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_SHORT.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium py-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{d}</div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day.date) return <div key={`empty-${i}`} className="h-8" />;
            const isSelected = selectedDate === day.date;
            return (
              <button
                key={day.date}
                onClick={() => !day.isPast && setSelectedDate(day.date)}
                disabled={day.isPast}
                className="h-8 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center active:scale-90"
                style={{
                  background: isSelected ? "#06B6D4" : day.isToday ? "rgba(6,182,212,0.08)" : "transparent",
                  color: isSelected ? "white" : day.isPast ? "var(--text-muted)" : day.isToday ? "var(--teal-600)" : "var(--text-primary)",
                  textDecoration: day.isPast ? "line-through" : "none",
                  fontFamily: "var(--font-brand)",
                  border: day.isToday && !isSelected ? "1px solid rgba(6,182,212,0.3)" : "none",
                }}
              >
                {day.day}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] mt-2 text-center" style={{ color: "var(--text-muted)" }}>
          Выбрано: {new Date(selectedDate + "T12:00:00").toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Time Picker */}
      <div className="mx-4 mt-3 rounded-2xl surface-solid p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Время начала</h3>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>10:00 - 21:00</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {timeSlots.map((slot) => {
            const isSelected = selectedTime === slot;
            const hour = parseInt(slot.split(":")[0]);
            const todayStr = new Date().toISOString().split("T")[0];
            const isPast = selectedDate === todayStr && hour <= new Date().getHours();
            return (
              <button key={slot} onClick={() => !isPast && setSelectedTime(slot)} disabled={isPast}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 disabled:opacity-40"
                style={{ background: isSelected ? "#06B6D4" : isPast ? "rgba(148,163,184,0.1)" : "rgba(6,182,212,0.08)", color: isSelected ? "white" : isPast ? "var(--text-muted)" : "var(--text-primary)", textDecoration: isPast ? "line-through" : "none" }}>
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div className="mx-4 mt-3 rounded-2xl surface-solid p-4">
        <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Длительность</h3>
        <div className="flex items-center gap-4 justify-center">
          <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: "rgba(6,182,212,0.08)" }}>
            <Minus size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
          <span className="text-lg font-bold min-w-[80px] text-center" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
            {duration} {duration === 1 ? "час" : duration < 5 ? "часа" : "часов"}
          </span>
          <button onClick={() => setDuration(Math.min(maxDuration, duration + 1))} className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: "rgba(6,182,212,0.08)" }}>
            <Plus size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
        {selectedTime && (
          <p className="text-[10px] mt-2 text-center" style={{ color: "var(--text-muted)" }}>
            Максимум {maxDuration} {maxDuration === 1 ? "час" : maxDuration < 5 ? "часа" : "часов"} с {selectedTime}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="mx-4 mt-3 rounded-2xl surface-solid p-4">
        <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Дополнительно</h3>
        {[
          { label: "Инструктор", price: "2 000 ₽/час", value: instructor, onChange: () => setInstructor(!instructor) },
          { label: "Спасатели", price: "2 500 ₽/час", value: rescuers, onChange: () => setRescuers(!rescuers) },
        ].map((opt) => (
          <button key={opt.label} onClick={opt.onChange} className="w-full flex items-center justify-between py-2.5 transition-opacity active:opacity-70">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-md flex items-center justify-center transition-all" style={{ background: opt.value ? "#06B6D4" : "transparent", border: opt.value ? "none" : "2px solid rgba(6,182,212,0.2)" }}>
                {opt.value && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>{opt.label}</span>
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{opt.price}</span>
          </button>
        ))}
        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>Количество досок</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setBoards(Math.max(1, boards - 1))} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90" style={{ background: "rgba(6,182,212,0.08)" }}>
              <Minus size={14} style={{ color: "var(--text-secondary)" }} />
            </button>
            <span className="text-base font-bold min-w-[24px] text-center" style={{ fontFamily: "var(--font-brand)" }}>{boards}</span>
            <button onClick={() => setBoards(Math.min(20, boards + 1))} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90" style={{ background: "rgba(6,182,212,0.08)" }}>
              <Plus size={14} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Bonuses */}
      <div className="mx-4 mt-3 rounded-2xl surface-solid p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Бонусы</h3>
          <span className="text-xs font-semibold" style={{ color: "var(--teal-600)" }}>Доступно: {userBonuses.toLocaleString()}</span>
        </div>
        <input type="range" min={0} max={Math.min(userBonuses, maxBonuses)} step={10} value={bonusesUsed}
          onChange={(e) => setBonusesUsed(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #06B6D4 ${(bonusesUsed / Math.min(userBonuses, maxBonuses || 1)) * 100}%, rgba(6,182,212,0.15) ${(bonusesUsed / Math.min(userBonuses, maxBonuses || 1)) * 100}%)` }} />
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>0</span>
          <span className="text-sm font-bold" style={{ color: "var(--teal-600)" }}>-{bonusesUsed.toLocaleString()}</span>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{Math.min(userBonuses, maxBonuses).toLocaleString()}</span>
        </div>
        <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>Максимум 30% от стоимости</p>
      </div>

      {/* Payment Method */}
      <div className="mx-4 mt-3 rounded-2xl surface-solid p-4">
        <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Способ оплаты</h3>
        <div className="flex gap-3">
          {[{ key: "qr" as const, label: "QR-код", Icon: QrCode }, { key: "card" as const, label: "На карту", Icon: CreditCard }].map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setPaymentMethod(key)}
              className="flex-1 flex items-center gap-2 p-3 rounded-xl transition-all active:scale-[0.98]"
              style={{ background: paymentMethod === key ? "rgba(6,182,212,0.08)" : "rgba(248,250,252,1)", border: paymentMethod === key ? "2px solid #06B6D4" : "2px solid transparent" }}>
              <Icon size={18} style={{ color: paymentMethod === key ? "#06B6D4" : "var(--text-muted)" }} />
              <span className="text-sm font-medium" style={{ color: paymentMethod === key ? "#06B6D4" : "var(--text-secondary)" }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Total + Book Button */}
      <div className="mx-4 mt-4 mb-4">
        <div className="surface-solid rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Итого</span>
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--teal-600)" }}>{total.toLocaleString()} ₽</span>
          </div>
          <button onClick={handleBook}
            className="w-full h-14 rounded-xl glossy-glass text-white font-semibold text-base transition-all active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", fontFamily: "var(--font-brand)" }}>
            Забронировать
          </button>
        </div>
      </div>
    </div>
  );
}