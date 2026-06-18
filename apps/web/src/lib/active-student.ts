'use client';

/** Lưu "con đang học" để phụ huynh chọn học cho từng bé. */
const KEY = 'aa_active_student';

export const activeStudentStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(KEY);
  },
  set(id: string) {
    localStorage.setItem(KEY, id);
    // Báo cho các component đang mở biết để cập nhật ngay (không cần tải lại trang).
    window.dispatchEvent(new CustomEvent('active-student-changed', { detail: id }));
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};
