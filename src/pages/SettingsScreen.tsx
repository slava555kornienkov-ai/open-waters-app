import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Moon, Sun, Shield, User, Smartphone,
  ChevronRight, Check, Lock
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function SettingsScreen() {
  const navigate = useNavigate();
  const { showToast } = useAppStore();
  const [darkMode, setDarkMode] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePhone, setShowChangePhone] = useState(false);
  const [profileName, setProfileName] = useState("Ольга Смирнова");
  const [phoneNumber, setPhoneNumber] = useState("+7 (999) 123-45-67");
  const [showTwoFASetup, setShowTwoFASetup] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState<"request" | "code">("request");
  const [twoFACode, setTwoFACode] = useState("");

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    showToast({ message: next ? "Тёмная тема включена" : "Светлая тема включена", type: "success" });
  };

  const toggleTwoFA = () => {
    if (!twoFA) {
      setShowTwoFASetup(true);
      setTwoFAStep("request");
    } else {
      setTwoFA(false);
      showToast({ message: "2FA отключен", type: "success" });
    }
  };

  const requestTwoFACode = () => {
    setTwoFAStep("code");
    showToast({ message: "Код отправлен на ваш номер", type: "success" });
  };

  const verifyTwoFACode = () => {
    if (twoFACode.length >= 4) {
      setTwoFA(true);
      setShowTwoFASetup(false);
      setTwoFACode("");
      showToast({ message: "2FA успешно включен!", type: "success" });
    } else {
      showToast({ message: "Введите корректный код", type: "error" });
    }
  };

  const saveProfile = () => {
    setShowEditProfile(false);
    showToast({ message: "Профиль обновлен!", type: "success" });
  };

  const savePhone = () => {
    setShowChangePhone(false);
    showToast({ message: "Номер телефона обновлен!", type: "success" });
  };

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, "").replace(/^7/, "").slice(0, 10);
    let formatted = "+7";
    if (digits.length > 0) formatted += ` (${digits.slice(0, 3)}`;
    if (digits.length >= 3) formatted += `) ${digits.slice(3, 6)}`;
    if (digits.length >= 6) formatted += `-${digits.slice(6, 8)}`;
    if (digits.length >= 8) formatted += `-${digits.slice(8, 10)}`;
    return formatted;
  };

  return (
    <div className="min-h-full pb-4">
      {/* 2FA Setup Modal */}
      {showTwoFASetup && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowTwoFASetup(false)} />
          <div className="relative w-full max-w-[430px] mx-auto surface-solid rounded-t-2xl p-5 animate-in slide-in-from-bottom duration-300">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-brand)" }}>Двухфакторная аутентификация</h3>
            {twoFAStep === "request" ? (
              <>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  Мы отправим код подтверждения на номер {phoneNumber}. Введите код для включения 2FA.
                </p>
                <button onClick={requestTwoFACode}
                  className="w-full h-12 rounded-xl text-white font-semibold text-sm active:scale-[0.97] transition-transform"
                  style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", fontFamily: "var(--font-brand)" }}>
                  Отправить код
                </button>
              </>
            ) : (
              <>
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>Введите код из SMS:</p>
                <input type="text" placeholder="0000" value={twoFACode} onChange={e => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full h-12 px-4 rounded-xl surface-solid text-lg text-center font-mono outline-none mb-3 tracking-[8px]"
                  style={{ color: "var(--text-primary)" }} />
                <button onClick={verifyTwoFACode}
                  className="w-full h-12 rounded-xl text-white font-semibold text-sm active:scale-[0.97] transition-transform"
                  style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", fontFamily: "var(--font-brand)" }}>
                  Подтвердить
                </button>
              </>
            )}
            <button onClick={() => setShowTwoFASetup(false)} className="w-full mt-2 h-10 text-sm" style={{ color: "var(--text-muted)" }}>Отмена</button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowEditProfile(false)} />
          <div className="relative w-full max-w-[430px] mx-auto surface-solid rounded-t-2xl p-5 animate-in slide-in-from-bottom duration-300">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-brand)" }}>Редактировать профиль</h3>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Имя</label>
            <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl surface-solid text-sm outline-none mb-4" style={{ color: "var(--text-primary)" }} />
            <button onClick={saveProfile}
              className="w-full h-12 rounded-xl text-white font-semibold text-sm active:scale-[0.97] transition-transform"
              style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", fontFamily: "var(--font-brand)" }}>
              Сохранить
            </button>
            <button onClick={() => setShowEditProfile(false)} className="w-full mt-2 h-10 text-sm" style={{ color: "var(--text-muted)" }}>Отмена</button>
          </div>
        </div>
      )}

      {/* Change Phone Modal */}
      {showChangePhone && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowChangePhone(false)} />
          <div className="relative w-full max-w-[430px] mx-auto surface-solid rounded-t-2xl p-5 animate-in slide-in-from-bottom duration-300">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-brand)" }}>Сменить номер телефона</h3>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Новый номер</label>
            <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(formatPhoneInput(e.target.value))}
              className="w-full h-12 px-4 rounded-xl surface-solid text-sm outline-none mb-4 tracking-wide" style={{ color: "var(--text-primary)" }} />
            <button onClick={savePhone}
              className="w-full h-12 rounded-xl text-white font-semibold text-sm active:scale-[0.97] transition-transform"
              style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", fontFamily: "var(--font-brand)" }}>
              Сохранить
            </button>
            <button onClick={() => setShowChangePhone(false)} className="w-full mt-2 h-10 text-sm" style={{ color: "var(--text-muted)" }}>Отмена</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate("/profile")} className="w-8 h-8 rounded-full surface-solid flex items-center justify-center active:scale-90 transition-transform">
          <ChevronLeft size={18} style={{ color: "var(--text-primary)" }} />
        </button>
        <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Настройки</h1>
      </div>

      {/* User mini card */}
      <div className="mx-4 mt-2 rounded-2xl liquid-glass p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22D3EE, #60A5FA)", padding: "2px" }}>
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span className="text-sm font-bold" style={{ fontFamily: "var(--font-brand)", background: "linear-gradient(135deg, #06B6D4, #0891B2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ОС</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{profileName}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{phoneNumber}</p>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="mt-4 space-y-4">
        {/* Account */}
        <div className="mx-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Аккаунт</h3>
          <div className="rounded-xl overflow-hidden surface-solid">
            <button onClick={() => setShowEditProfile(true)} className="w-full flex items-center justify-between py-3.5 px-4 transition-all active:opacity-70 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3"><User size={18} style={{ color: "var(--text-secondary)" }} /><span className="text-sm" style={{ color: "var(--text-primary)" }}>Редактировать профиль</span></div>
              <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
            </button>
            <button onClick={() => setShowChangePhone(true)} className="w-full flex items-center justify-between py-3.5 px-4 transition-all active:opacity-70 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3"><Smartphone size={18} style={{ color: "var(--text-secondary)" }} /><span className="text-sm" style={{ color: "var(--text-primary)" }}>Номер телефона</span></div>
              <div className="flex items-center gap-2"><span className="text-xs" style={{ color: "var(--text-muted)" }}>{phoneNumber}</span><ChevronRight size={16} style={{ color: "var(--text-muted)" }} /></div>
            </button>
            <button onClick={toggleTwoFA} className="w-full flex items-center justify-between py-3.5 px-4 transition-all active:opacity-70">
              <div className="flex items-center gap-3">
                <Shield size={18} style={{ color: twoFA ? "#10B981" : "var(--text-secondary)" }} />
                <div>
                  <span className="text-sm block" style={{ color: "var(--text-primary)" }}>Безопасность</span>
                  <span className="text-[10px]" style={{ color: twoFA ? "#10B981" : "var(--text-muted)" }}>{twoFA ? "2FA включен" : "2FA отключен"}</span>
                </div>
              </div>
              {twoFA ? <Check size={16} style={{ color: "#10B981" }} /> : <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />}
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="mx-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Интерфейс</h3>
          <div className="rounded-xl overflow-hidden surface-solid">
            <button onClick={toggleTheme} className="w-full flex items-center justify-between py-3.5 px-4 transition-all active:opacity-70">
              <div className="flex items-center gap-3">{darkMode ? <Moon size={18} style={{ color: "#6366F1" }} /> : <Sun size={18} style={{ color: "#F59E0B" }} />} <span className="text-sm" style={{ color: "var(--text-primary)" }}>{darkMode ? "Тёмная тема" : "Светлая тема"}</span></div>
              <div className="w-10 h-6 rounded-full relative transition-all" style={{ background: darkMode ? "#6366F1" : "rgba(148,163,184,0.3)" }}>
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all" style={{ left: darkMode ? "18px" : "2px" }} />
              </div>
            </button>
          </div>
        </div>

        {/* About */}
        <div className="mx-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>О приложении</h3>
          <div className="rounded-xl overflow-hidden surface-solid">
            <div className="flex items-center justify-between py-3.5 px-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3"><Lock size={18} style={{ color: "var(--text-secondary)" }} /><span className="text-sm" style={{ color: "var(--text-primary)" }}>Версия</span></div>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>1.0.0</span>
            </div>
            <button onClick={() => showToast({ message: "Функция в разработке", type: "info" })} className="w-full flex items-center justify-between py-3.5 px-4 transition-all active:opacity-70">
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>Условия использования</span>
              <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
