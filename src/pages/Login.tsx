import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LogIn, AlertCircle, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

function verifyTelegramInitData(initData: string): { valid: boolean; user?: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string } } {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    const userStr = params.get("user");
    if (!hash || !userStr) return { valid: false };
    const user = JSON.parse(userStr);
    if (!user?.id) return { valid: false };
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { showToast, login, isAuthenticated } = useAppStore();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/booking");
      return;
    }

    // Try Telegram auto-auth
    const tg = window.Telegram?.WebApp;
    if (tg?.initData) {
      const result = verifyTelegramInitData(tg.initData);
      if (result.valid && result.user) {
        const u = result.user;
        const referralCode = `OW-${u.first_name.toUpperCase().replace(/\s/g, "-")}-${Math.floor(Math.random() * 9000 + 1000)}`;
        login({
          name: `${u.first_name}${u.last_name ? ` ${u.last_name}` : ""}`,
          phone: u.username ? `@${u.username}` : "",
          bonusBalance: 300,
          visitsCount: 0,
          totalSpent: 0,
          referralCode,
          invitedCount: 0,
          earnedFromReferrals: 0,
        });
        showToast({ message: "Добро пожаловать! +300 бонусов", type: "success" });
        navigate("/booking");
        return;
      }
    }

    setIsLoading(false);
  }, [isAuthenticated, navigate, login, showToast]);

  const handleAuth = () => {
    setError("");
    const tg = window.Telegram?.WebApp;

    if (tg?.initData) {
      const result = verifyTelegramInitData(tg.initData);
      if (result.valid && result.user) {
        const u = result.user;
        const referralCode = `OW-${u.first_name.toUpperCase().replace(/\s/g, "-")}-${Math.floor(Math.random() * 9000 + 1000)}`;
        login({
          name: `${u.first_name}${u.last_name ? ` ${u.last_name}` : ""}`,
          phone: u.username ? `@${u.username}` : "",
          bonusBalance: 300,
          visitsCount: 0,
          totalSpent: 0,
          referralCode,
          invitedCount: 0,
          earnedFromReferrals: 0,
        });
        showToast({ message: "Добро пожаловать! +300 бонусов", type: "success" });
        navigate("/booking");
        return;
      }
    }

    setError("Откройте приложение через Telegram Bot");
  };

  const baseUrl = import.meta.env.BASE_URL || "/";

  if (isLoading) {
    return (
      <div className="app-viewport flex flex-col items-center justify-center min-h-screen px-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-cyan-200 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Загрузка...</p>
        </div>
      </div>
    );
  }

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
          <h2 className="text-lg font-bold text-center mb-2" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Добро пожаловать</h2>
          <p className="text-sm text-center mb-5" style={{ color: "var(--text-secondary)" }}>
            Войдите через Telegram для безопасного доступа
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            onClick={handleAuth}
            className="w-full h-14 rounded-xl glossy-glass text-white font-semibold text-base transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", fontFamily: "var(--font-brand)" }}
          >
            <LogIn size={18} /> Войти через Telegram
          </button>
        </div>

        <p className="text-xs text-center mt-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Авторизация через Telegram ID.<br />
          Невозможно зайти в чужой аккаунт.
        </p>
      </div>
    </div>
  );
}
