import { mcQuestion, rint, shuffle, type SeedLesson, type SeedQuestion } from './types';

function nd(answer: number, count = 3): string[] {
  const set = new Set<number>();
  const cands = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 5, answer - 3, answer * 2, answer + 10];
  for (const c of cands) {
    if (c !== answer && c >= 0) set.add(c);
    if (set.size >= count) break;
  }
  return [...set].map(String);
}

type Gen = (tier: number) => SeedQuestion;

const SHAPES = ['🔺', '🔵', '🟩', '⭐', '❤️', '🟨'];

const gens: { module: string; minTier: number; gen: Gen }[] = [
  // Dãy số cộng đều
  { module: 'Dãy số & Quy luật', minTier: 0, gen: (t) => {
    const start = rint(1, 9), step = rint(1, 3 + t);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    const ans = start + 4 * step;
    return mcQuestion(`Số tiếp theo: ${seq.join(', ')}, ?`, String(ans), nd(ans), `Mỗi số tăng thêm ${step} → ${ans}.`);
  }},
  // Dãy trừ đều
  { module: 'Dãy số & Quy luật', minTier: 0, gen: () => {
    const step = rint(1, 4), start = step * 5 + rint(5, 15);
    const seq = [start, start - step, start - 2 * step, start - 3 * step];
    const ans = start - 4 * step;
    return mcQuestion(`Số tiếp theo: ${seq.join(', ')}, ?`, String(ans), nd(ans), `Mỗi số giảm ${step} → ${ans}.`);
  }},
  // Dãy nhân đôi / nhân ba
  { module: 'Dãy số & Quy luật', minTier: 1, gen: () => {
    const start = rint(1, 4), mul = rint(2, 3);
    const seq = [start, start * mul, start * mul * mul];
    const ans = start * mul * mul * mul;
    return mcQuestion(`Quy luật nhân ${mul}: ${seq.join(', ')}, ?`, String(ans), nd(ans), `Mỗi số gấp ${mul} lần số trước → ${ans}.`);
  }},
  // Dãy Fibonacci-like
  { module: 'Dãy số & Quy luật', minTier: 2, gen: () => {
    const a = rint(1, 4), b = rint(1, 5);
    const seq = [a, b, a + b, a + 2 * b];
    const ans = 2 * a + 3 * b;
    return mcQuestion(`Mỗi số = tổng 2 số trước: ${seq.join(', ')}, ?`, String(ans), nd(ans), `${a + b} + ${a + 2 * b} = ${ans}.`);
  }},
  // Mẫu hình lặp
  { module: 'Dãy số & Quy luật', minTier: 0, gen: () => {
    const cycle = shuffle(SHAPES).slice(0, rint(2, 3));
    const len = cycle.length;
    const display = Array.from({ length: 6 }, (_, i) => cycle[i % len]);
    const ans = cycle[6 % len]!;
    return mcQuestion(`Hình tiếp theo: ${display.join(' ')} ?`, ans, SHAPES.filter((s) => s !== ans).slice(0, 3), `Mẫu lặp lại ${cycle.join(' ')}, nên tiếp theo là ${ans}.`);
  }},
  // If-then chẵn lẻ
  { module: 'Logic Điều kiện', minTier: 0, gen: () => {
    const n = rint(1, 30), even = n % 2 === 0;
    return mcQuestion(`NẾU số chia hết cho 2 THÌ in "Chẵn" NGƯỢC LẠI in "Lẻ". Số ${n} → ?`, even ? 'Chẵn' : 'Lẻ', [even ? 'Lẻ' : 'Chẵn', 'Cả hai', 'Không in'], `${n} ${even ? 'chia hết' : 'không chia hết'} cho 2.`);
  }},
  // If-then so sánh
  { module: 'Logic Điều kiện', minTier: 1, gen: () => {
    const x = rint(1, 20), th = 10;
    const out = x > th ? 'To' : 'Nhỏ';
    return mcQuestion(`NẾU x > ${th} THÌ in "To" NGƯỢC LẠI "Nhỏ". x = ${x} → ?`, out, [out === 'To' ? 'Nhỏ' : 'To', 'Bằng', 'Lỗi'], `${x} ${x > th ? '>' : '≤'} ${th} → "${out}".`);
  }},
  // Boolean AND/OR
  { module: 'Logic Điều kiện', minTier: 2, gen: () => {
    const a = Math.random() < 0.5, b = Math.random() < 0.5, useAnd = Math.random() < 0.5;
    const res = useAnd ? a && b : a || b;
    const tf = (v: boolean) => (v ? 'Đúng' : 'Sai');
    return mcQuestion(`${tf(a)} ${useAnd ? 'VÀ' : 'HOẶC'} ${tf(b)} = ?`, tf(res), [tf(!res), 'Không rõ'], useAnd ? 'Phép VÀ chỉ Đúng khi cả hai Đúng.' : 'Phép HOẶC Đúng khi ít nhất một vế Đúng.');
  }},
  // Vòng lặp đơn
  { module: 'Vòng lặp', minTier: 0, gen: () => {
    const n = rint(2, 8);
    return mcQuestion(`Lặp ${n} lần: "tiến 1 ô". Robot đi mấy ô?`, String(n), nd(n), `${n} lần × 1 ô = ${n} ô.`);
  }},
  // Vòng lặp với bước
  { module: 'Vòng lặp', minTier: 1, gen: () => {
    const n = rint(2, 6), step = rint(2, 5);
    const ans = n * step;
    return mcQuestion(`Lặp ${n} lần: "tiến ${step} ô". Robot đi mấy ô?`, String(ans), nd(ans), `${n} × ${step} = ${ans} ô.`);
  }},
  // Vòng lặp lồng
  { module: 'Vòng lặp', minTier: 2, gen: () => {
    const a = rint(2, 5), b = rint(2, 5);
    const ans = a * b;
    return mcQuestion(`Lặp ${a} lần { Lặp ${b} lần: vẽ 1 ngôi sao }. Vẽ mấy ngôi sao?`, String(ans), nd(ans), `${a} × ${b} = ${ans} ngôi sao.`);
  }},
  // Robot trên lưới (trái/phải)
  { module: 'Giải đố tư duy', minTier: 1, gen: () => {
    const r = rint(2, 8), l = rint(1, r);
    const ans = r - l;
    return mcQuestion(`Robot ở vị trí 0, đi phải ${r} ô rồi đi trái ${l} ô. Vị trí cuối?`, String(ans), nd(ans), `0 + ${r} − ${l} = ${ans}.`);
  }},
  // Biến (variable tracing)
  { module: 'Giải đố tư duy', minTier: 2, gen: () => {
    const x = rint(1, 9), add = rint(1, 9), mul = 2;
    const ans = (x + add) * mul;
    return mcQuestion(`x = ${x}; x = x + ${add}; x = x × ${mul}. Giá trị x cuối?`, String(ans), nd(ans), `(${x} + ${add}) × ${mul} = ${ans}.`);
  }},
  // Lớn nhất trong 3
  { module: 'Giải đố tư duy', minTier: 0, gen: () => {
    const nums = [rint(1, 50), rint(1, 50), rint(1, 50)];
    const ans = Math.max(...nums);
    return mcQuestion(`Số lớn nhất trong ${nums.join(', ')} là?`, String(ans), nums.filter((n) => n !== ans).map(String).concat(String(ans + 1)), `So sánh ba số → ${ans} lớn nhất.`);
  }},
  // Đếm cách (counting by n)
  { module: 'Dãy số & Quy luật', minTier: 0, gen: () => {
    const step = [2, 5, 10][rint(0, 2)]!, start = step;
    const seq = [start, start + step, start + 2 * step];
    const ans = start + 3 * step;
    return mcQuestion(`Đếm cách ${step}: ${seq.join(', ')}, ?`, String(ans), nd(ans), `Cộng thêm ${step} → ${ans}.`);
  }},
];

