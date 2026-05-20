/**
 * Supabase REST API client
 * Works directly from frontend - no backend needed
 */

const SUPABASE_URL = "https://ahzeqqxqwqzcwyihtzjd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoemVxcXhxd3F6Y3d5aWh0empkIiwicm9sZSIsImFub24iLCJpYXQiOjE3NzkyMTkwMjUsImV4cCI6MjA5NDc5NTAyNX0.EDj5xM71PDlgy2kwwy58yIQ5BYvxYyr8yommfMXupo8";

const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

// ─── USERS ──────────────────────────────────────────────

export interface DbUser {
  id: number;
  phone: string;
  name: string;
  password: string;
  bonus_balance: number;
  visits_count: number;
  total_spent: number;
  referral_code: string;
  role: "user" | "employee" | "admin";
  spins_available: number;
  created_at: string;
}

export async function findUserByPhone(phone: string): Promise<DbUser | null> {
  const cleanPhone = phone.replace(/\D/g, "");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?phone=eq.${cleanPhone}&select=*&limit=1`, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

export async function createUser(name: string, phone: string, password: string): Promise<DbUser | null> {
  const cleanPhone = phone.replace(/\D/g, "");
  const referralCode = `OW-${Math.floor(Math.random() * 9000 + 1000)}`;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: "POST",
    headers: { ...headers, "Prefer": "return=representation" },
    body: JSON.stringify({
      phone: cleanPhone,
      name,
      password,
      bonus_balance: 300,
      visits_count: 0,
      total_spent: 0,
      referral_code: referralCode,
      role: "user",
      spins_available: 3,
    }),
  });

  if (!res.ok) {
    console.error("Create user failed:", await res.text());
    return null;
  }
  const data = await res.json();
  return data[0] || null;
}

export async function updateUserSpins(phone: string, spins: number): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, "");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?phone=eq.${cleanPhone}`, {
    method: "PATCH",
    headers: { ...headers, "Prefer": "return=minimal" },
    body: JSON.stringify({ spins_available: spins }),
  });
  return res.ok;
}

export async function addBonus(phone: string, amount: number): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, "");
  // Get current
  const user = await findUserByPhone(cleanPhone);
  if (!user) return false;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?phone=eq.${cleanPhone}`, {
    method: "PATCH",
    headers: { ...headers, "Prefer": "return=minimal" },
    body: JSON.stringify({ bonus_balance: user.bonus_balance + amount }),
  });
  return res.ok;
}

// ─── BOOKINGS ───────────────────────────────────────────

export interface DbBooking {
  id: number;
  user_phone: string;
  date: string;
  time: string;
  duration: number;
  boards: number;
  instructor: boolean;
  rescuers: boolean;
  total_price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment_method: "qr" | "card";
  created_at: string;
}

export async function createBooking(booking: Omit<DbBooking, "id" | "created_at">): Promise<DbBooking | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
    method: "POST",
    headers: { ...headers, "Prefer": "return=representation" },
    body: JSON.stringify(booking),
  });
  if (!res.ok) {
    console.error("Create booking failed:", await res.text());
    return null;
  }
  const data = await res.json();
  return data[0] || null;
}

export async function getUserBookings(phone: string): Promise<DbBooking[]> {
  const cleanPhone = phone.replace(/\D/g, "");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings?user_phone=eq.${cleanPhone}&select=*&order=created_at.desc`, { headers });
  if (!res.ok) return [];
  return await res.json();
}

// ─── INIT TABLES (run once) ─────────────────────────────

export async function initTables(): Promise<boolean> {
  // Create users table if not exists
  const usersSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      bonus_balance INTEGER DEFAULT 0,
      visits_count INTEGER DEFAULT 0,
      total_spent INTEGER DEFAULT 0,
      referral_code TEXT,
      role TEXT DEFAULT 'user',
      spins_available INTEGER DEFAULT 3,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const bookingsSQL = `
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_phone TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration INTEGER NOT NULL,
      boards INTEGER DEFAULT 1,
      instructor BOOLEAN DEFAULT false,
      rescuers BOOLEAN DEFAULT false,
      total_price INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT DEFAULT 'qr',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Try executing via RPC
  try {
    const res1 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ sql: usersSQL }),
    });
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ sql: bookingsSQL }),
    });
    console.log("Tables init:", res1.ok, res2.ok);
    return res1.ok && res2.ok;
  } catch {
    // Tables might already exist, that's fine
    return true;
  }
}
