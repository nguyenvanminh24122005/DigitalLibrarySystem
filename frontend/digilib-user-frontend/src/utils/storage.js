export function getStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

export function daysLeft(dateStr) {
  if (!dateStr) return null;
  const end = new Date(dateStr);
  const now = new Date();
  end.setHours(23, 59, 59, 999);
  const diff = Math.ceil((end.getTime() - now.getTime()) / 86400000);
  return diff;
}

export function currencyVND(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' đ';
}
