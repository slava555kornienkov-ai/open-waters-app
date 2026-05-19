import { useState } from "react";
import { Clock, Gift } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { PROMOTIONS as CONFIG_PROMOTIONS } from "@/config/appConfig";

const baseUrl = import.meta.env.BASE_URL || "/";

const PROMOTIONS = CONFIG_PROMOTIONS.filter(p => p.active).map(p => ({
  id: p.id,
  title: p.title,
  description: p.description,
  badge: `До ${p.validUntil.split("-").reverse().join(".")}`,
  discount: p.discount,
  image: `/${p.image}`,
  active: p.active,
}));

export function PromotionsScreen() {
  const { showToast } = useAppStore();
  const [promoCode, setPromoCode] = useState("");

  const applyPromo = () => {
    if (!promoCode.trim()) {
      showToast({ message: "Введите промокод", type: "error" });
      return;
    }
    showToast({ message: `Промокод "${promoCode}" применен!`, type: "success" });
    setPromoCode("");
  };

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <h1
          className="text-xl font-bold text-center"
          style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}
        >
          Акции
        </h1>
      </div>

      {/* Promotions List */}
      <div className="px-4 space-y-3">
        {PROMOTIONS.map((promo, i) => (
          <div
            key={promo.id}
            className="rounded-2xl liquid-glass overflow-hidden animate-in fade-in slide-in-from-bottom-5"
            style={{ animationDelay: `${i * 120}ms`, animationDuration: "400ms" }}
          >
            {/* Image */}
            <div className="h-36 relative">
              <img
                src={`${baseUrl}${promo.image.replace(/^\//, "")}`}
                alt={promo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              {/* Discount badge */}
              <div
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-1"
                style={{ background: "rgba(249, 115, 22, 0.9)" }}
              >
                <Gift size={14} className="text-white" />
                <span className="text-white text-xs font-bold">-{promo.discount}%</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full mb-2"
                style={{ background: "rgba(6, 182, 212, 0.1)" }}
              >
                <Clock size={12} style={{ color: "var(--teal-600)" }} />
                <span className="text-[10px] font-medium" style={{ color: "var(--teal-600)" }}>
                  {promo.badge}
                </span>
              </div>
              <h3
                className="text-base font-bold"
                style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}
              >
                {promo.title}
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {promo.description}
              </p>
              <button
                onClick={() => showToast({ message: "Акция активирована!", type: "success" })}
                className="mt-3 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--teal-500)" }}
              >
                Подробнее →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code */}
      <div className="mx-4 mt-4 rounded-2xl surface-solid p-4 animate-in fade-in duration-300" style={{ animationDelay: "300ms" }}>
        <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
          У вас есть промокод?
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Введите код"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="flex-1 h-12 px-4 rounded-xl surface-solid text-sm outline-none transition-all focus:ring-2"
            style={{
              fontFamily: "var(--font-body)",
              border: "1px solid rgba(6, 182, 212, 0.15)",
            }}
          />
          <button
            onClick={applyPromo}
            className="h-12 px-5 rounded-xl glossy-glass text-sm font-semibold transition-all active:scale-95"
            style={{ color: "var(--teal-500)" }}
          >
            Применить
          </button>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}
