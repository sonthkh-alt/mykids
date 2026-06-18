'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, MessageCircleHeart, Gift, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/home', label: 'Trang chủ', icon: Home },
  { href: '/worlds', label: 'Thế giới', icon: Map },
  { href: '/tutor', label: 'AI Tutor', icon: MessageCircleHeart },
  { href: '/rewards', label: 'Phần thưởng', icon: Gift },
  { href: '/profile', label: 'Hồ sơ', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t-2 border-black/5 bg-white">
      <ul className="flex items-stretch justify-around">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition-colors',
                  active ? 'text-brand' : 'text-ink/40',
                )}
              >
                <it.icon className={cn('h-6 w-6', active && 'animate-bounce-in')} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
