import { useNavigate } from "react-router";
import { CheckCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { QRCodeSVG } from "qrcode.react";

export function BookingConfirmScreen() {
  const navigate = useNavigate();
  const { bookingForm, showToast } = useAppStore();

  const handlePayment = () => {
    showToast({ message: "Оплата ожидает подтверждения", type: "success" });
    setTimeout(() => navigate("/booking"), 1500);
  };

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate("/booking")}
          className="w-8 h-8 rounded-full surface-solid flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-primary)" }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}
        >
          Подтверждение
        </h1>
      </div>

      {/* Success Card */}
      <div className="mx-4 mt-4 rounded-2xl liquid-glass p-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-400">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center animate-in zoom-in duration-500"
          style={{
            background: "linear-gradient(135deg, #06B6D4, #10B981)",
            animationDelay: "200ms",
          }}
        >
          <CheckCircle size={28} className="text-white" />
        </div>
        <h2
          className="text-xl font-bold mt-4 text-center"
          style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}
        >
          Бронирование создано!
        </h2>
        <p className="text-sm mt-2 text-center" style={{ color: "var(--text-secondary)" }}>
          {bookingForm.date}, {bookingForm.time} - {String(Number(bookingForm.time.split(":")[0]) + bookingForm.duration).padStart(2, "0")}:00
        </p>

        {/* Details */}
        <div className="w-full mt-5 space-y-2">
          {[
            { label: "Длительность", value: `${bookingForm.duration} часа` },
            { label: "Досок", value: String(bookingForm.boards) },
            { label: "Инструктор", value: bookingForm.instructor ? "Да" : "Нет" },
            { label: "Спасатели", value: bookingForm.rescuers ? "Да" : "Нет" },
            { label: "Бонусы", value: `-${bookingForm.bonusesUsed.toLocaleString()}` },
          ].map((row, i) => (
            <div
              key={i}
              className="flex justify-between py-2 animate-in fade-in slide-in-from-left-3 duration-300"
              style={{ animationDelay: `${400 + i * 80}ms` }}
            >
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {row.label}
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {row.value}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <span
              className="text-base font-bold"
              style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}
            >
              Стоимость
            </span>
            <span
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-brand)", color: "var(--teal-600)" }}
            >
              {(() => {
                const prices = [0, 1700, 2800, 3800, 4700];
                let base = prices[Math.min(bookingForm.duration, 4)] || 4700;
                if (bookingForm.duration > 4) base += (bookingForm.duration - 4) * 600;
                let total = base * bookingForm.boards;
                if (bookingForm.instructor) total += 2000 * bookingForm.duration;
                if (bookingForm.rescuers) total += 2500 * bookingForm.duration;
                total -= bookingForm.bonusesUsed;
                return total.toLocaleString();
              })()} ₽
            </span>
          </div>
        </div>
      </div>

      {/* Payment QR */}
      <div className="mx-4 mt-4 rounded-2xl surface-solid p-5 flex flex-col items-center animate-in fade-in slide-in-from-bottom-5 duration-400" style={{ animationDelay: "300ms" }}>
        <p className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
          Оплатите по QR-коду
        </p>
        <div className="bg-white p-3 rounded-xl shadow-sm">
          <QRCodeSVG
            value={`ow-payment-${Date.now()}`}
            size={140}
            level="M"
          />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Сканируйте в приложении банка
        </p>
      </div>

      {/* Actions */}
      <div className="mx-4 mt-4 space-y-2">
        <button
          onClick={handlePayment}
          className="w-full h-14 rounded-xl glossy-glass text-white font-semibold text-base transition-all active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #06B6D4, #0891B2)",
            fontFamily: "var(--font-brand)",
          }}
        >
          Я оплатил
        </button>
        <button
          onClick={() => navigate("/booking")}
          className="w-full h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
          style={{ color: "var(--text-secondary)" }}
        >
          Изменить бронь
        </button>
      </div>
    </div>
  );
}
