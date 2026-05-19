/**
 * Telegram Bot API service
 * Sends notifications to users via Telegram Bot
 */

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const API_BASE = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : "";

export async function sendTelegramMessage(chatId: number | string, text: string, options?: { parse_mode?: "HTML" | "Markdown"; reply_markup?: unknown }) {
  if (!BOT_TOKEN || !API_BASE) {
    console.warn("[Telegram Bot] BOT_TOKEN not set, skipping message");
    return { ok: false, error: "No bot token" };
  }

  try {
    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parse_mode || "HTML",
        ...options,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("[Telegram Bot] Error:", data.description);
      return { ok: false, error: data.description };
    }
    return { ok: true, messageId: data.result?.message_id };
  } catch (err) {
    console.error("[Telegram Bot] Network error:", err);
    return { ok: false, error: String(err) };
  }
}

// ─── MESSAGE TEMPLATES ────────────────────────────────────

/** 24 hours before booking reminder */
export function bookingReminder24h(booking: {
  date: string;
  time: string;
  duration: number;
  boards: number;
  totalPrice: number;
}): string {
  return `
<b>Напоминание о бронировании</b>

Завтра в <b>${booking.time}</b> у вас забронирована сессия SUP-бординга!

📅 Дата: ${booking.date}
🕐 Время: ${booking.time}
⏱ Длительность: ${booking.duration} часа
🏄 Досок: ${booking.boards}
💰 Сумма: ${booking.totalPrice.toLocaleString()} ₽

📍 Адрес: г. Иркутск, набережная р. Ангары
⏰ Приходите за 15 минут до начала!

Если нужно перенести — за 24 часа бесплатно через приложение или по телефону +7 (914)-139-31-20
  `.trim();
}

/** 1 hour before booking reminder */
export function bookingReminder1h(booking: {
  date: string;
  time: string;
  duration: number;
  boards: number;
  totalPrice: number;
}): string {
  return `
<b>Скоро начнём!</b>

Через час, в <b>${booking.time}</b>, ваша сессия SUP-бординга!

📅 ${booking.date}
🕐 ${booking.time}
⏱ ${booking.duration} часа
🏄 ${booking.boards} ${booking.boards === 1 ? "доска" : "доски"}

📍 Адрес: г. Иркутск, набережная р. Ангары

Не забудьте полотенце и сменную одежду! Гидрокостюм выдаём бесплатно.
  `.trim();
}

/** 2 hours after visit — review request */
export function reviewRequest(bookingDate: string): string {
  return `
<b>Рады были вас видеть!</b>

Надеемся, вам понравилось катание на SUP-борде ${bookingDate}!

Пожалуйста, оцените ваше посещение на Яндекс Картах — это поможет другим найти нас:

👉 <a href="https://yandex.ru/maps/org/open_waters/55774606228?si=0pgkxktxj6hhfvykprwcdnyqgr">Оставить отзыв на Яндекс Картах</a>

Спасибо, что выбрали Open Waters! Ждём вас снова 🌊
  `.trim();
}

/** Booking confirmed by employee */
export function bookingConfirmed(booking: {
  date: string;
  time: string;
  duration: number;
  boards: number;
}): string {
  return `
<b>Ваше бронирование подтверждено!</b>

📅 ${booking.date}
🕐 ${booking.time}
⏱ ${booking.duration} часа
🏄 ${booking.boards} ${booking.boards === 1 ? "доска" : "доски"}

Приходите за 15 минут до начала. До встречи на воде! 🌊
  `.trim();
}
