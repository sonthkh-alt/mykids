import { mcQuestion, rint, shuffle, type SeedCourse, type SeedLesson, type SeedQuestion } from './types';

// ============================================================
// SCIENCE — câu hỏi khám phá có giải thích (kể chuyện)
// ============================================================

interface Fact { topic: string; q: string; a: string; d: string[]; e: string }

const SCIENCE_FACTS: Fact[] = [
  { topic: 'Động vật', q: 'Con vật nào lớn nhất trên cạn?', a: 'Voi', d: ['Hổ', 'Hươu cao cổ', 'Sư tử'], e: 'Voi châu Phi là động vật trên cạn lớn nhất, nặng tới 6 tấn!' },
  { topic: 'Động vật', q: 'Loài vật nào ngủ đông suốt mùa lạnh?', a: 'Gấu', d: ['Mèo', 'Chim sẻ', 'Cá vàng'], e: 'Gấu ngủ đông để tiết kiệm năng lượng khi trời lạnh và ít thức ăn.' },
  { topic: 'Động vật', q: 'Cá thở bằng cơ quan nào?', a: 'Mang', d: ['Phổi', 'Da', 'Mũi'], e: 'Cá dùng mang để lấy oxy hòa tan trong nước.' },
  { topic: 'Động vật', q: 'Con vật nào có thể bay nhưng là động vật có vú?', a: 'Dơi', d: ['Chim cánh cụt', 'Đại bàng', 'Bướm'], e: 'Dơi là động vật có vú duy nhất biết bay thật sự.' },
  { topic: 'Vũ trụ', q: 'Hành tinh nào gần Mặt Trời nhất?', a: 'Sao Thủy', d: ['Trái Đất', 'Sao Hỏa', 'Sao Mộc'], e: 'Sao Thủy (Mercury) là hành tinh gần Mặt Trời nhất.' },
  { topic: 'Vũ trụ', q: 'Ngôi sao gần Trái Đất nhất là gì?', a: 'Mặt Trời', d: ['Mặt Trăng', 'Sao Bắc Đẩu', 'Sao Hỏa'], e: 'Mặt Trời chính là một ngôi sao, gần chúng ta nhất.' },
  { topic: 'Vũ trụ', q: 'Hành tinh nào được gọi là "hành tinh đỏ"?', a: 'Sao Hỏa', d: ['Sao Kim', 'Trái Đất', 'Sao Thổ'], e: 'Sao Hỏa có màu đỏ do đất chứa nhiều sắt gỉ.' },
  { topic: 'Vũ trụ', q: 'Trái Đất quay quanh cái gì?', a: 'Mặt Trời', d: ['Mặt Trăng', 'Sao Hỏa', 'Ngân Hà'], e: 'Trái Đất mất 365 ngày để quay một vòng quanh Mặt Trời.' },
  { topic: 'Cơ thể người', q: 'Cơ quan nào bơm máu đi khắp cơ thể?', a: 'Tim', d: ['Phổi', 'Gan', 'Dạ dày'], e: 'Tim như một chiếc bơm, đẩy máu mang oxy đi nuôi cơ thể.' },
  { topic: 'Cơ thể người', q: 'Chúng ta thở bằng cơ quan nào?', a: 'Phổi', d: ['Tim', 'Thận', 'Ruột'], e: 'Phổi lấy oxy từ không khí và thải khí CO₂.' },
  { topic: 'Cơ thể người', q: 'Bộ phận nào giúp ta suy nghĩ?', a: 'Não', d: ['Tim', 'Tay', 'Mắt'], e: 'Não điều khiển suy nghĩ, trí nhớ và mọi hoạt động.' },
  { topic: 'Cơ thể người', q: 'Răng giúp chúng ta làm gì?', a: 'Nhai thức ăn', d: ['Nhìn', 'Nghe', 'Thở'], e: 'Răng nghiền nhỏ thức ăn để dễ tiêu hóa.' },
  { topic: 'Thiên nhiên', q: 'Cây xanh tạo ra khí gì cho chúng ta hít thở?', a: 'Oxy', d: ['Khói', 'Khí CO₂', 'Hơi nước'], e: 'Cây quang hợp, nhả ra oxy — rất quan trọng cho sự sống.' },
  { topic: 'Thiên nhiên', q: 'Nước mưa từ đâu rơi xuống?', a: 'Từ những đám mây', d: ['Từ mặt đất', 'Từ cây', 'Từ núi'], e: 'Hơi nước bốc lên tạo mây, gặp lạnh ngưng tụ rồi rơi xuống thành mưa.' },
  { topic: 'Thiên nhiên', q: 'Mùa nào thường lạnh nhất trong năm?', a: 'Mùa đông', d: ['Mùa hè', 'Mùa xuân', 'Mùa thu'], e: 'Mùa đông có ít nắng nên trời lạnh nhất.' },
  { topic: 'Thí nghiệm', q: 'Khi trộn màu xanh dương và vàng, ta được màu gì?', a: 'Màu xanh lá', d: ['Màu tím', 'Màu cam', 'Màu nâu'], e: 'Xanh dương + vàng = xanh lá. Thử với màu nước nhé!' },
  { topic: 'Thí nghiệm', q: 'Vật nào sẽ nổi trên mặt nước?', a: 'Miếng gỗ', d: ['Hòn đá', 'Cái đinh sắt', 'Đồng xu'], e: 'Gỗ nhẹ hơn nước nên nổi; đá và sắt nặng hơn nên chìm.' },
  { topic: 'Thí nghiệm', q: 'Nam châm hút được vật nào?', a: 'Cái kẹp giấy bằng sắt', d: ['Mảnh giấy', 'Cục tẩy', 'Bút chì gỗ'], e: 'Nam châm hút các vật bằng sắt/thép.' },
];

