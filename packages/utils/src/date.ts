/** Tiện ích ngày theo timezone — streak tính theo "ngày địa phương" của học sinh. */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Trả về chuỗi YYYY-MM-DD theo timezone cho trước (mặc định Asia/Ho_Chi_Minh). */
export function localDateKey(date: Date, timeZone = 'Asia/Ho_Chi_Minh'): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(date); // en-CA => YYYY-MM-DD
}

/** Số ngày lịch chênh lệch giữa 2 date-key (b - a). */
export function dayDiff(aKey: string, bKey: string): number {
  const a = Date.parse(`${aKey}T00:00:00Z`);
  const b = Date.parse(`${bKey}T00:00:00Z`);
  return Math.round((b - a) / DAY_MS);
}

/**
 * Cập nhật streak: nếu hoạt động hôm nay cách lần trước đúng 1 ngày → +1,
 * cùng ngày → giữ nguyên, cách >1 ngày → reset về 1.
 */
export function nextStreak(
  lastActiveKey: string | null,
  todayKey: string,
  currentStreak: number,
): number {
  if (!lastActiveKey) return 1;
  const diff = dayDiff(lastActiveKey, todayKey);
  if (diff === 0) return Math.max(1, currentStreak);
  if (diff === 1) return currentStreak + 1;
  return 1;
}
