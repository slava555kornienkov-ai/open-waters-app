import { useNavigate, useLocation } from "react-router";
import { CheckCircle, CreditCard, Copy } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export function SubscriptionConfirmScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, setActiveSubscription } = useAppStore();
  const [copied, setCopied] = useState(false);

  const sub = (location.state as { sub?: { hours: number; price: number; savings: number } } | null)?.sub;
  const paymentMethod = useAppStore((s) => s.bookingForm.paymentMethod);

  const handlePayment = () => {
    if (sub) {
      setActiveSubscription({ hours: 0, totalHours: sub.hours });
    }
    showToast({ message: "Оплата ожидает подтверждения", type: "success" });
    setTimeout(() => navigate("/booking"), 1500);
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText("+79141393120").then(() => {
      setCopied(true);
      showToast({ message: "Номер скопирован!", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!sub) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p style={{ color: "var(--text-muted)" }}>Данные абонемента не найдены</p>
      </div>
    );
  }

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
        <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
          Подтверждение
        </h1>
      </div>

      {/* Success Card */}
      <div className="mx-4 mt-4 rounded-2xl liquid-glass p-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-400">
        <div className="w-14 h-14 rounded-full flex items-center justify-center animate-in zoom-in duration-500" style={{ background: "linear-gradient(135deg, #06B6D4, #10B981)", animationDelay: "200ms" }}>
          <CheckCircle size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold mt-4 text-center" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
          Абонемент выбран!
        </h2>
        <p className="text-sm mt-2 text-center" style={{ color: "var(--text-secondary)" }}>
          {sub.hours} часов аренды SUP-борда
        </p>

        {/* Details */}
        <div className="w-full mt-5 space-y-2">
          {[
            { label: "Часов", value: String(sub.hours) },
            { label: "Стоимость", value: `${sub.price.toLocaleString()} ₽` },
            { label: "Экономия", value: `${sub.savings}%`, color: "#10B981" },
          ].map((row, i) => (
            <div key={i} className="flex justify-between py-2 animate-in fade-in slide-in-from-left-3 duration-300" style={{ animationDelay: `${400 + i * 80}ms` }}>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{row.label}</span>
              <span className="text-sm font-medium" style={{ color: (row as Record<string, string>).color || "var(--text-primary)" }}>{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Итого</span>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--teal-600)" }}>{sub.price.toLocaleString()} ₽</span>
          </div>
        </div>
      </div>

      {/* Payment — QR or Card Transfer */}
      <div className="mx-4 mt-4 rounded-2xl surface-solid p-5 flex flex-col items-center animate-in fade-in slide-in-from-bottom-5 duration-400" style={{ animationDelay: "300ms" }}>
        {paymentMethod === "card" ? (
          <>
            <p className="text-sm font-medium mb-3 text-center" style={{ color: "var(--text-primary)" }}>
              Перевод на карту
            </p>
            <div className="w-full p-4 rounded-xl text-center" style={{ background: "rgba(6,182,212,0.06)" }}>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-brand)" }}>
                +7 (914)-139-31-20
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>ВТБ</p>
              <p className="text-sm mt-1 font-medium" style={{ color: "var(--text-primary)" }}>Евгения К.</p>
            </div>
            <button
              onClick={copyCardNumber}
              className="flex items-center gap-2 mt-3 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--teal-500)" }}
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? "Скопировано!" : "Скопировать номер"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
              Оплатите по QR-коду
            </p>
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <QRCodeSVG value={`ow-sub-${sub.hours}h-${Date.now()}`} size={140} level="M" />
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Сканируйте в приложении банка</p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="mx-4 mt-4 space-y-2">
        <button
          onClick={handlePayment}
          className="w-full h-14 rounded-xl glossy-glass text-white font-semibold text-base transition-all active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", fontFamily: "var(--font-brand)" }}
        >
          Я оплатил
        </button>
        <button
          onClick={() => navigate("/booking")}
          className="w-full h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
          style={{ color: "var(--text-secondary)" }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
