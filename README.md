# Open Waters — Telegram Mini App для аренды SUP-бордов

Премиальное мобильное приложение для бронирования SUP-бордов в стиле ocean glassmorphism с 5 экранами: Профиль, Колесо Удачи, Бронирование, Акции и Поддержка.

## Технологии

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: tRPC + Drizzle ORM + Hono + MySQL
- **Auth**: OAuth 2.0 + JWT сессии
- **State**: Zustand + TanStack Query (tRPC)
- **QR**: qrcode.react
- **UI**: Glassmorphism, liquid glass surfaces, ocean gradient animations

## Структура приложения

### 5 экранов с нижней навигацией:

1. **Профиль** — QR-код, статистика, история посещений, реферальная система, уровни лояльности
2. **Колесо Удачи** — 8 призов, физика вращения, confetti-эффект при выигрыше
3. **Бронирование** — прайс-лист, выбор даты/времени, длительность, опции, бонусы, оплата
4. **Акции** — промо-карточки с изображениями, промокоды
5. **Поддержка** — чат с быстрыми действиями, typing indicator

## Бизнес-логика

### Прайс-лист
- Будни: 1ч 1700₽ / 2ч 2800₽ / 3ч 3800₽ / 4ч 4700₽ / +600₽/ч
- Выходные: 1ч 2000₽ / 2ч 3200₽ / 3ч 4200₽ / 4ч 5000₽ / +700₽/ч
- Инструктор: 2000₽/час | Спасатели: 2500₽/час

### Абонементы
- 10 часов — 8000₽ (экономия 20%)
- 15 часов — 10000₽ (экономия 25%)
- 20 часов — 13500₽ (экономия 30%)

### Бонусная система
- Начисление 5% после подтвержденного посещения
- Списание до 30% стоимости бронирования

### Колесо Удачи
- Скидки: 5%, 10%, 15%
- Бонусы: 50, 100, 150, 200
- Бесплатный час

## Архитектура

```
app/
  src/
    pages/           — 6 экранов (Profile, Wheel, Booking, Promotions, Support, BookingConfirm)
    components/      — AppLayout с нижней навигацией
    store/           — Zustand store (навигация, бронирование, toast)
    hooks/           — useAuth и др.
    providers/       — TRPCProvider
  api/
    router.ts        — tRPC роутер
    auth-router.ts   — Аутентификация
    profile-router.ts — Профиль, QR, рефералы
    booking-router.ts — Бронирование, слоты
    wheel-router.ts  — Колесо удачи
    promotions-router.ts — Акции
    support-router.ts — Чат поддержки
    admin-router.ts  — Админ-панель
  db/
    schema.ts        — Все таблицы (users, bookings, referrals, и др.)
    relations.ts     — Drizzle relations
```

## API Endpoints

| Роутер | Endpoints |
|--------|-----------|
| auth | me, logout |
| profile | me, visitHistory, refreshQr, referralStats, updateProfile |
| booking | list, get, create, cancel, availableSlots |
| wheel | spin, prizes, usePrize |
| promotions | list, applyCode |
| support | messages, send, allChats, replyAsAdmin |
| admin | dashboard, confirmPayment, confirmVisit, allBookings, allUsers |

## Запуск

```bash
cd /mnt/agents/output/app
npm run dev       # Dev сервер на localhost:3000
npm run build     # Production build
npm run check     # TypeScript проверка
npm run db:push   # Синхронизация базы данных
```

## Таблицы базы данных

- **users** — пользователи, баланс бонусов, уровень лояльности, реферальный код
- **bookings** — бронирования со статусами и QR-кодами
- **referrals** — реферальная система
- **subscriptions** — абонементы
- **support_messages** — сообщения чата поддержки
- **wheel_rewards** — призы колеса удачи
- **promotions** — акции и промокоды
- **notifications** — уведомления пользователей

## Дизайн

Ocean glassmorphism с:
- Живым анимированным градиентом фона (12s цикл)
- Liquid glass поверхностями с реальным blur
- 3 сгенерированных ocean lifestyle изображения
- Скелетон-лоадерами, анимированными карточками
- Confetti эффектом при выигрыше на колесе
