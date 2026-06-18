'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ApiClientError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 text-center font-display text-3xl font-extrabold text-ink">
        Chào mừng trở lại! 👋
      </h1>
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm font-semibold text-coral">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Đang vào...' : 'Đăng nhập'}
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-sm font-semibold text-ink/60">
          <Link href="/forgot-password" className="hover:text-brand">
            Quên mật khẩu?
          </Link>
          <Link href="/register" className="hover:text-brand">
            Tạo tài khoản
          </Link>
        </div>
      </Card>
    </main>
  );
}
