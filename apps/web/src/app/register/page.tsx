'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AuthTokens, AuthUserDto } from '@ai-academy/types';
import { api, tokenStore, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshMe } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<AuthTokens & { user: AuthUserDto }>(
        '/auth/register',
        form,
        false,
      );
      tokenStore.set(res);
      await refreshMe();
      router.push('/parent/onboarding');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold text-ink">
        Tạo tài khoản phụ huynh
      </h1>
      <p className="mb-6 text-center font-body text-ink/60">
        Phụ huynh tạo tài khoản và quản lý hồ sơ học tập của con.
      </p>
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            id="fullName"
            label="Họ tên phụ huynh"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            id="password"
            label="Mật khẩu (tối thiểu 8 ký tự)"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="text-sm font-semibold text-coral">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Đăng ký'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm font-semibold text-ink/60">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-brand">
            Đăng nhập
          </Link>
        </p>
      </Card>
    </main>
  );
}
