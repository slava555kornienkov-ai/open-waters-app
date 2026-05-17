import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

interface QrScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch {
        setError("Нет доступа к камере. Разрешите доступ в настройках.");
        setScanning(false);
      }
    };

    startCamera();

    // Dynamic import of jsqr
    const scanLoop = async () => {
      const jsqr = await import("jsqr");
      intervalRef.current = setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState !== 4) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsqr.default(imageData.data, canvas.width, canvas.height);
        if (code?.data) {
          setScanning(false);
          onScan(code.data);
          stopCamera();
        }
      }, 200);
    };

    if (scanning) scanLoop();

    return () => {
      cancelled = true;
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 z-10">
        <h3 className="text-white text-sm font-semibold" style={{ fontFamily: "var(--font-brand)" }}>Сканер QR-кода</h3>
        <button onClick={() => { stopCamera(); onClose(); }} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:scale-90">
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {error ? (
          <div className="text-center p-6">
            <Camera size={48} className="text-white/30 mx-auto mb-3" />
            <p className="text-white/60 text-sm">{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
            <canvas ref={canvasRef} className="hidden" />
            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white/50 rounded-xl relative">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
              </div>
            </div>
            {/* Scan line */}
            <div className="absolute left-1/2 -translate-x-1/2 w-48 h-0.5 bg-cyan-400 animate-ping" style={{ top: "50%" }} />
          </>
        )}
      </div>

      {/* Hint */}
      <div className="p-4 bg-black/80 text-center">
        <p className="text-white/60 text-xs">Наведите камеру на QR-код клиента</p>
      </div>
    </div>
  );
}
