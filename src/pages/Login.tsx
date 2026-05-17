import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LogIn, AlertCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { trpc } from "@/providers/trpc";

export default function Login() {
  const navigate = useNavigate();
  const { showToast, login, isAuthenticated } = useAppStore();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // tRPC mutation for Telegram auth
  const verifyMutation = trpc.telegramAuth.verify.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      login({
        name: data.name,
        phone: data.phone,
        bonusBalance: data.bonusBalance,
        visitsCount: data.visitsCount,
        totalSpent: data.totalSpent,
        referralCode: data.referralCode,
        invitedCount: 0,
        earnedFromReferrals: 0,
      });
      setIsLoading(false);
      showToast({ message: data.bonusBalance === 300 ? "Добро пожаловать! +300 бонусов" : "С возвращением!", type: "success" });
      navigate("/booking");
    },
    onError: (err) => {
      setIsLoading(false);
      setError(err.message || "Ошибка авторизации");
      showToast({ message: "Ошибка авторизации", type: "error" });
    },
  });

  // Auto-login via Telegram WebApp
  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated) {
      navigate("/booking");
      return;
    }

    const tg = window.Telegram?.WebApp;
    if (!tg) {
      // Not in Telegram — show manual connect
      setIsLoading(false);
      return;
    }

    // We're inside Telegram — auto auth with initData
    const initData = tg.initData;
    if (!initData) {
      setError("Не удалось получить данные Telegram");
      return;
    }

    // Already have token? Check it
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Token exists, user is authenticated
      setIsLoading(true);
      // User data loaded from localStorage via store
      if (isAuthenticated) {
        navigate("/booking");
        return;
      }
    }

    // Verify Telegram data
    setIsLoading(true);
    verifyMutation.mutate({ initData });
  }, []);

  // Manual Telegram auth button (for testing outside Telegram)
  const handleManualAuth = () => {
    setError("");
    setIsLoading(true);
    
    // Try to get Telegram WebApp data
    const tg = window.Telegram?.WebApp;
    if (tg?.initData) {
      verifyMutation.mutate({ initData: tg.initData });
    } else {
      setIsLoading(false);
      setError("Откройте приложение через Telegram для авторизации");
    }
  };

  const baseUrl = import.meta.env.BASE_URL || "/";

  return (
    <div className="app-viewport flex flex-col items-center justify-center min-h-screen px-6 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #22D3EE, transparent)", filter: "blur(80px)" }} />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #60A5FA, transparent)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", boxShadow: "0 12px 40px rgba(6, 182, 212, 0.35)" }}>
            <img src={`${baseUrl}logo-user.jpg`} alt="Open Waters" className="w-16 h-16 object-cover rounded-2xl" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Open Waters</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Аренда SUP-бордов</p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl liquid-glass p-6">
          <h2 className="text-lg font-bold text-center mb-2" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
            Добро пожаловать
          </h2>
          <p className="text-sm text-center mb-5" style={{ color: "var(--text-secondary)" }}>
            Войдите через Telegram для безопасного доступа
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-10 h-10 border-3 border-cyan-200 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Авторизация через Telegram...</p>
            </div>
          ) : (
            <button
              onClick={handleManualAuth}
              className="w-full h-14 rounded-xl glossy-glass text-white font-semibold text-base transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", fontFamily: "var(--font-brand)" }}
            >
              <LogIn size={18} /> Войти через Telegram
            </button>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-center mt-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Авторизация происходит автоматически при открытии из Telegram.<br />
          Ваш Telegram ID служит единственным ключом доступа.
        </p>
      </div>
    </div>
  );
}
