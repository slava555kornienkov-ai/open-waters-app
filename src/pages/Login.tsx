import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Phone, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function Login() {
  const navigate = useNavigate();
  const { showToast, login } = useAppStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const baseUrl = import.meta.env.BASE_URL || "/";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) { showToast({ message: "Заполните все поля", type: "error" }); return; }
    if (mode === "register" && !name.trim()) { showToast({ message: "Введите имя", type: "error" }); return; }
    if (password.length < 4) { showToast({ message: "Пароль минимум 4 символа", type: "error" }); return; }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const userName = mode === "register" ? name : ("Пользователь " + phone);
      const referralCode = `OW-${Math.floor(Math.random() * 9000 + 1000)}`;
      login({
        name: userName,
        phone: phone,
        bonusBalance: mode === "register" ? 300 : 0,
        visitsCount: 0,
        totalSpent: 0,
        referralCode,
        invitedCount: 0,
        earnedFromReferrals: 0,
      });
      showToast({ message: mode === "register" ? "Регистрация успешна! +300 бонусов" : "Добро пожаловать!", type: "success" });
      navigate("/booking");
    }, 800);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").replace(/^7/, "").slice(0, 10);
    let formatted = "+7";
    if (digits.length > 0) formatted += ` (${digits.slice(0, 3)}`;
    if (digits.length >= 3) formatted += `) ${digits.slice(3, 6)}`;
    if (digits.length >= 6) formatted += `-${digits.slice(6, 8)}`;
    if (digits.length >= 8) formatted += `-${digits.slice(8, 10)}`;
    return formatted;
  };

  return (
    <div className="app-viewport flex flex-col items-center justify-center min-h-screen px-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #22D3EE, transparent)", filter: "blur(80px)" }} />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #60A5FA, transparent)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", boxShadow: "0 12px 40px rgba(6, 182, 212, 0.35)" }}>
            <img src={`${baseUrl}logo-user.jpg`} alt="Open Waters" className="w-16 h-16 object-cover rounded-2xl" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Open Waters</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Аренда SUP-бордов</p>
        </div>

        <div className="rounded-2xl liquid-glass p-6">
          <div className="flex gap-1 p-1 rounded-xl surface-solid mb-6">
            {(["login","register"] as const).map((tab) => (
              <button key={tab} onClick={() => setMode(tab)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: mode === tab ? "white" : "transparent", color: mode === tab ? "var(--teal-600)" : "var(--text-muted)", boxShadow: mode === tab ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>
                {tab === "login" ? "Вход" : "Регистрация"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input type="text" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl surface-solid text-sm outline-none" style={{ color: "var(--text-primary)" }} />
              </div>
            )}
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="tel" placeholder="+7 (999) 000-00-00" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))}
                className="w-full h-12 pl-11 pr-4 rounded-xl surface-solid text-sm outline-none" style={{ color: "var(--text-primary)", letterSpacing: "0.5px" }} />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type={showPassword ? "text" : "password"} placeholder="Пароль (мин. 4 символа)" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-11 rounded-xl surface-solid text-sm outline-none" style={{ color: "var(--text-primary)" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                {showPassword ? <EyeOff size={18} style={{ color: "var(--text-muted)" }} /> : <Eye size={18} style={{ color: "var(--text-muted)" }} />}
              </button>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full h-12 rounded-xl glossy-glass text-white font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", fontFamily: "var(--font-brand)" }}>
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn size={16} /> {mode === "login" ? "Войти" : "Зарегистрироваться"}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
