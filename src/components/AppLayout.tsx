import { Outlet, useLocation, useNavigate } from "react-router";
import { User, CircleDot, CalendarDays, Tag, MessageCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

const tabs = [
  { key: "profile", path: "/profile", label: "Профиль", Icon: User },
  { key: "wheel", path: "/wheel", label: "Колесо", Icon: CircleDot },
  { key: "booking", path: "/booking", label: "Бронь", Icon: CalendarDays },
  { key: "promotions", path: "/promotions", label: "Акции", Icon: Tag },
  { key: "support", path: "/support", label: "Поддержка", Icon: MessageCircle },
] as const;

// Which tab should be active for non-root pages
const getActiveTabFromPath = (path: string): string => {
  if (path === "/" || path === "/booking" || path === "/booking-confirm") return "booking";
  if (path === "/profile" || path === "/settings" || path === "/admin") return "profile";
  if (path === "/wheel") return "wheel";
  if (path === "/promotions") return "promotions";
  if (path === "/support") return "support";
  return "booking";
};

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeTab, setActiveTab, toast, hideToast } = useAppStore();

  useEffect(() => {
    const tab = getActiveTabFromPath(location.pathname);
    if (tab !== activeTab) setActiveTab(tab as typeof tabs[number]["key"]);
  }, [location.pathname, activeTab, setActiveTab]);

  const handleTabClick = (tab: (typeof tabs)[number]) => {
    setActiveTab(tab.key);
    navigate(tab.path);
  };

  return (
    <div className="app-viewport flex flex-col">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl liquid-glass flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300"
          style={{ maxWidth: "380px" }}
          onClick={hideToast}
        >
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: toast.type === "success" ? "#10B981" : toast.type === "error" ? "#EF4444" : "#06B6D4" }} />
          <span className="text-sm font-medium text-white">{toast.message}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: "80px" }}>
        <Outlet />
      </main>

      {/* Bottom Navigation — ALWAYS visible, fixed */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 h-[72px] flex items-center justify-around liquid-glass"
        style={{
          width: "100%",
          maxWidth: "430px",
          paddingBottom: "env(safe-area-inset-bottom, 12px)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isCenter = tab.key === "booking";
          const Icon = tab.Icon;

          if (isCenter) {
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab)}
                className="flex flex-col items-center justify-center -mt-5 transition-transform duration-100 active:scale-95"
              >
                <div
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #06B6D4, #0891B2)",
                    boxShadow: "inset 0 0 12px rgba(255,255,255,0.3), 0 4px 20px rgba(6, 182, 212, 0.3)",
                  }}
                >
                  <Icon size={22} strokeWidth={2} className="text-white" />
                </div>
                <span className="text-[10px] font-semibold mt-0.5" style={{ fontFamily: "var(--font-brand)", color: isActive ? "#06B6D4" : "#94A3B8" }}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab)}
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 transition-all duration-200 relative active:scale-95"
            >
              <Icon size={22} strokeWidth={1.5} className="transition-colors duration-200" style={{ color: isActive ? "#06B6D4" : "#94A3B8" }} />
              <span className="text-[10px] font-medium transition-colors duration-200" style={{ fontFamily: "var(--font-brand)", color: isActive ? "#06B6D4" : "#94A3B8", fontWeight: isActive ? 600 : 500 }}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-8 h-0.5 rounded-full" style={{ background: "#06B6D4" }} />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
