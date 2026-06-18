/* eslint-disable no-console */
import { PrismaClient, Subject } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu AI Academy...');

  // 1) Admin
  const adminHash = await argon2.hash('Admin@12345', { type: argon2.argon2id });
  await prisma.user.upsert({
    where: { email: 'admin@aiacademy.vn' },
    update: {},
    create: {
      email: 'admin@aiacademy.vn',
      passwordHash: adminHash,
      role: 'ADMIN',
      fullName: 'Quản trị viên',
    },
  });

  // 2) Phụ huynh demo + con
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

  const existingStudent = await prisma.student.findFirst({
    where: { parentId: parentUser.parent!.id },
  });
  if (!existingStudent) {
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

  // 3) Avatars
  const avatars = [
    { code: 'fox', name: 'Cáo Lửa', imageUrl: '/avatars/fox.png', isDefault: true, unlockCost: 0 },
    { code: 'astro', name: 'Phi Hành Gia', imageUrl: '/avatars/astro.png', unlockCost: 200 },
    { code: 'robot', name: 'Robo Xanh', imageUrl: '/avatars/robot.png', unlockCost: 500 },
  ];
  for (const a of avatars) {
    await prisma.avatar.upsert({ where: { code: a.code }, update: {}, create: a });
  }

  // 4) Badges
  const badges = [
    { code: 'first-step', name: 'Bước Đầu Tiên', description: 'Hoàn thành bài học đầu tiên', iconUrl: '/badges/first.png', rarity: 'COMMON' as const, criteria: { type: 'LESSONS_COMPLETED', value: 1 } },
    { code: 'streak-7', name: 'Siêng Năng', description: 'Học 7 ngày liên tiếp', iconUrl: '/badges/streak7.png', rarity: 'RARE' as const, criteria: { type: 'STREAK', value: 7 } },
    { code: 'xp-1000', name: 'Nhà Thông Thái', description: 'Đạt 1000 XP', iconUrl: '/badges/xp1000.png', rarity: 'EPIC' as const, criteria: { type: 'XP_TOTAL', value: 1000 } },
    { code: 'level-10', name: 'Bậc Thầy Nhí', description: 'Đạt cấp 10', iconUrl: '/badges/lv10.png', rarity: 'LEGENDARY' as const, criteria: { type: 'LEVEL', value: 10 } },
  ];
  for (const b of badges) {
    await prisma.badge.upsert({ where: { code: b.code }, update: {}, create: b });
  }

  // 5) Rewards
  const rewardCount = await prisma.reward.count();
  if (rewardCount === 0) {
    await prisma.reward.createMany({
      data: [
        { name: 'Mở khóa Avatar Phi Hành Gia', description: 'Avatar không gian ngầu', iconUrl: '/rewards/astro.png', costXp: 200, kind: 'AVATAR', payload: { avatarCode: 'astro' } },
        { name: 'Theme Minecraft', description: 'Giao diện phong cách Minecraft', iconUrl: '/rewards/mc.png', costXp: 300, kind: 'THEME', payload: { themeCode: 'minecraft' } },
        { name: 'Gấp đôi XP 1 giờ', description: 'Power-up x2 XP', iconUrl: '/rewards/x2.png', costXp: 150, kind: 'POWER_UP', payload: { boost: 2 } },
        { name: 'Phiếu bé ngoan', description: 'Đổi quà thực tế (phụ huynh duyệt)', iconUrl: '/rewards/coupon.png', costXp: 1000, kind: 'REAL_WORLD' },
      ],
    });
  }

  // 6) Khóa học mẫu cho mỗi môn (1 course + 1 lesson + 1 exercise + 2 câu hỏi)
  const courses: { subject: Subject; title: string; module: string; lesson: string }[] = [
    { subject: 'ENGLISH', title: 'Tiếng Anh Lớp 4 - Cơ bản', module: 'Vocabulary', lesson: 'Animals' },
    { subject: 'MATH', title: 'Toán Lớp 4 - Tính nhẩm', module: 'Tính nhẩm', lesson: 'Phép cộng nhanh' },
    { subject: 'SCIENCE', title: 'Khoa học - Thế giới động vật', module: 'Động vật', lesson: 'Loài có vú' },
    { subject: 'READING', title: 'Đọc hiểu Lớp 4', module: 'Đọc hiểu', lesson: 'Chú mèo thông minh' },
    { subject: 'CODING', title: 'Lập trình nhập môn', module: 'Logic Game', lesson: 'Tuần tự & lặp' },
  ];

  for (const [i, c] of courses.entries()) {
    const slug = `${c.subject.toLowerCase()}-grade4`;
    const course = await prisma.course.upsert({
      where: { slug },
      update: {},
      create: {
        subject: c.subject,
        title: c.title,
        slug,
        gradeMin: 3,
        gradeMax: 6,
        orderIndex: i,
        lessons: {
          create: {
            title: c.lesson,
            slug: `${slug}-l1`,
            module: c.module,
            orderIndex: 0,
            xpReward: 25,
            estMinutes: 10,
            exercises: {
              create: {
                type: 'MULTIPLE_CHOICE',
                prompt: 'Chọn đáp án đúng',
                orderIndex: 0,
                xpReward: 5,
                questions: {
                  create: [
                    {
                      text: c.subject === 'MATH' ? '7 + 8 = ?' : 'Đâu là câu trả lời đúng?',
                      orderIndex: 0,
                      explanation: 'Giải thích ngắn gọn cho đáp án đúng.',
                      answerOptions: {
                        create:
                          c.subject === 'MATH'
                            ? [
                                { text: '15', isCorrect: true, orderIndex: 0 },
                                { text: '14', isCorrect: false, orderIndex: 1 },
                                { text: '16', isCorrect: false, orderIndex: 2 },
                              ]
                            : [
                                { text: 'Đáp án A (đúng)', isCorrect: true, orderIndex: 0 },
                                { text: 'Đáp án B', isCorrect: false, orderIndex: 1 },
                                { text: 'Đáp án C', isCorrect: false, orderIndex: 2 },
                              ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    });
    console.log(`  ✓ Course: ${course.title}`);
  }

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
