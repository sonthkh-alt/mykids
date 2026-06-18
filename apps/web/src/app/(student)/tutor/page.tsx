'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import type { AiTutorResponseDto, Subject } from '@ai-academy/types';
import { api } from '@/lib/api';
import { useActiveStudent } from '@/hooks/use-active-student';
import { Button } from '@/components/ui/button';

const SUBJECTS: { value: Subject; label: string; emoji: string }[] = [
  { value: 'ENGLISH', label: 'Tiếng Anh', emoji: '🔤' },
  { value: 'MATH', label: 'Toán', emoji: '➗' },
  { value: 'SCIENCE', label: 'Khoa học', emoji: '🔬' },
  { value: 'CODING', label: 'Lập trình', emoji: '💻' },
  { value: 'READING', label: 'Đọc hiểu', emoji: '📖' },
];

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export default function TutorPage() {
  const { data: student } = useActiveStudent();
  const [subject, setSubject] = useState<Subject>('MATH');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'Xin chào! Mình là gia sư AI. Em muốn hỏi bài gì nào? 😊' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useMutation({
    mutationFn: (text: string) =>
      api.post<AiTutorResponseDto>('/ai/tutor/chat', {
        studentId: student!.id,
        subject,
        message: text,
        conversationId,
      }),
    onSuccess: (res) => {
      setConversationId(res.conversationId);
      setMessages((m) => [...m, { role: 'assistant', content: res.message }]);
    },
    onError: () =>
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Xin lỗi, mình chưa trả lời được. Thử lại nhé!' },
      ]),
  });

  function onSend() {
    const text = input.trim();
    if (!text || !student) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    send.mutate(text);
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-3">
      <h1 className="font-display text-xl font-extrabold text-ink">AI Tutor 🤖</h1>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {SUBJECTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSubject(s.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
              subject === s.value ? 'bg-brand text-white' : 'bg-black/5 text-ink/60'
            }`}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white p-4 shadow-pop">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user' ? 'bg-brand text-white' : 'bg-cloud text-ink'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {send.isPending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-cloud px-4 py-2 text-sm text-ink/50">Đang nghĩ...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="h-12 flex-1 rounded-2xl border-2 border-black/10 bg-white px-4 focus:border-brand focus:outline-none"
          placeholder="Hỏi bài ở đây..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
        />
        <Button onClick={onSend} disabled={send.isPending} className="px-4">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