const DEBUG_PUZZLES: SeedQuestion[] = [
  mcQuestion('Để pha trà: (1) Rót nước (2) Đun sôi nước (3) Cho trà vào. Bước nào LÀM ĐẦU TIÊN?', 'Đun sôi nước', ['Rót nước', 'Cho trà vào', 'Uống trà'], 'Phải đun sôi nước trước khi pha trà.'),
  mcQuestion('Thứ tự đúng để gửi tin nhắn: A) Bấm gửi B) Mở ứng dụng C) Gõ nội dung. Bước đầu là?', 'Mở ứng dụng', ['Bấm gửi', 'Gõ nội dung', 'Tắt máy'], 'Mở ứng dụng → gõ → gửi.'),
  mcQuestion('Robot không tiến được vì thiếu lệnh nào trong "Lặp 3 lần: { ___ }"?', 'Tiến 1 ô', ['Quay đầu', 'Dừng lại', 'Xóa'], 'Cần lệnh di chuyển bên trong vòng lặp.'),
];

/** Sinh `target` bài học Lập trình/Logic, độ khó tăng dần theo phần. */
export function buildCodingLessons(target: number): SeedLesson[] {
  const lessons: SeedLesson[] = [];
  for (let i = 0; i < target; i++) {
    const tier = Math.min(2, Math.floor((i / target) * 3)); // 0,1,2 theo tiến độ
    const pool = gens.filter((g) => g.minTier <= tier);
    const questions: SeedQuestion[] = [];
    for (let q = 0; q < 8; q++) {
      const pick = pool[rint(0, pool.length - 1)]!;
      questions.push(pick.gen(tier));
    }
    // Thỉnh thoảng chèn câu đố thứ tự (debug)
    if (i % 7 === 0) questions[7] = DEBUG_PUZZLES[rint(0, DEBUG_PUZZLES.length - 1)]!;
    lessons.push({
      title: `Thử thách Logic ${i + 1}`,
      module: ['Cơ bản', 'Trung cấp', 'Nâng cao'][tier]!,
      estMinutes: 8,
      xpReward: 20,
      type: 'MULTIPLE_CHOICE',
      questions,
    });
  }
  return lessons;
}
