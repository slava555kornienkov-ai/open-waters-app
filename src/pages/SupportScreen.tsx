import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "support";
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "support",
    text: "Здравствуйте! Добро пожаловать в Open Waters. Чем могу помочь?",
    timestamp: "14:30",
  },
];

const QUICK_ACTIONS = ["Как забронировать?", "Цены", "Часы работы", "Как добраться?"];

export function SupportScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const addMessage = (text: string, sender: "user" | "support") => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newMsg: Message = {
      id: `${Date.now()}`,
      sender,
      text,
      timestamp: time,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    addMessage(inputText.trim(), "user");
    setInputText("");
    setIsTyping(true);

    // Simulate support response
    setTimeout(() => {
      setIsTyping(false);
      const responses: Record<string, string> = {
        "как забронировать?": "Для бронирования перейдите во вкладку 'Бронь', выберите дату, время и длительность. Затем нажмите 'Забронировать'.",
        "цены": "1 час — 1 700 ₽ (будни) / 2 000 ₽ (выходные). Абонементы от 8 000 ₽ за 10 часов. Подробности во вкладке 'Бронь'.",
        "часы работы": "Мы работаем ежедневно с 10:00 до 21:00. Последняя запись в 20:00.",
        "как добраться?": "Мы находимся на берегу озера в парковой зоне. Адрес: ул. Набережная, 15. Парковка бесплатная.",
      };
      const lowerText = inputText.trim().toLowerCase();
      const response = responses[lowerText] || "Спасибо за сообщение! Наш менеджер ответит вам в ближайшее время.";
      addMessage(response, "support");
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    addMessage(action, "user");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses: Record<string, string> = {
        "Как забронировать?": "Для бронирования перейдите во вкладку 'Бронь', выберите дату, время и длительность. Затем нажмите 'Забронировать'.",
        "Цены": "1 час — 1 700 ₽ (будни) / 2 000 ₽ (выходные). Абонементы от 8 000 ₽ за 10 часов.",
        "Часы работы": "Мы работаем ежедневно с 10:00 до 21:00. Последняя запись в 20:00.",
        "Как добраться?": "Мы находимся на берегу озера в парковой зоне. Адрес: ул. Набережная, 15.",
      };
      addMessage(responses[action] || "Спасибо за вопрос! Наш менеджер скоро ответит.", "support");
    }, 1200);
  };

  return (
    <div className="h-[calc(100vh-72px)] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 shrink-0">
        <h1
          className="text-xl font-bold text-center"
          style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}
        >
          Поддержка
        </h1>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className={`max-w-[80%] px-4 py-3 ${
                msg.sender === "user"
                  ? "rounded-2xl rounded-br-md"
                  : "rounded-2xl rounded-bl-md surface-solid"
              }`}
              style={
                msg.sender === "user"
                  ? {
                      background: "linear-gradient(135deg, #06B6D4, #0891B2)",
                      boxShadow: "0 2px 8px rgba(6, 182, 212, 0.2)",
                    }
                  : { boxShadow: "0 1px 4px rgba(8, 145, 178, 0.06)" }
              }
            >
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: msg.sender === "user" ? "white" : "var(--text-primary)",
                }}
              >
                {msg.text}
              </p>
              <p
                className="text-[10px] mt-1.5"
                style={{
                  color: msg.sender === "user" ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="surface-solid rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: "var(--text-muted)" }}
                  >
                    <style>{`
                      @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-4px); }
                      }
                    `}</style>
                    <div
                      style={{
                        animation: `bounce 0.6s ease infinite`,
                        animationDelay: `${i * 0.15}s`,
                        width: "100%",
                        height: "100%",
                        borderRadius: "inherit",
                        background: "inherit",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {messages[messages.length - 1]?.sender === "support" && !isTyping && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all active:scale-95 liquid-glass"
                style={{ color: "var(--teal-600)" }}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 h-16 px-4 flex items-center gap-2 liquid-glass">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Напишите сообщение..."
          className="flex-1 h-11 px-5 rounded-full surface-solid text-sm outline-none"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--text-primary)",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim()}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #06B6D4, #0891B2)",
          }}
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
}