function buildScience(): SeedCourse {
  const byTopic = new Map<string, Fact[]>();
  for (const f of SCIENCE_FACTS) {
    if (!byTopic.has(f.topic)) byTopic.set(f.topic, []);
    byTopic.get(f.topic)!.push(f);
  }
  const lessons: SeedLesson[] = [];
  for (const [topic, facts] of byTopic) {
    lessons.push({
      title: `Khám phá: ${topic}`,
      module: topic,
      estMinutes: 8,
      xpReward: 20,
      type: 'MULTIPLE_CHOICE',
      questions: facts.map((f) => mcQuestion(f.q, f.a, f.d, f.e)),
    });
  }
  return {
    subject: 'SCIENCE',
    title: 'Thế giới Khoa học kỳ thú',
    slug: 'science-explorer',
    description: 'Động vật, vũ trụ, cơ thể người, thiên nhiên và thí nghiệm vui.',
    gradeMin: 3,
    gradeMax: 6,
    lessons,
  };
}

// ============================================================
// CODING — tư duy logic (procedural)
// ============================================================

function codingQuestion(): SeedQuestion {
  const kind = rint(0, 3);
  if (kind === 0) {
    // Dãy số cộng đều
    const start = rint(1, 9), step = rint(1, 5);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    const ans = start + 4 * step;
    return mcQuestion(`Số tiếp theo trong dãy: ${seq.join(', ')}, ?`, String(ans), [String(ans + 1), String(ans - step), String(ans + step)], `Mỗi số tăng thêm ${step}, nên số tiếp theo là ${ans}.`);
  }
  if (kind === 1) {
    // Dãy nhân đôi
    const start = rint(1, 5);
    const seq = [start, start * 2, start * 4];
    const ans = start * 8;
    return mcQuestion(`Quy luật nhân đôi: ${seq.join(', ')}, ?`, String(ans), [String(ans + 2), String(ans / 2), String(ans + start)], `Mỗi số gấp đôi số trước: ${start * 4} × 2 = ${ans}.`);
  }
  if (kind === 2) {
    // Logic if-then
    const n = rint(1, 20);
    const even = n % 2 === 0;
    return mcQuestion(`Lệnh: "NẾU số chia hết cho 2 THÌ in 'Chẵn' NGƯỢC LẠI in 'Lẻ'". Với số ${n}, máy in gì?`, even ? 'Chẵn' : 'Lẻ', even ? ['Lẻ', 'Cả hai', 'Không in gì'] : ['Chẵn', 'Cả hai', 'Không in gì'], `${n} ${even ? 'chia hết' : 'không chia hết'} cho 2 nên in "${even ? 'Chẵn' : 'Lẻ'}".`);
  }
  // Vòng lặp đếm
  const times = rint(2, 6);
  return mcQuestion(`Lệnh: "Lặp lại ${times} lần: bước tới 1 ô". Robot đi được mấy ô?`, String(times), [String(times + 1), String(times - 1), String(times * 2)], `Lặp ${times} lần, mỗi lần 1 ô → đi ${times} ô.`);
}

