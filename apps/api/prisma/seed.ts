/* eslint-disable no-console */
import { randomUUID } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { slugify } from '@ai-academy/utils';
import { buildCurriculum, curriculumStats } from './content';

const prisma = new PrismaClient();

/** Chèn theo lô để tránh quá tải 1 câu lệnh. */
async function chunkedCreate<T>(
  rows: T[],
  fn: (batch: T[]) => Promise<unknown>,
  size = 1000,
) {
  for (let i = 0; i < rows.length; i += size) {
    await fn(rows.slice(i, i + size));
  }
}

async function seedAccounts() {
  const adminHash = await argon2.hash('Admin@12345', { type: argon2.argon2id });
  await prisma.user.upsert({
    where: { email: 'admin@aiacademy.vn' },
    update: {},
    create: { email: 'admin@aiacademy.vn', passwordHash: adminHash, role: 'ADMIN', fullName: 'Quản trị viên' },
  });

  const parentHash = await argon2.hash('Parent@123', { type: argon2.argon2id });
  const parentUser = await prisma.user.upsert({
    where: { email: 'phuhuynh@demo.vn' },
    update: {},
    create: {
      email: 'phuhuynh@demo.vn',
      passwordHash: parentHash,
      role: 'PARENT',
      fullName: 'Phụ huynh Demo',
      parent: { create: {} },
    },
    include: { parent: true },
  });

  const existing = await prisma.student.findFirst({ where: { parentId: parentUser.parent!.id } });
  if (!existing) {
    await prisma.student.create({
      data: {
        parentId: parentUser.parent!.id,
        displayName: 'Bé Na',
        grade: 4,
        englishLevel: 'ELEMENTARY',
        mathLevel: 'BEGINNER',
        learningStyle: 'VISUAL',
        interests: { create: [{ topic: 'Robot' }, { topic: 'Minecraft' }] },
      },
    });
  }
}

async function seedGamificationCatalog() {
  const avatars = [
    { code: 'fox', name: 'Cáo Lửa', imageUrl: '/avatars/fox.png', isDefault: true, unlockCost: 0 },
    { code: 'astro', name: 'Phi Hành Gia', imageUrl: '/avatars/astro.png', unlockCost: 200 },
    { code: 'robot', name: 'Robo Xanh', imageUrl: '/avatars/robot.png', unlockCost: 500 },
  ];
  for (const a of avatars) await prisma.avatar.upsert({ where: { code: a.code }, update: {}, create: a });

  const badges = [
    { code: 'first-step', name: 'Bước Đầu Tiên', description: 'Hoàn thành bài học đầu tiên', iconUrl: '/badges/first.png', rarity: 'COMMON' as const, criteria: { type: 'LESSONS_COMPLETED', value: 1 } },
    { code: 'lessons-10', name: 'Chăm Học', description: 'Hoàn thành 10 bài học', iconUrl: '/badges/l10.png', rarity: 'COMMON' as const, criteria: { type: 'LESSONS_COMPLETED', value: 10 } },
    { code: 'streak-7', name: 'Siêng Năng', description: 'Học 7 ngày liên tiếp', iconUrl: '/badges/streak7.png', rarity: 'RARE' as const, criteria: { type: 'STREAK', value: 7 } },
    { code: 'streak-30', name: 'Kiên Trì', description: 'Học 30 ngày liên tiếp', iconUrl: '/badges/streak30.png', rarity: 'EPIC' as const, criteria: { type: 'STREAK', value: 30 } },
    { code: 'xp-1000', name: 'Nhà Thông Thái', description: 'Đạt 1000 XP', iconUrl: '/badges/xp1000.png', rarity: 'EPIC' as const, criteria: { type: 'XP_TOTAL', value: 1000 } },
    { code: 'level-10', name: 'Bậc Thầy Nhí', description: 'Đạt cấp 10', iconUrl: '/badges/lv10.png', rarity: 'LEGENDARY' as const, criteria: { type: 'LEVEL', value: 10 } },
  ];
  for (const b of badges) await prisma.badge.upsert({ where: { code: b.code }, update: {}, create: b });

  if ((await prisma.reward.count()) === 0) {
    await prisma.reward.createMany({
      data: [
        { name: 'Mở khóa Avatar Phi Hành Gia', description: 'Avatar không gian ngầu', iconUrl: '/rewards/astro.png', costXp: 200, kind: 'AVATAR', payload: { avatarCode: 'astro' } },
        { name: 'Theme Minecraft', description: 'Giao diện phong cách Minecraft', iconUrl: '/rewards/mc.png', costXp: 300, kind: 'THEME', payload: { themeCode: 'minecraft' } },
        { name: 'Gấp đôi XP 1 giờ', description: 'Power-up x2 XP', iconUrl: '/rewards/x2.png', costXp: 150, kind: 'POWER_UP', payload: { boost: 2 } },
        { name: 'Phiếu bé ngoan', description: 'Đổi quà thực tế (phụ huynh duyệt)', iconUrl: '/rewards/coupon.png', costXp: 1000, kind: 'REAL_WORLD' },
      ],
    });
  }
}

