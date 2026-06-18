'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/auth/forgot-password', { email }, false).catch(() => undefined);
    setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 text-center font-display text-3xl font-extrabold text-ink">
        Quên mật khẩu
      </h1>
      <Card>
        {sent ? (
          <p className="text-center font-body text-ink/70">
            Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi. 📬
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" size="lg">
              Gửi hướng dẫn
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm font-semibold text-ink/60">
          <Link href="/login" className="text-brand">
            ← Quay lại đăng nhập
          </Link>
        </p>
      </Card>
    </main>
  );
}
