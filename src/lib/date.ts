const appTimeZone = process.env.APP_TIME_ZONE || "Asia/Tokyo";

export function getTodayDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: appTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: appTimeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
