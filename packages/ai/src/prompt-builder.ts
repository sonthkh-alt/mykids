import type { StudentPersona } from '@ai-academy/types';

/**
 * Nén hồ sơ học sinh thành đoạn ngữ cảnh chèn vào prompt hệ thống.
 * Đây là trái tim của Personalization: AI sẽ dùng sở thích để tạo ví dụ
 * (Robot, Minecraft, khủng long...) và điều chỉnh độ khó theo trình độ + lớp.
 */
export function buildPersonaContext(persona: StudentPersona): string {
  const interests = persona.interests.length
    ? persona.interests.join(', ')
    : 'chưa rõ';
  const styleLabel: Record<string, string> = {
    VISUAL: 'học bằng hình ảnh (dùng nhiều ví dụ trực quan, emoji)',
    AUDITORY: 'học bằng âm thanh (mô tả như đang kể/đọc to)',
    KINESTHETIC: 'học bằng vận động (gợi ý hành động, thao tác tay)',
    READING_WRITING: 'học bằng đọc-viết (liệt kê, ghi chú gọn)',
  };

  return [
    `HỒ SƠ HỌC SINH (dùng để cá nhân hóa, KHÔNG đọc lại cho học sinh):`,
    `- Tên: ${persona.displayName}`,
    `- Lớp: ${persona.grade} (tuổi ~${persona.grade + 5})`,
    `- Sở thích: ${interests}`,
    `- Trình độ tiếng Anh: ${persona.englishLevel}`,
    `- Trình độ Toán: ${persona.mathLevel}`,
    `- Phong cách học: ${styleLabel[persona.learningStyle] ?? persona.learningStyle}`,
    ``,
    `YÊU CẦU: Khi tạo ví dụ/câu chuyện, hãy ưu tiên lồng ghép sở thích của em.`,
    `Dùng tiếng Việt thân thiện, vui vẻ, câu ngắn, phù hợp lứa tuổi.`,
  ].join('\n');
}

/** Thay biến {{key}} trong template bằng giá trị thực. */
export function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    key in vars ? vars[key]! : `{{${key}}}`,
  );
}
