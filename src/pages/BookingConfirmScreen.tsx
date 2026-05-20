import { useNavigate } from "react-router";
import { CheckCircle, Copy } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { createBooking, addBonus } from "@/lib/supabase";

export function BookingConfirmScreen() {
  const navigate = useNavigate();
  const { bookingForm, showToast, user, addNotification } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePayment = async () => {
    if (isSubmitting) return;
    if (!user?.phone) { showToast({ message: "Ошибка: не авторизован", type: "error" }); return; }
    setIsSubmitting(true);

    const prices = [0, 1700, 2800, 3800, 4700];
    let base = prices[Math.min(bookingForm.duration, 4)] || 4700;
    if (bookingForm.duration > 4) base += (bookingForm.duration - 4) * 600;
    let total = base * bookingForm.boards;
    if (bookingForm.instructor) total += 2000 * bookingForm.duration;
    if (bookingForm.rescuers) total += 2500 * bookingForm.duration;
    total -= bookingForm.bonusesUsed;
    const finalTotal = Math.max(0, total);

    // Save to Supabase
    const result = await createBooking({
      user_phone: user.phone,
      date: bookingForm.date,
      time: bookingForm.time,
      duration: bookingForm.duration,
      boards: bookingForm.boards,
      instructor: bookingForm.instructor,
      rescuers: bookingForm.rescuers,
      total_price: finalTotal,
      status: "pending",
      payment_method: bookingForm.paymentMethod,
    });

    if (result) {
      // Add bonus for booking
      await addBonus(user.phone, Math.round(finalTotal * 0.05));
      addNotification({ title: "Бронирование создано", message: `${bookingForm.date}, ${bookingForm.time} — ${bookingForm.duration} часа, ${finalTotal.toLocaleString()} ₽`, read: false });
      showToast({ message: "Бронирование создано в БД!", type: "success" });
    } else {
      showToast({ message: "Ошибка сохранения в БД", type: "error" });
    }

    setIsSubmitting(false);
    setTimeout(() => navigate("/booking"), 1500);
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText("+79141393120").then(() => {
      setCopied(true);
      showToast({ message: "Номер скопирован!", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const total = (() => {
    const prices = [0, 1700, 2800, 3800, 4700];
    let base = prices[Math.min(bookingForm.duration, 4)] || 4700;
    if (bookingForm.duration > 4) base += (bookingForm.duration - 4) * 600;
    let total = base * bookingForm.boards;
    if (bookingForm.instructor) total += 2000 * bookingForm.duration;
    if (bookingForm.rescuers) total += 2500 * bookingForm.duration;
    total -= bookingForm.bonusesUsed;
    return Math.max(0, total);
  })();

  return (
    <div className="min-h-full pb-4">
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="w-8 h-8 rounded-full surface-solid flex items-center justify-center active:scale-90 transition-transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-primary)" }}><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Подтверждение</h1>
      </div>

      <div className="mx-4 mt-4 rounded-2xl liquid-glass p-6 flex flex-col items-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #06B6D4, #10B981)" }}>
          <CheckCircle size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold mt-4 text-center" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Бронирование создано!</h2>
        <p className="text-sm mt-2 text-center" style={{ color: "var(--text-secondary)" }}>{bookingForm.date}, {bookingForm.time}</p>

        <div className="w-full mt-5 space-y-2">
          {[
            { label: "Длительность", value: `${bookingForm.duration} часа` },
            { label: "Досок", value: String(bookingForm.boards) },
            { label: "Инструктор", value: bookingForm.instructor ? "Да" : "Нет" },
            { label: "Спасатели", value: bookingForm.rescuers ? "Да" : "Нет" },
            { label: "Бонусы", value: `-${bookingForm.bonusesUsed.toLocaleString()}` },
          ].map((row, i) => (
            <div key={i} className="flex justify-between py-2"><span className="text-sm" style={{ color: "var(--text-secondary)" }}>{row.label}</span><span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{row.value}</span></div>
          ))}
          <div className="flex justify-between pt-3 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-brand)" }}>Стоимость</span>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--teal-600)" }}>{total.toLocaleString()} ₽</span>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-2xl surface-solid p-5 flex flex-col items-center">
        {bookingForm.paymentMethod === "card" ? (
          <>
            <p className="text-sm font-medium mb-3 text-center" style={{ color: "var(--text-primary)" }}>Перевод на карту</p>
            <div className="w-full p-4 rounded-xl text-center" style={{ background: "rgba(6,182,212,0.06)" }}>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-brand)" }}>+7 (914)-139-31-20</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>ВТБ</p>
              <p className="text-sm mt-1 font-medium" style={{ color: "var(--text-primary)" }}>Евгения К.</p>
            </div>
            <button onClick={copyCardNumber} className="flex items-center gap-2 mt-3 text-sm font-medium" style={{ color: "var(--teal-500)" }}>
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? "Скопировано!" : "Скопировать номер"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>Оплатите по QR-коду</p>
            <div className="bg-white p-3 rounded-xl shadow-sm"><QRCodeSVG value={`ow-payment-${Date.now()}`} size={140} level="M" /></div>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Сканируйте в приложении банка</p>
          </>
        )}
      </div>

      <div className="mx-4 mt-4 space-y-2">
        <button onClick={handlePayment} disabled={isSubmitting}
          className="w-full h-14 rounded-xl text-white font-semibold text-base transition-all active:scale-[0.97] disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", fontFamily: "var(--font-brand)" }}>
          {isSubmitting ? "Сохранение в БД..." : "Я оплатил"}
        </button>
        <button onClick={() => navigate("/booking")} className="w-full h-12 rounded-xl text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Изменить бронь</button>
      </div>
    </div>
  );
}
