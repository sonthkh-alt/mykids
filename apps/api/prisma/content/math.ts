import { mcQuestion, rint, type SeedCourse, type SeedLesson, type SeedQuestion } from './types';

/** Sinh các đáp án nhiễu (distractor) gần với đáp án đúng cho câu số học. */
function numDistractors(answer: number): string[] {
  const set = new Set<number>();
  const candidates = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, Math.max(0, answer - 10), answer * 2];
  for (const c of candidates) {
    if (c !== answer && c >= 0) set.add(c);
    if (set.size >= 3) break;
  }
  return [...set].map(String);
}

type Gen = (grade: number) => SeedQuestion;

const num = (n: number) => n.toLocaleString('vi-VN');

const generators: Record<string, Gen> = {
  add: (g) => {
    const max = g <= 3 ? 100 : g === 4 ? 1000 : 10000;
    const a = rint(max / 10, max), b = rint(max / 10, max);
    const ans = a + b;
    return mcQuestion(`${num(a)} + ${num(b)} = ?`, num(ans), numDistractors(ans).map((d) => num(Number(d))), `Cộng từng hàng: ${num(a)} + ${num(b)} = ${num(ans)}.`);
  },
  sub: (g) => {
    const max = g <= 3 ? 100 : g === 4 ? 1000 : 10000;
    const a = rint(max / 2, max), b = rint(1, a);
    const ans = a - b;
    return mcQuestion(`${num(a)} − ${num(b)} = ?`, num(ans), numDistractors(ans).map((d) => num(Number(d))), `${num(a)} − ${num(b)} = ${num(ans)}.`);
  },
  mul: (g) => {
    const m = g <= 3 ? 5 : g === 4 ? 9 : 12;
    const a = rint(2, m), b = rint(2, g <= 4 ? 9 : 99);
    const ans = a * b;
    return mcQuestion(`${a} × ${num(b)} = ?`, num(ans), numDistractors(ans).map((d) => num(Number(d))), `${a} × ${num(b)} = ${num(ans)}.`);
  },
  div: () => {
    const b = rint(2, 9), q = rint(2, 12);
    const a = b * q;
    return mcQuestion(`${a} : ${b} = ?`, String(q), numDistractors(q), `${a} : ${b} = ${q} vì ${b} × ${q} = ${a}.`);
  },
  compare: (g) => {
    const max = g <= 3 ? 100 : 9999;
    const a = rint(1, max), b = rint(1, max);
    const ans = a > b ? '>' : a < b ? '<' : '=';
    return mcQuestion(`So sánh: ${num(a)} ... ${num(b)}`, ans, ['>', '<', '='].filter((x) => x !== ans), `${num(a)} ${ans} ${num(b)}.`);
  },
  rounding: () => {
    const a = rint(11, 9989);
    const ans = Math.round(a / 10) * 10;
    return mcQuestion(`Làm tròn ${num(a)} đến hàng chục`, num(ans), numDistractors(ans).map((d) => num(Math.round(Number(d) / 10) * 10)), `Chữ số hàng đơn vị là ${a % 10}, nên làm tròn thành ${num(ans)}.`);
  },
  fraction_add: () => {
    const d = rint(3, 9), a = rint(1, d - 1), b = rint(1, d - a);
    const ans = a + b;
    return mcQuestion(`${a}/${d} + ${b}/${d} = ?`, `${ans}/${d}`, [`${ans + 1}/${d}`, `${a + b}/${d + d}`, `${Math.max(1, ans - 1)}/${d}`], `Cùng mẫu số: cộng tử số ${a} + ${b} = ${ans}, giữ mẫu ${d}.`);
  },
  perimeter: () => {
    const w = rint(2, 20), h = rint(2, 20);
    const ans = 2 * (w + h);
    return mcQuestion(`Chu vi hình chữ nhật dài ${w}cm, rộng ${h}cm = ? cm`, String(ans), numDistractors(ans), `Chu vi = 2 × (dài + rộng) = 2 × (${w} + ${h}) = ${ans} cm.`);
  },
  area: () => {
    const w = rint(2, 20), h = rint(2, 20);
    const ans = w * h;
    return mcQuestion(`Diện tích hình chữ nhật dài ${w}cm, rộng ${h}cm = ? cm²`, String(ans), numDistractors(ans), `Diện tích = dài × rộng = ${w} × ${h} = ${ans} cm².`);
  },
  average: () => {
    const k = 3, vals = Array.from({ length: k }, () => rint(2, 30));
    const ans = Math.round(vals.reduce((a, b) => a + b, 0) / k);
    return mcQuestion(`Trung bình cộng của ${vals.join(', ')} ≈ ?`, String(ans), numDistractors(ans), `(${vals.join(' + ')}) : ${k} ≈ ${ans}.`);
  },
  percent: () => {
    const base = rint(1, 10) * 10, p = [10, 20, 25, 50][rint(0, 3)]!;
    const ans = (base * p) / 100;
    return mcQuestion(`${p}% của ${base} = ?`, String(ans), numDistractors(ans), `${p}% nghĩa là ${p}/100. ${base} × ${p}/100 = ${ans}.`);
  },
  word: () => {
    const a = rint(5, 40), b = rint(1, a);
    const names = ['Lan', 'Minh', 'An', 'Bình', 'Hoa', 'Nam'];
    const items = ['cái kẹo', 'quyển vở', 'viên bi', 'quả táo', 'bông hoa'];
    const nm = names[rint(0, names.length - 1)], it = items[rint(0, items.length - 1)];
    const ans = a - b;
    return mcQuestion(`${nm} có ${a} ${it}, cho bạn ${b} ${it}. Hỏi ${nm} còn lại bao nhiêu?`, String(ans), numDistractors(ans), `Còn lại = ${a} − ${b} = ${ans}.`);
  },
};

