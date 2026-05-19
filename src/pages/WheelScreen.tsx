import { useState, useRef, useCallback, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { WHEEL_PRIZES, DAILY_FREE_SPINS } from "@/config/appConfig";
import { Sparkles, Gift } from "lucide-react";

const PRIZES = WHEEL_PRIZES;
const N = PRIZES.length; // 8
const SEG = 360 / N; // 45 degrees

interface Particle { x: number; y: number; vx: number; vy: number; color: string; size: number; opacity: number; }

// ─── SVG SECTOR PATH GENERATOR ────────────────────────────
function sectorPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s = (startDeg - 90) * Math.PI / 180;
  const e = (endDeg - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(s);
  const y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e);
  const y2 = cy + r * Math.sin(e);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

// Calculate which segment is at the pointer (top = 0 degrees)
function getWinningSegment(rotation: number): number {
  // Normalize rotation to 0-360
  const norm = ((rotation % 360) + 360) % 360;
  // The pointer is at 0 degrees (top). 
  // After rotating by `norm`, what was at angle `norm` is now at top.
  // But sectors are defined from 0. So segment at top = floor(norm / SEG)
  const seg = Math.floor(norm / SEG) % N;
  // Reverse because wheel rotates clockwise
  return (N - seg) % N;
}

export function WheelScreen() {
  const { showToast, spinsAvailable, setSpinsAvailable, wheelPrizes, addWheelPrize } = useAppStore();
  const [spinning, setSpinning] = useState(false);
  const [rot, setRot] = useState(0);
  const [won, setWon] = useState<typeof PRIZES[0] | null>(null);
  const [confetti, setConfetti] = useState<Particle[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const baseUrl = import.meta.env.BASE_URL || "/";

  // Wheel SVG config
  const W = 260;
  const CX = W / 2;
  const CY = W / 2;
  const R = 118;
  const HUB_R = 38;

  useEffect(() => {
    if (confetti.length === 0) return;
    const t = setTimeout(() => setConfetti([]), 4000);
    return () => clearTimeout(t);
  }, [confetti.length]);

  const spin = useCallback(() => {
    if (spinning || spinsAvailable <= 0) return;

    // 1. Choose winning segment
    const winSeg = Math.floor(Math.random() * N);
    const winPrize = PRIZES[winSeg];

    // 2. Calculate rotation to land winSeg at pointer
    // winSeg center is at winSeg * SEG + SEG/2
    // We want that center to end up at 0° (top)
    // After rotating by `rot`, the segment at angle A ends up at angle (A + rot) % 360
    // We want (winSeg * SEG + SEG/2 + targetRot) % 360 = 0
    // targetRot = -winSeg * SEG - SEG/2 (mod 360)
    const segCenter = winSeg * SEG + SEG / 2;
    const targetRot = (360 - segCenter) % 360;
    
    // Add full spins (5x360 = 1800) + target
    const extraRot = 1800 + targetRot;
    const finalRot = rot + extraRot;

    // 3. Start animation
    setSpinning(true);
    setWon(null);
    const start = performance.now();
    const startRot = rot;

    function tick(now: number) {
      const p = Math.min((now - start) / 3500, 1);
      const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const currentRot = startRot + (finalRot - startRot) * e;
      setRot(currentRot);

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        // 4. Verify winning segment
        const landedSeg = getWinningSegment(currentRot);
        const landedPrize = PRIZES[landedSeg];
        
        // Fix: force the prize we intended
        const finalPrize = landedPrize.id === winPrize.id ? landedPrize : winPrize;
        
        setSpinning(false);
        setSpinsAvailable(s => s - 1);
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

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <div className="min-h-full flex flex-col items-center relative overflow-hidden">
      {/* Confetti */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map((p, i) => (
            <div key={i} className="absolute rounded-sm" style={{ left: p.x, top: p.y, width: p.size, height: p.size * 0.6, background: p.color, opacity: p.opacity, transform: `rotate(${Math.random() * 360}deg)` }} />
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

      {/* ===== WHEEL: SVG ===== */}
      <div className="mt-6 relative mx-auto flex-shrink-0" style={{ width: W, height: W }} ref={wrapRef}>
        <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`} className="rounded-full" style={{ transform: `rotate(${rot}deg)`, transition: spinning ? "none" : "transform 0.3s ease", filter: "drop-shadow(0 8px 30px rgba(8,145,178,0.3))" }}>
          {PRIZES.map((prize, i) => {
            const start = i * SEG;
            const end = (i + 1) * SEG;
            const d = sectorPath(CX, CY, R, start, end);

            const mid = (start + end) / 2;
            const midRad = (mid - 90) * Math.PI / 180;
            const tx = CX + R * 0.68 * Math.cos(midRad);
            const ty = CY + R * 0.68 * Math.sin(midRad);

            const isBottom = i >= 4;
            const textRot = mid + (isBottom ? 180 : 0);

            return (
              <g key={prize.id}>
                <path d={d} fill={prize.color} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="13" fontWeight="700" fontFamily="var(--font-brand)" transform={`rotate(${textRot}, ${tx}, ${ty})`} style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                  {prize.short}
                </text>
              </g>
            );
          })}
          <circle cx={CX} cy={CY} r={HUB_R} fill="rgba(255,255,255,0.95)" stroke="rgba(6,182,212,0.3)" strokeWidth="2" />
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fill="#0891B2" fontSize="15" fontWeight="700" fontFamily="var(--font-brand)">
            {spinning ? "..." : "SPIN"}
          </text>
        </svg>

        <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: -8, width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "20px solid #F97316", filter: "drop-shadow(0 3px 6px rgba(249,115,22,0.5))" }} />
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
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Выпало:</p>
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
