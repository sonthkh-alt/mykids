import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditMeta {
  action: string;
  resource: string;
}

/** Đánh dấu handler cần ghi audit log. Ví dụ: @Audit('UPDATE', 'ai_prompt'). */
export const Audit = (action: string, resource: string) =>
  SetMetadata(AUDIT_KEY, { action, resource } satisfies AuditMeta);
