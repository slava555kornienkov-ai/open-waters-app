/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║           OPEN WATERS — ADMIN CONFIGURATION              ║
 * ║                                                          ║
 * ║  Edit this file to change prices, prizes, promotions.    ║
 * ║  After editing — commit and push to GitHub.              ║
 * ║  Railway will auto-deploy.                               ║
 * ╚══════════════════════════════════════════════════════════╝
 */

// ─── PRICING ──────────────────────────────────────────────
// Base price per hour (1 board, no extras)
// Format: [duration_hours, price_rubles]
export const PRICING = {
  basePrices: [
    { duration: 1, price: 1700 },
    { duration: 2, price: 2800 },
    { duration: 3, price: 3800 },
    { duration: 4, price: 4700 },
    { duration: 5, price: 5300 }, // 4h + 1h
    { duration: 6, price: 5900 }, // 4h + 2h
  ] as { duration: number; price: number }[],

  // Extra hour price (after 4h)
  extraHourPrice: 600,

  // Per board
  boards: {
    base: 1, // included in base price
    extraPriceFactor: 1.0, // each extra board = full price
  },

  // Extras
  extras: {
    instructor: { pricePerHour: 2000, label: "Инструктор" },
    rescuers:   { pricePerHour: 2500, label: "Команда спасателей" },
    photoShoot: { pricePerHour: 1500, label: "Фотосессия" },
  },

  // Bonuses: 1 bonus = 1 ruble discount
  maxBonusDiscount: 0.5, // max 50% of total price

  // Payment methods
  paymentMethods: [
    { id: "qr" as const,   label: "QR-код (СБП)", icon: "QrCode" },
    { id: "card" as const, label: "Перевод на карту", icon: "CreditCard" },
  ],

  // Card details for "card" payment
  cardDetails: {
    phone: "+7 (914)-139-31-20",
    bank: "ВТБ",
    name: "Евгения К.",
  },
};

// ─── WHEEL PRIZES ─────────────────────────────────────────
// Controls what appears on the wheel and their probabilities
// weight = higher = more frequent
export const WHEEL_PRIZES = [
  { id: "discount-5",  label: "Скидка 5%",      short: "-5%",  color: "#0EA5E9", weight: 20 },
  { id: "bonus-200",   label: "200 бонусов",    short: "200",  color: "#EC4899", weight: 8 },
  { id: "discount-10", label: "Скидка 10%",     short: "-10%", color: "#6366F1", weight: 10 },
  { id: "bonus-50",    label: "50 бонусов",     short: "50",   color: "#F59E0B", weight: 25 },
  { id: "free-hour",   label: "Бесплатный час", short: "+1ч",  color: "#10B981", weight: 5 },
  { id: "bonus-100",   label: "100 бонусов",    short: "100",  color: "#EF4444", weight: 15 },
  { id: "discount-15", label: "Скидка 15%",     short: "-15%", color: "#14B8A6", weight: 7 },
  { id: "bonus-150",   label: "150 бонусов",    short: "150",  color: "#8B5CF6", weight: 10 },
];

// Daily free spins
export const DAILY_FREE_SPINS = 3;

// Bonus earning: 1 ruble spent = X bonuses
export const BONUS_EARN_RATE = 0.05; // 5%

// ─── SUBSCRIPTIONS ────────────────────────────────────────
export const SUBSCRIPTIONS = [
  { hours: 10,  price: 8000, savings: 20, label: "Старт" },
  { hours: 15,  price: 10000, savings: 25, label: "Про" },
  { hours: 20,  price: 13500, savings: 30, label: "VIP" },
  { hours: 30,  price: 18000, savings: 35, label: "Мастер" },
];

// ─── PROMOTIONS ───────────────────────────────────────────
export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string; // YYYY-MM-DD
  image: string; // path in public/ folder
  active: boolean;
}

export const PROMOTIONS: Promotion[] = [
  {
    id: "weekday-20",
    title: "Будни со скидкой",
    description: "Скидка 20% на все бронирования в будние дни с 10:00 до 14:00",
    discount: "-20%",
    validUntil: "2026-06-30",
    image: "promo-1.jpg",
    active: true,
  },
  {
    id: "group-15",
    title: "Групповая аренда",
    description: "При аренде от 5 досок скидка 15% + инструктор бесплатно",
    discount: "-15%",
    validUntil: "2026-06-30",
    image: "promo-2.jpg",
    active: true,
  },
  {
    id: "birthday",
    title: "День рождения",
    description: "В ДР и 3 дня после — бесплатный час аренды",
    discount: "БЕСПЛАТНО",
    validUntil: "2026-12-31",
    image: "promo-3.jpg",
    active: true,
  },
  {
    id: "referral",
    title: "Приведи друга",
    description: "+300 бонусов за каждого друга, который сделает первое бронирование",
    discount: "+300",
    validUntil: "2026-12-31",
    image: "promo-4.jpg",
    active: true,
  },
  {
    id: "first-booking",
    title: "Первое бронирование",
    description: "Скидка 500 рублей на первую аренду SUP-борда",
    discount: "-500 ₽",
    validUntil: "2026-12-31",
    image: "promo-5.jpg",
    active: true,
  },
];

// ─── LOYALTY LEVELS ───────────────────────────────────────
export const LOYALTY_LEVELS = [
  { threshold: 0,    name: "Бронзовый",  color: "#B45309", discount: 0,  icon: "🥉" },
  { threshold: 2000, name: "Серебряный", color: "#94A3B8", discount: 5,  icon: "🥈" },
  { threshold: 5000, name: "Золотой",    color: "#F59E0B", discount: 10, icon: "🥇" },
  { threshold: 10000,name: "Платиновый", color: "#0EA5E9", discount: 15, icon: "💎" },
];

// ─── CONTACT / SUPPORT ────────────────────────────────────
export const SUPPORT = {
  phone: "+7 (914)-139-31-20",
  email: "info@openwaters.ru",
  address: "г. Иркутск, набережная р. Ангары",
  yandexMapUrl: "https://yandex.ru/maps/-/CPcLJZmt",
  workHours: "10:00 — 20:00 ежедневно",
  instagram: "https://instagram.com/open_waters",
  telegram: "https://t.me/open_waters_sup",
  vk: "https://vk.com/open_waters",
};
