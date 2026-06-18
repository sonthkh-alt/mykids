/**
 * @ai-academy/types — Contract types dùng chung giữa frontend và backend.
 * Đây là "ngôn ngữ chung" (Ubiquitous Language) của domain AI Academy.
 */

// ---------- Enums (đồng bộ với Prisma enum) ----------

export const Role = {
  ADMIN: 'ADMIN',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Subject = {
  ENGLISH: 'ENGLISH',
  MATH: 'MATH',
  SCIENCE: 'SCIENCE',
  READING: 'READING',
  CODING: 'CODING',
  LIFE_SKILLS: 'LIFE_SKILLS',
} as const;
export type Subject = (typeof Subject)[keyof typeof Subject];

export const LearningStyle = {
  VISUAL: 'VISUAL',
  AUDITORY: 'AUDITORY',
  KINESTHETIC: 'KINESTHETIC',
  READING_WRITING: 'READING_WRITING',
} as const;
export type LearningStyle = (typeof LearningStyle)[keyof typeof LearningStyle];

export const ProficiencyLevel = {
  BEGINNER: 'BEGINNER',
  ELEMENTARY: 'ELEMENTARY',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;
export type ProficiencyLevel = (typeof ProficiencyLevel)[keyof typeof ProficiencyLevel];

export const ExerciseType = {
  FLASHCARD: 'FLASHCARD',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  FILL_BLANK: 'FILL_BLANK',
  SPEAKING: 'SPEAKING',
  LISTENING: 'LISTENING',
  WRITING: 'WRITING',
  MATCHING: 'MATCHING',
  ORDERING: 'ORDERING',
  CODE_BLOCKS: 'CODE_BLOCKS',
  OPEN_ENDED: 'OPEN_ENDED',
} as const;
export type ExerciseType = (typeof ExerciseType)[keyof typeof ExerciseType];

export const QuestType = {
  ENGLISH: 'ENGLISH',
  MATH: 'MATH',
  READING: 'READING',
  MOVEMENT: 'MOVEMENT',
  CREATIVE: 'CREATIVE',
} as const;
export type QuestType = (typeof QuestType)[keyof typeof QuestType];

export const QuestStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
} as const;
export type QuestStatus = (typeof QuestStatus)[keyof typeof QuestStatus];

export const AiPromptKey = {
  ENGLISH_TUTOR: 'ENGLISH_TUTOR',
  MATH_TUTOR: 'MATH_TUTOR',
  SCIENCE_TUTOR: 'SCIENCE_TUTOR',
  CODING_TUTOR: 'CODING_TUTOR',
  READING_COACH: 'READING_COACH',
  STORY_CREATOR: 'STORY_CREATOR',
  DAILY_QUEST: 'DAILY_QUEST',
  PARENT_REPORT: 'PARENT_REPORT',
} as const;
export type AiPromptKey = (typeof AiPromptKey)[keyof typeof AiPromptKey];

export const FamilyChallengeKind = {
  PARENT_CHILD: 'PARENT_CHILD',
  WHOLE_FAMILY: 'WHOLE_FAMILY',
} as const;
export type FamilyChallengeKind = (typeof FamilyChallengeKind)[keyof typeof FamilyChallengeKind];

// ---------- API envelope ----------

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: { page?: number; pageSize?: number; total?: number };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ---------- Auth DTO ----------

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterParentDto {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  activeStudentId?: string;
}

// ---------- Student / Personalization ----------

export interface StudentProfileDto {
  id: string;
  displayName: string;
  grade: number; // 3..6
  avatarId?: string;
  interests: string[];
  englishLevel: ProficiencyLevel;
  mathLevel: ProficiencyLevel;
  learningStyle: LearningStyle;
  level: number;
  xp: number;
  streakDays: number;
  goal?: string;
}

/** Persona context được nén để chèn vào prompt AI nhằm cá nhân hóa nội dung. */
export interface StudentPersona {
  displayName: string;
  grade: number;
  interests: string[];
  englishLevel: ProficiencyLevel;
  mathLevel: ProficiencyLevel;
  learningStyle: LearningStyle;
}

// ---------- Gamification ----------

export interface XpEventResult {
  xpGained: number;
  totalXp: number;
  level: number;
  leveledUp: boolean;
  badgesUnlocked: BadgeDto[];
  streakDays: number;
}

export interface BadgeDto {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface RewardDto {
  id: string;
  name: string;
  description: string;
  costXp: number;
  iconUrl: string;
  kind: 'AVATAR' | 'THEME' | 'POWER_UP' | 'REAL_WORLD';
  available: boolean;
}

// ---------- AI ----------

export interface AiChatMessageDto {
  role: 'system' | 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface AiTutorRequestDto {
  subject: Subject;
  message: string;
  conversationId?: string;
}

export interface AiTutorResponseDto {
  conversationId: string;
  message: string;
  /** Toán: gợi ý từng bước, không đưa đáp án ngay. */
  hints?: string[];
  encouragement?: string;
}

// ---------- Daily Quest ----------

export interface DailyQuestDto {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  rewardXp: number;
  status: QuestStatus;
}

// ---------- Parent report ----------

export interface PerformanceReportDto {
  studentId: string;
  periodStart: string;
  periodEnd: string;
  totalMinutes: number;
  strengths: string[];
  weaknesses: string[];
  aiSummary: string;
  subjectBreakdown: { subject: Subject; minutes: number; accuracy: number }[];
}
