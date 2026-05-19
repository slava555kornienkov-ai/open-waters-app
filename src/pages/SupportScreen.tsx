import { useState, useRef, useEffect } from "react";
import { Send, ChevronDown, ChevronUp, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { SUPPORT } from "@/config/appConfig";

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

// FAQ data
const FAQ = [
  {
    question: "Можно ли с детьми?",
    answer: "Да, с детьми до 8 лет можно кататься на одной доске со взрослым. Детям старше 8 лет можно отдельную доску с инструктором. Спасательные жилеты предоставляем бесплатно для всех возрастов.",
  },
  {
    question: "Есть ли парковка?",
    answer: "Да, рядом есть паркинг под мостом. Въезд — 500₽ на весь день. Также можно оставить машину на набережной (бесплатно, но места занимают быстро).",
  },
  {
    question: "Можно ли перенести бронь?",
    answer: "За 24 часа до посещения перенос бесплатный. Менее чем за 24 часа — удерживаем 50% от стоимости брони. Перенос можно оформить в приложении или по телефону.",
  },
  {
    question: "Что взять с собой?",
    answer: "Полотенце, сменную одежду, крем от загара. Гидрокостюм и спасжилет выдаём бесплатно. Обувь — лучше аквашузы или сланцы.",
  },
  {
    question: "Что если плохая погода?",
    answer: "При штормовом ветре или грозе катание отменяется. Мы сообщаем заранее и переносим бронь бесплатно, либо возвращаем полную сумму.",
  },
  {
    question: "Нужен ли опыт?",
    answer: "Нет! 80% наших клиентов — новички. Инструктор научит всему за 15 минут. Доски стабильные, падать в воду — нормально.",
  },
];

export function SupportScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
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

    setTimeout(() => {
      setIsTyping(false);
      const responses: Record<string, string> = {
        "как забронировать?": "Для бронирования перейдите во вкладку 'Бронь', выберите дату, время и длительность. Затем нажмите 'Забронировать'.",
        "цены": "1 час — 1 700 ₽ (будни) / 2 000 ₽ (выходные). Абонементы от 8 000 ₽ за 10 часов. Подробности во вкладке 'Бронь'.",
        "часы работы": "Мы работаем ежедневно с 10:00 до 21:00. Последняя запись в 20:00.",
        "как добраться?": `Мы находимся на берегу Ангары. Адрес: ${SUPPORT.address}. Открыть в Яндекс Картах: ${SUPPORT.yandexMapUrl}`,
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
        "Как добраться?": `Адрес: ${SUPPORT.address}. Телефон: ${SUPPORT.phone}.`,
      };
      addMessage(responses[action] || "Спасибо за вопрос! Наш менеджер скоро ответит.", "support");
    }, 1200);
  };

  const handleFaqClick = (faq: typeof FAQ[0]) => {
    addMessage(faq.question, "user");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(faq.answer, "support");
    }, 800);
  };

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-xl font-bold text-center" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
          Поддержка
        </h1>
      </div>

      {/* Contact Info Cards */}
      <div className="mx-4 grid grid-cols-2 gap-2 mb-4">
        <div className="surface-solid rounded-xl p-3 flex flex-col items-center gap-1 text-center">
          <Phone size={16} style={{ color: "var(--teal-600)" }} />
          <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Телефон</p>
          <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{SUPPORT.phone}</p>
        </div>
        <div className="surface-solid rounded-xl p-3 flex flex-col items-center gap-1 text-center">
          <Clock size={16} style={{ color: "var(--teal-600)" }} />
          <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Часы работы</p>
          <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{SUPPORT.workHours}</p>
        </div>
      </div>

      {/* Address */}
      <div className="mx-4 mb-4 p-3 rounded-xl surface-solid flex items-center gap-3">
        <MapPin size={18} style={{ color: "var(--teal-600)" }} />
        <div className="flex-1">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Адрес</p>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{SUPPORT.address}</p>
        </div>
        <button
          onClick={() => { try { window.open(SUPPORT.yandexMapUrl, "_blank"); } catch {} }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: "rgba(6,182,212,0.1)", color: "var(--teal-600)" }}
        >
          На карте
        </button>
      </div>

      {/* FAQ Section */}
      <div className="mx-4 mb-4">
        <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-brand)", color: "var(--text-primary)" }}>
          Частые вопросы
        </h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-xl surface-solid overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-3.5 text-left transition-all active:opacity-70"
              >
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.question}</span>
                {openFaq === i ? (
                  <ChevronUp size={16} style={{ color: "var(--text-muted)" }} />
                ) : (
                  <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
                )}
              </button>
              {openFaq === i && (
                <div className="px-3.5 pb-3.5 animate-in fade-in duration-200">
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.answer}</p>
                  <button
                    onClick={() => handleFaqClick(item)}
                    className="mt-2 text-xs font-medium"
                    style={{ color: "var(--teal-500)" }}
                  >
                    Задать уточняющий вопрос →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Toggle */}
      {!showChat && (
        <div className="mx-4 mb-4">
          <button
            onClick={() => setShowChat(true)}
            className="w-full h-12 rounded-xl glossy-glass text-white font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", fontFamily: "var(--font-brand)" }}
          >
            <MessageCircle size={16} /> Написать в поддержку
          </button>
        </div>
      )}

      {/* Chat */}
      {showChat && (
        <div className="mx-4 mb-4 rounded-2xl surface-solid overflow-hidden flex flex-col" style={{ height: "400px" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Чат с поддержкой</h3>
            <button onClick={() => setShowChat(false)} className="text-xs" style={{ color: "var(--text-muted)" }}>Закрыть</button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 ${
                    msg.sender === "user" ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md"
                  }`}
                  style={
                    msg.sender === "user"
                      ? { background: "linear-gradient(135deg, #06B6D4, #0891B2)", boxShadow: "0 2px 8px rgba(6, 182, 212, 0.2)" }
                      : { background: "var(--surface)", boxShadow: "0 1px 4px rgba(8, 145, 178, 0.06)" }
                  }
                >
                  <p className="text-sm leading-relaxed" style={{ color: msg.sender === "user" ? "white" : "var(--text-primary)" }}>
                    {msg.text}
                  </p>
                  <p className="text-[10px] mt-1.5" style={{ color: msg.sender === "user" ? "rgba(255,255,255,0.7)" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ background: "var(--surface)" }}>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--text-muted)", animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages[messages.length - 1]?.sender === "support" && !isTyping && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 animate-in fade-in slide-in-from-bottom-3 duration-300">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all active:scale-95"
                    style={{ background: "rgba(6,182,212,0.08)", color: "var(--teal-600)" }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 h-14 px-3 flex items-center gap-2" style={{ borderTop: "1px solid var(--border)" }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Напишите сообщение..."
              className="flex-1 h-10 px-4 rounded-full text-sm outline-none"
              style={{ fontFamily: "var(--font-body)", color: "var(--text-primary)", background: "var(--surface)" }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)" }}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