const TOPICS_BY_GRADE: Record<number, { key: string; label: string }[]> = {
  3: [
    { key: 'add', label: 'Phép cộng' }, { key: 'sub', label: 'Phép trừ' },
    { key: 'mul', label: 'Bảng nhân' }, { key: 'div', label: 'Phép chia' },
    { key: 'compare', label: 'So sánh số' }, { key: 'word', label: 'Toán đố' },
  ],
  4: [
    { key: 'add', label: 'Cộng có nhớ' }, { key: 'sub', label: 'Trừ có nhớ' },
    { key: 'mul', label: 'Nhân số lớn' }, { key: 'div', label: 'Chia có dư' },
    { key: 'rounding', label: 'Làm tròn số' }, { key: 'perimeter', label: 'Chu vi' },
    { key: 'word', label: 'Giải toán có lời văn' },
  ],
  5: [
    { key: 'add', label: 'Số tự nhiên lớn' }, { key: 'fraction_add', label: 'Cộng phân số' },
    { key: 'area', label: 'Diện tích' }, { key: 'average', label: 'Trung bình cộng' },
    { key: 'mul', label: 'Nhân nhẩm' }, { key: 'word', label: 'Toán đố nâng cao' },
  ],
  6: [
    { key: 'fraction_add', label: 'Phân số' }, { key: 'percent', label: 'Tỉ số phần trăm' },
    { key: 'area', label: 'Hình học' }, { key: 'average', label: 'Trung bình cộng' },
    { key: 'rounding', label: 'Số thập phân' }, { key: 'word', label: 'Toán thực tế' },
  ],
};

/** Sinh chương trình Toán cho 4 khối lớp. `lessonsPerTopic` × `qPerLesson` điều khiển dung lượng. */
export function buildMath(lessonsPerTopic: number, qPerLesson: number): SeedCourse[] {
  const courses: SeedCourse[] = [];
  for (const grade of [3, 4, 5, 6]) {
    const lessons: SeedLesson[] = [];
    for (const topic of TOPICS_BY_GRADE[grade]!) {
      for (let i = 1; i <= lessonsPerTopic; i++) {
        const gen = generators[topic.key]!;
        const questions = Array.from({ length: qPerLesson }, () => gen(grade));
        lessons.push({
          title: `${topic.label} — Phần ${i}`,
          module: topic.label,
          estMinutes: 8,
          xpReward: 20,
          type: 'MULTIPLE_CHOICE',
          questions,
        });
      }
    }
    courses.push({
      subject: 'MATH',
      title: `Toán Lớp ${grade}`,
      slug: `math-grade-${grade}`,
      description: `Toàn bộ chủ đề Toán lớp ${grade}: ${TOPICS_BY_GRADE[grade]!.map((t) => t.label).join(', ')}.`,
      gradeMin: grade,
      gradeMax: grade,
      lessons,
    });
  }
  return courses;
}
