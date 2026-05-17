import { useState, useRef, useCallback, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sparkles, Gift } from "lucide-react";

const PRIZES = [
  { id: "discount-5",  label: "Скидка 5%",      short: "-5%",  color: "#0EA5E9" },
  { id: "bonus-200",   label: "200 бонусов",    short: "200",  color: "#EC4899" },
  { id: "discount-10", label: "Скидка 10%",     short: "-10%", color: "#6366F1" },
  { id: "bonus-50",    label: "50 бонусов",     short: "50",   color: "#F59E0B" },
  { id: "free-hour",   label: "Бесплатный час", short: "+1ч",  color: "#10B981" },
  { id: "bonus-100",   label: "100 бонусов",    short: "100",  color: "#EF4444" },
  { id: "discount-15", label: "Скидка 15%",     short: "-15%", color: "#14B8A6" },
  { id: "bonus-150",   label: "150 бонусов",    short: "150",  color: "#8B5CF6" },
];

const N = 8;
const SEG = 360 / N; // 45 degrees

// For each segment: what to ADD to current rotation so its center lands at top (270deg pointer)
const LAND = [247.5, 202.5, 157.5, 112.5, 67.5, 22.5, 337.5, 292.5];

interface Particle { x: number; y: number; vx: number; vy: number; color: string; size: number; opacity: number; }