function buildCoding(lessons: number, qPer: number): SeedCourse {
  const modules = ['Dãy số & Quy luật', 'Logic Điều kiện', 'Vòng lặp', 'Giải đố tư duy'];
  const out: SeedLesson[] = [];
  for (let i = 1; i <= lessons; i++) {
    out.push({
      title: `Thử thách Logic ${i}`,
      module: modules[(i - 1) % modules.length]!,
      estMinutes: 8,
      xpReward: 20,
      type: 'MULTIPLE_CHOICE',
      questions: Array.from({ length: qPer }, () => codingQuestion()),
    });
  }
  return {
    subject: 'CODING',
    title: 'Lập trình & Tư duy Logic',
    slug: 'coding-logic',
    description: 'Dãy số, quy luật, điều kiện if-then, vòng lặp — nền tảng tư duy lập trình.',
    gradeMin: 3,
    gradeMax: 6,
    lessons: out,
  };
}

// ============================================================
// READING — đoạn văn + câu hỏi đọc hiểu
// ============================================================

interface Passage { title: string; text: string; qs: SeedQuestion[] }

const PASSAGES: Passage[] = [
  {
    title: 'Chú mèo thông minh',
    text: 'Nhà bạn Lan có một chú mèo tên là Mun. Mun có bộ lông đen mượt và đôi mắt xanh. Mỗi sáng, Mun thường nằm sưởi nắng bên cửa sổ. Khi Lan đi học về, Mun chạy ra cửa đón và kêu "meo meo" thật vui.',
    qs: [
      mcQuestion('Chú mèo tên là gì?', 'Mun', ['Lan', 'Mướp', 'Đen'], 'Câu đầu cho biết chú mèo tên là Mun.'),
      mcQuestion('Mun có bộ lông màu gì?', 'Đen', ['Trắng', 'Vàng', 'Xám'], '"Bộ lông đen mượt".'),
      mcQuestion('Mỗi sáng Mun thường làm gì?', 'Nằm sưởi nắng bên cửa sổ', ['Đi bắt chuột', 'Ngủ trong hộp', 'Chạy chơi ngoài vườn'], 'Bài đọc nói Mun nằm sưởi nắng bên cửa sổ.'),
    ],
  },
  {
    title: 'Cây bàng trước sân trường',
    text: 'Trước sân trường em có một cây bàng to. Mùa hè, lá bàng xanh um che bóng mát cho chúng em chơi đùa. Mùa thu, lá chuyển sang màu đỏ rồi rụng đầy sân. Cây bàng như một người bạn lớn của cả lớp.',
    qs: [
      mcQuestion('Cây gì được nhắc đến trong bài?', 'Cây bàng', ['Cây phượng', 'Cây bằng lăng', 'Cây xoài'], 'Bài viết về cây bàng trước sân trường.'),
      mcQuestion('Mùa thu, lá bàng có màu gì?', 'Màu đỏ', ['Màu xanh', 'Màu vàng', 'Màu nâu'], '"Mùa thu, lá chuyển sang màu đỏ".'),
      mcQuestion('Mùa hè cây bàng mang lại điều gì?', 'Bóng mát', ['Quả ngọt', 'Hoa thơm', 'Tiếng chim'], 'Lá xanh um che bóng mát.'),
    ],
  },
  {
    title: 'Giọt nước tí hon',
    text: 'Có một giọt nước nhỏ sống trong dòng sông. Một ngày nắng, giọt nước bốc hơi bay lên trời, biến thành đám mây trắng. Khi trời lạnh, giọt nước lại rơi xuống thành mưa, trở về với dòng sông. Cứ thế, giọt nước đi vòng quanh mãi.',
    qs: [
      mcQuestion('Khi trời nắng, giọt nước biến thành gì?', 'Đám mây', ['Hòn đá', 'Bông tuyết', 'Cơn gió'], 'Giọt nước bốc hơi tạo thành mây.'),
      mcQuestion('Giọt nước trở về sông bằng cách nào?', 'Rơi xuống thành mưa', ['Chảy từ núi', 'Bốc hơi', 'Đóng băng'], 'Khi trời lạnh, nước rơi xuống thành mưa.'),
      mcQuestion('Bài đọc nói về hiện tượng gì?', 'Vòng tuần hoàn của nước', ['Núi lửa', 'Cầu vồng', 'Động đất'], 'Nước bốc hơi → mây → mưa → sông, lặp lại.'),
    ],
  },
  {
    title: 'Bạn Nam chăm chỉ',
    text: 'Nam là một học sinh lớp 4. Mỗi tối, Nam dành 30 phút để ôn bài và đọc sách. Cuối tuần, Nam giúp mẹ tưới cây và quét nhà. Nhờ chăm chỉ, Nam học giỏi và được thầy cô yêu quý.',
    qs: [
      mcQuestion('Mỗi tối Nam dành bao nhiêu phút ôn bài?', '30 phút', ['10 phút', '60 phút', '15 phút'], '"Nam dành 30 phút để ôn bài".'),
      mcQuestion('Cuối tuần Nam giúp mẹ làm gì?', 'Tưới cây và quét nhà', ['Nấu ăn', 'Đi chợ', 'Rửa xe'], 'Bài nói Nam giúp mẹ tưới cây và quét nhà.'),
      mcQuestion('Vì sao Nam được thầy cô yêu quý?', 'Vì chăm chỉ và học giỏi', ['Vì giàu có', 'Vì cao lớn', 'Vì hát hay'], 'Nhờ chăm chỉ nên Nam học giỏi.'),
    ],
  },
  {
    title: 'Chú ong chăm chỉ',
    text: 'Ong vàng bay từ bông hoa này sang bông hoa khác để hút mật. Cả ngày, ong làm việc không nghỉ. Mật hoa được ong mang về tổ làm thành mật ong ngọt lịm. Nhờ ong, hoa cũng được thụ phấn và kết trái.',
    qs: [
      mcQuestion('Ong hút gì từ hoa?', 'Mật hoa', ['Nước mưa', 'Phấn màu', 'Lá cây'], 'Ong bay đi hút mật hoa.'),
      mcQuestion('Ong mang mật về đâu?', 'Về tổ', ['Về sông', 'Về núi', 'Về vườn'], 'Ong mang mật về tổ làm mật ong.'),
      mcQuestion('Ong giúp ích gì cho hoa?', 'Giúp hoa thụ phấn', ['Tưới nước cho hoa', 'Nhổ cỏ', 'Bắt sâu'], 'Khi hút mật, ong giúp hoa thụ phấn.'),
    ],
  },
  {
    title: 'Ngày đầu tiên đi học',
    text: 'Sáng nay là ngày đầu tiên Mai đến trường mới. Mai hơi lo lắng nhưng cũng rất háo hức. Đến lớp, cô giáo mỉm cười chào đón. Các bạn mới rủ Mai cùng chơi. Đến cuối ngày, Mai đã có thêm nhiều người bạn.',
    qs: [
      mcQuestion('Vì sao buổi sáng Mai lo lắng?', 'Vì là ngày đầu đến trường mới', ['Vì quên bài', 'Vì trời mưa', 'Vì dậy muộn'], 'Đó là ngày đầu tiên ở trường mới.'),
      mcQuestion('Ai chào đón Mai ở lớp?', 'Cô giáo', ['Bác bảo vệ', 'Mẹ Mai', 'Chú lao công'], 'Cô giáo mỉm cười chào đón.'),
      mcQuestion('Cuối ngày Mai cảm thấy thế nào?', 'Vui vì có thêm bạn', ['Buồn vì nhớ nhà', 'Mệt vì học nhiều', 'Sợ cô giáo'], 'Mai có thêm nhiều bạn mới.'),
    ],
  },
];

function buildReading(): SeedCourse {
  return {
    subject: 'READING',
    title: 'Đọc hiểu & Truyện hay',
    slug: 'reading-comprehension',
    description: 'Truyện ngắn và bài đọc kèm câu hỏi đọc hiểu rèn tư duy.',
    gradeMin: 3,
    gradeMax: 6,
    lessons: PASSAGES.map((p) => ({
      title: p.title,
      module: 'Đọc hiểu',
      estMinutes: 10,
      xpReward: 22,
      type: 'MULTIPLE_CHOICE' as const,
      // Chèn đoạn văn vào prompt câu hỏi đầu tiên để hiển thị.
      questions: p.qs.map((q, i) =>
        i === 0 ? { ...q, text: `📖 Đọc đoạn văn:\n\n"${p.text}"\n\n❓ ${q.text}` } : q,
      ),
    })),
  };
}

export function buildScienceCourse() { return buildScience(); }
export function buildCodingCourse(lessons: number, qPer: number) { return buildCoding(lessons, qPer); }
export function buildReadingCourse() { return buildReading(); }
