'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { XpEventResult } from '@ai-academy/types';
import { Button } from '@/components/ui/button';

const CONFETTI = ['🎉', '⭐', '✨', '🎊', '🏆', '💎', '🌟'];

/** Lớp phủ ăn mừng khi hoàn thành: confetti + XP + level-up + badge mới. */
export function Celebrate({
  result,
  onClose,
}: {
  result: (XpEventResult & { correct?: number; total?: number }) | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [result, onClose]);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Confetti rơi */}
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute text-2xl"
              initial={{ y: -80, x: `${(i * 37) % 100}vw`, opacity: 1, rotate: 0 }}
              animate={{ y: '100vh', rotate: 360 }}
              transition={{ duration: 2.2 + (i % 5) * 0.4, ease: 'easeIn', delay: (i % 6) * 0.1 }}
            >
              {CONFETTI[i % CONFETTI.length]}
            </motion.span>
          ))}

          <motion.div
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-pop-lg"
            initial={{ scale: 0.6, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 text-5xl">{result.leveledUp ? '🏆' : '🎉'}</div>
            <h2 className="font-display text-2xl font-extrabold text-ink">
              {result.leveledUp ? `Lên cấp ${result.level}!` : 'Làm tốt lắm!'}
            </h2>

            {typeof result.correct === 'number' && (
              <p className="mt-1 font-body text-ink/60">
                Đúng {result.correct}/{result.total} câu
              </p>
            )}

            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-brand/15 px-4 py-2">
              <span className="font-display text-xl font-extrabold text-brand">
                +{result.xpGained} XP
              </span>
            </div>

            {result.streakDays > 1 && (
              <p className="mt-3 font-body font-bold text-coral">
                🔥 Chuỗi {result.streakDays} ngày!
              </p>
            )}

            {result.badgesUnlocked?.length > 0 && (
              <div className="mt-4 rounded-xl bg-sun/15 p-3">
                <p className="text-sm font-bold text-ink/70">🏅 Huy hiệu mới!</p>
                <p className="font-display font-bold text-ink">
                  {result.badgesUnlocked.map((b) => b.name).join(', ')}
                </p>
              </div>
            )}

            <Button className="mt-5 w-full" onClick={onClose}>
              Tuyệt vời! 🚀
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