export function WheelScreen() {
  const { showToast, spinsAvailable, setSpinsAvailable, wheelPrizes, addWheelPrize } = useAppStore();
  const [spinning, setSpinning] = useState(false);
  const [rot, setRot] = useState(0);
  const [won, setWon] = useState<typeof PRIZES[0] | null>(null);
  const [confetti, setConfetti] = useState<Particle[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  // FIXED: Use ref to lock the prize BEFORE animation starts
  const lockedPrize = useRef<typeof PRIZES[0] | null>(null);
  const lockedSeg = useRef<number>(0);
  const baseUrl = import.meta.env.BASE_URL || "/";

  useEffect(() => {
    if (confetti.length === 0) return;
    const t = setTimeout(() => setConfetti([]), 4000);
    return () => clearTimeout(t);
  }, [confetti.length]);

  const spin = useCallback(() => {
    if (spinning || spinsAvailable <= 0) return;

    // 1. LOCK PRIZE — once picked, it never changes during animation
    const seg = Math.floor(Math.random() * N);
    const prize = PRIZES[seg];
    lockedPrize.current = prize;
    lockedSeg.current = seg;

    // 2. COMPUTE ROTATION based on locked segment
    const cur = ((rot % 360) + 360) % 360;
    let extra = LAND[seg] - cur;
    if (extra < 0) extra += 360;
    extra += (Math.random() - 0.5) * SEG * 0.3; // Small random jitter (reduced for accuracy)
    if (extra < SEG / 3) extra += SEG;
    const target = rot + 1800 + extra;

    // 3. START ANIMATION
    setSpinning(true);
    setWon(null);
    const start = performance.now();

    function tick(now: number) {
      const p = Math.min((now - start) / 3500, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const currentRot = rot + (target - rot) * e;
      setRot(currentRot);

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        // 4. REVEAL — use the LOCKED prize (guaranteed match)
        setSpinning(false);
        setSpinsAvailable(s => s - 1);
        const finalPrize = lockedPrize.current!;
        setWon(finalPrize);
        addWheelPrize({ id: finalPrize.id, label: finalPrize.label, type: "bonus", value: 0, color: finalPrize.color });
        showToast({ message: `${finalPrize.label}!`, type: "success" });

        // CONFETTI
        if (wrapRef.current) {
          const r = wrapRef.current.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const colors = [finalPrize.color, "#FFD700", "#FFF", "#06B6D4", "#F97316"];
          const particles = Array.from({ length: 80 }, () => {
            const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 10;
            return { x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, color: colors[Math.floor(Math.random() * colors.length)], size: 3 + Math.random() * 8, opacity: 1 };
          });
          let f = 0;
          function anim() {
            f++;
            for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.vx *= 0.97; p.vy *= 0.97; p.opacity = Math.max(0, 1 - f / 90); }
            setConfetti(particles.filter(p => p.opacity > 0 && p.y < window.innerHeight + 50));
            if (f < 90) requestAnimationFrame(anim); else setConfetti([]);
          }
          requestAnimationFrame(anim);
        }
      }
    }
    requestAnimationFrame(tick);
  }, [spinning, spinsAvailable, rot, showToast, setSpinsAvailable, addWheelPrize]);

  return (
    <div className="min-h-full flex flex-col items-center relative overflow-hidden">
      {/* Confetti */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map((p, i) => (
            <div key={i} className="absolute" style={{ left: p.x, top: p.y, width: p.size, height: p.size * 0.5, background: p.color, opacity: p.opacity }} />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="w-full px-5 pt-4 pb-2 flex items-center gap-2">
        <img src={`${baseUrl}logo-user.jpg`} alt="Open Waters" className="w-7 h-7 object-cover rounded-full" />
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>Колесо удачи</h1>
      </div>

      <div className="mt-2">
        <div className="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5" style={{ background: "rgba(6,182,212,0.1)", color: "var(--teal-600)" }}>
          <Sparkles size={12} /> Вращений: {spinsAvailable}
        </div>
      </div>

      {/* ===== WHEEL: 8 clip-path sectors ===== */}
      <div className="mt-6 relative w-[260px] h-[260px] mx-auto flex-shrink-0" ref={wrapRef}>

        {/* Rotating layer */}
        <div className="w-full h-full relative" style={{ transform: `rotate(${rot}deg)`, transition: spinning ? "none" : "transform 0.3s ease" }}>

          {/* 8 colored sectors */}
          {PRIZES.map((prize, i) => (
            <div
              key={prize.id}
              className="absolute left-1/2 top-0 overflow-hidden"
              style={{
                width: "50%",
                height: "100%",
                transformOrigin: "left center",
                transform: `rotate(${i * SEG}deg)`,
                clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                background: prize.color,
              }}
            >
              {/* Text inside sector */}
              <span
                className="absolute text-white text-[12px] font-bold whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-brand)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.7)",
                  left: "55%",
                  top: "50%",
                  transform: `translate(-50%, -50%) rotate(${i < 4 ? 22.5 : -157.5}deg)`,
                }}
              >
                {prize.short}
              </span>
            </div>
          ))}

          {/* White divider lines overlaid */}
          {Array.from({ length: N }, (_, i) => (
            <div
              key={`line-${i}`}
              className="absolute left-1/2 top-0 w-[1.5px] origin-bottom"
              style={{
                height: "50%",
                background: "rgba(255,255,255,0.35)",
                transform: `translateX(-50%) rotate(${i * SEG}deg)`,
              }}
            />
          ))}

          {/* Center hub */}
          <div
            className="absolute left-1/2 top-1/2 w-[70px] h-[70px] -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center z-10"
            style={{
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15), inset 0 0 0 2px rgba(6,182,212,0.25)",
            }}
          >
            <span className="text-[14px] font-bold" style={{ fontFamily: "var(--font-brand)", color: "#0891B2" }}>
              {spinning ? "..." : "SPIN"}
            </span>
          </div>
        </div>

        {/* Pointer (fixed, outside rotating layer) */}
        <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 z-20" style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "18px solid #F97316", filter: "drop-shadow(0 2px 4px rgba(249,115,22,0.4))" }} />

        {/* Shadow */}
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: "0 10px 40px rgba(8,145,178,0.25)", zIndex: -1 }} />
      </div>

      {/* Legend */}
      <div className="mt-5 w-full px-4">
        <div className="grid grid-cols-4 gap-2">
          {PRIZES.map(p => (
            <div key={p.id} className="surface-solid rounded-lg p-1.5 text-center">
              <div className="w-3.5 h-3.5 rounded-full mx-auto mb-0.5" style={{ background: p.color }} />
              <span className="text-[9px] font-medium leading-tight block" style={{ color: "var(--text-secondary)" }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spin button */}
      <div className="w-full px-5 mt-4">
        <button onClick={spin} disabled={spinning || spinsAvailable <= 0}
          className="w-full h-14 rounded-xl text-white font-semibold text-base transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: spinning || spinsAvailable <= 0 ? "rgba(148,163,184,0.3)" : "linear-gradient(135deg,#06B6D4,#0891B2)", fontFamily: "var(--font-brand)" }}>
          {spinning ? "Крутим..." : spinsAvailable > 0 ? "Крутить!" : "Нет вращений"}
        </button>
      </div>

      {/* Won prize */}
      {won && (
        <div className="mx-5 mt-4 p-4 rounded-xl surface-solid animate-in zoom-in-95 fade-in duration-300" style={{ border: `2px solid ${won.color}` }}>
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Ваш выигрыш:</p>
          <p className="text-xl font-bold mt-1" style={{ color: won.color, fontFamily: "var(--font-brand)" }}>{won.label}</p>
        </div>
      )}

      {/* Saved prizes */}
      {wheelPrizes.length > 0 && (
        <div className="w-full px-5 mt-4 mb-6">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
            <Gift size={14} style={{ color: "var(--teal-500)" }} /> Ваши призы ({wheelPrizes.length})
          </h3>
          <div className="flex gap-2 flex-wrap">
            {wheelPrizes.map((p, i) => (
              <div key={`${p.id}-${i}`} className="px-3 py-1.5 rounded-full text-xs font-semibold animate-in fade-in zoom-in-95 duration-200"
                style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}25`, animationDelay: `${i * 60}ms` }}>
                {p.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
