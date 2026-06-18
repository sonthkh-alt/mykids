import Link from 'next/link';
import { Sparkles, Rocket, Globe2, Calculator, BookOpen, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const worlds = [
  { icon: Globe2, name: 'English World', color: 'text-sky' },
  { icon: Calculator, name: 'Math World', color: 'text-coral' },
  { icon: Sparkles, name: 'Science World', color: 'text-grape' },
  { icon: BookOpen, name: 'Reading World', color: 'text-sun' },
  { icon: Code2, name: 'Coding World', color: 'text-brand' },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <div className="animate-bounce-in">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand text-white shadow-pop-lg">
          <Rocket className="h-12 w-12" />
        </div>
        <h1 className="font-display text-4xl font-extrabold text-ink">
          AI <span className="text-brand">Academy</span>
        </h1>
        <p className="mt-2 font-body text-lg font-semibold text-ink/70">
          Học như chơi — Chơi mà học 🚀
        </p>
      </div>

      <div className="grid w-full grid-cols-5 gap-2">
        {worlds.map((w) => (
          <div key={w.name} className="flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-pop">
              <w.icon className={`h-6 w-6 ${w.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col gap-3">
        <Link href="/register">
          <Button size="lg" className="w-full">
            Bắt đầu học ngay
          </Button>
        </Link>
        <Link href="/login">
          <Button size="lg" variant="outline" className="w-full">
            Đã có tài khoản? Đăng nhập
          </Button>
        </Link>
      </div>
    </main>
  );
}
