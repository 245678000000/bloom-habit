const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

export function withMidday(date: Date) {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

export function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, days: number) {
  const copy = withMidday(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function getPastDates(days: number, from = new Date()) {
  return Array.from({ length: days }, (_, i) => addDays(from, -(days - i - 1)));
}

export function formatToday(date = new Date()) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAY_LABELS[date.getDay()];
  return `${month}月${day}日 ${weekday}`;
}

export function isWeekday(date: Date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

export function isSameDay(a: Date, b: Date) {
  return toDateKey(a) === toDateKey(b);
}

export function isFutureDay(date: Date, today = new Date()) {
  return startOfDay(date).getTime() > startOfDay(today).getTime();
}

export function formatMonthDay(key: string) {
  const date = fromDateKey(key);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function weekdayShortLabel(date: Date) {
  return WEEKDAY_LABELS[date.getDay()]?.replace("周", "") ?? "";
}
