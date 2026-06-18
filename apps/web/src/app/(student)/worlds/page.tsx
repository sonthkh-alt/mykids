'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe2, Calculator, Sparkles, BookOpen, Code2 } from 'lucide-react';

const WORLDS = [
  { subject: 'ENGLISH', name: 'English World', desc: 'Từ vựng, nói, nghe, kể chuyện', icon: Globe2, bg: 'bg-sky' },
  { subject: 'MATH', name: 'Math World', desc: 'Tính nhẩm, tư duy, hình học', icon: Calculator, bg: 'bg-coral' },
  { subject: 'SCIENCE', name: 'Science World', desc: 'Động vật, vũ trụ, thí nghiệm', icon: Sparkles, bg: 'bg-grape' },
  { subject: 'READING', name: 'Reading World', desc: 'Truyện tranh, đọc hiểu', icon: BookOpen, bg: 'bg-sun' },
  { subject: 'CODING', name: 'Coding World', desc: 'Scratch, logic, Python Junior', icon: Code2, bg: 'bg-brand' },
];

export default function WorldsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-extrabold text-ink">Chọn thế giới 🗺️</h1>
      {WORLDS.map((w, i) => (
        <motion.div
          key={w.subject}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <Link href={`/worlds/${w.subject.toLowerCase()}`}>
            <div className={`flex items-center gap-4 rounded-2xl ${w.bg} p-5 text-white shadow-pop-lg`}>
              <w.icon className="h-10 w-10" />
              <div>
                <p className="font-display text-lg font-extrabold">{w.name}</p>
                <p className="text-sm opacity-90">{w.desc}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
