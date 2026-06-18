'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const STEPS = [
  { emoji: '🧒', title: 'Tạo hồ sơ con', desc: 'Thêm tên, lớp, sở thích để AI cá nhân hóa bài học.' },
  { emoji: '🎯', title: 'Nhiệm vụ mỗi ngày', desc: 'Con học 20–30 phút với nhiệm vụ vui mỗi ngày.' },
  { emoji: '📊', title: 'Theo dõi tiến bộ', desc: 'Bạn xem báo cáo AI về điểm mạnh, điểm cần cải thiện.' },
];

export default function OnboardingPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-8 text-center">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="text-6xl">🎉</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">
          Chào mừng đến AI Academy!
        </h1>
        <p className="mt-1 font-body text-ink/60">Cùng bắt đầu hành trình học tập của con.</p>
      </motion.div>

      <div className="flex w-full max-w-md flex-col gap-3">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-pop"
          >
            <span className="text-3xl">{s.emoji}</span>
            <div>
              <p className="font-display font-bold text-ink">{s.title}</p>
              <p className="text-sm text-ink/60">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <Link href="/parent/students/new" className="w-full max-w-md">
        <Button size="lg" className="w-full">
          Tạo hồ sơ cho con ngay →
        </Button>
      </Link>
    </div>
  );
}
