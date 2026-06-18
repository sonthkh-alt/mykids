/**
 * Đường cong cấp độ (leveling curve) cho gamification.
 *
 * Tổng XP cần để đạt cấp `L` (bắt đầu từ cấp 1 = 0 XP):
 *   totalXpForLevel(L) = BASE * (L-1)^EXP
 * Chọn tăng dần (super-linear) để giữ động lực: cấp đầu nhanh, cấp sau lâu hơn.
 */

const BASE = 100;
const EXP = 1.5;

/** Tổng XP tích lũy cần để ĐẠT tới cấp `level` (level >= 1). */
export function totalXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE * Math.pow(level - 1, EXP));
}

/** Từ tổng XP → cấp hiện tại. */
export function levelFromXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  let level = 1;
  while (totalXpForLevel(level + 1) <= totalXp) level += 1;
  return level;
}

export interface LevelProgress {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressRatio: number; // 0..1
}

/** Tiến độ chi tiết trong cấp hiện tại — phục vụ thanh XP trên UI. */
export function getLevelProgress(totalXp: number): LevelProgress {
  const level = levelFromXp(totalXp);
  const floor = totalXpForLevel(level);
  const ceil = totalXpForLevel(level + 1);
  const span = Math.max(1, ceil - floor);
  const into = totalXp - floor;
  return {
    level,
    totalXp,
    xpIntoLevel: into,
    xpForNextLevel: ceil - totalXp,
    progressRatio: Math.min(1, into / span),
  };
}

/** Kết quả khi cộng XP — dùng bởi gamification engine. */
export interface AwardXpOutcome {
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  totalXp: number;
}

export function awardXp(currentTotalXp: number, amount: number): AwardXpOutcome {
  const previousLevel = levelFromXp(currentTotalXp);
  const totalXp = Math.max(0, currentTotalXp + Math.round(amount));
  const newLevel = levelFromXp(totalXp);
  return { previousLevel, newLevel, leveledUp: newLevel > previousLevel, totalXp };
}