async function seedCurriculum() {
  const scale = Number(process.env.SEED_SCALE ?? '1') || 1;
  const courses = buildCurriculum(scale);
  const stats = curriculumStats(courses);
  console.log(`📚 Sinh chương trình: ${stats.lessons} bài học, ${stats.questions} câu hỏi (~${stats.hours} giờ).`);
  for (const [subject, s] of Object.entries(stats.bySubject)) {
    console.log(`   - ${subject}: ${s.lessons} bài (~${Math.round(s.minutes / 60)} giờ)`);
  }

  // Làm mới catalog (xóa khóa học cũ — cascade xuống lesson/exercise/question/option).
  await prisma.course.deleteMany({});

  const courseRows: Prisma.CourseCreateManyInput[] = [];
  const lessonRows: Prisma.LessonCreateManyInput[] = [];
  const exerciseRows: Prisma.ExerciseCreateManyInput[] = [];
  const questionRows: Prisma.QuestionCreateManyInput[] = [];
  const optionRows: Prisma.AnswerOptionCreateManyInput[] = [];

  courses.forEach((course, ci) => {
    const courseId = randomUUID();
    courseRows.push({
      id: courseId,
      subject: course.subject,
      title: course.title,
      slug: course.slug,
      description: course.description,
      gradeMin: course.gradeMin,
      gradeMax: course.gradeMax,
      orderIndex: ci,
    });
    course.lessons.forEach((lesson, li) => {
      const lessonId = randomUUID();
      lessonRows.push({
        id: lessonId,
        courseId,
        title: lesson.title,
        slug: `${slugify(lesson.title)}-${li}`,
        module: lesson.module,
        orderIndex: li,
        xpReward: lesson.xpReward,
        estMinutes: lesson.estMinutes,
      });
      const exerciseId = randomUUID();
      exerciseRows.push({
        id: exerciseId,
        lessonId,
        type: lesson.type,
        prompt: 'Chọn đáp án đúng nhé!',
        orderIndex: 0,
        xpReward: 5,
      });
      lesson.questions.forEach((q, qi) => {
        const questionId = randomUUID();
        questionRows.push({
          id: questionId,
          exerciseId,
          text: q.text,
          explanation: q.explanation,
          orderIndex: qi,
        });
        q.options.forEach((o, oi) => {
          optionRows.push({
            id: randomUUID(),
            questionId,
            text: o.text,
            isCorrect: o.correct,
            orderIndex: oi,
          });
        });
      });
    });
  });

  console.log('   Đang ghi vào CSDL...');
  await chunkedCreate(courseRows, (b) => prisma.course.createMany({ data: b }));
  await chunkedCreate(lessonRows, (b) => prisma.lesson.createMany({ data: b }));
  await chunkedCreate(exerciseRows, (b) => prisma.exercise.createMany({ data: b }));
  await chunkedCreate(questionRows, (b) => prisma.question.createMany({ data: b }));
  await chunkedCreate(optionRows, (b) => prisma.answerOption.createMany({ data: b }));
  console.log(`   ✓ Đã ghi ${optionRows.length} đáp án.`);
}

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu AI Academy...');
  await seedAccounts();
  await seedGamificationCatalog();
  await seedCurriculum();
  console.log('✅ Seed hoàn tất.');
  console.log('   Admin:  admin@aiacademy.vn / Admin@12345');
  console.log('   Parent: phuhuynh@demo.vn / Parent@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
