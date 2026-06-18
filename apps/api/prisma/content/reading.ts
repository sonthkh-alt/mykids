import { mcQuestion, rint, shuffle, type SeedLesson, type SeedQuestion } from './types';

const NAMES = ['Lan', 'Minh', 'An', 'Bình', 'Hoa', 'Nam', 'Mai', 'Tú', 'Linh', 'Khoa', 'Hà', 'Phúc'];
const PETS = ['chú mèo', 'chú chó', 'chú thỏ', 'chú chim', 'chú rùa', 'chú cá vàng'];
const COLORS = ['đen', 'trắng', 'vàng', 'nâu', 'xám'];
const PLACES = ['công viên', 'bãi biển', 'sở thú', 'vườn bách thảo', 'bảo tàng', 'thư viện'];
const ANIMALS = ['con khỉ', 'con voi', 'con hươu', 'con công', 'con hổ', 'con gấu'];
const HOBBIES = ['vẽ tranh', 'đá bóng', 'đọc sách', 'chơi đàn', 'bơi lội', 'trồng cây'];
const CHORES = ['tưới cây', 'quét nhà', 'rửa bát', 'gấp quần áo', 'cho gà ăn'];
const ABILITIES = ['leo trèo giỏi', 'chạy rất nhanh', 'bơi rất khỏe', 'nhảy rất cao'];

const pick = <T>(a: T[]): T => a[rint(0, a.length - 1)]!;
const others = <T>(a: T[], not: T, n = 3): T[] => shuffle(a.filter((x) => x !== not)).slice(0, n);

type PassageGen = () => { title: string; text: string; qs: SeedQuestion[] };

const templates: PassageGen[] = [
  // Thú cưng
  () => {
    const name = pick(NAMES), pet = pick(PETS), color = pick(COLORS), petName = pick(NAMES);
    const text = `Nhà bạn ${name} có một ${pet} tên là ${petName}. ${petName} có bộ lông màu ${color} rất đẹp. Mỗi sáng, ${petName} thường chạy ra cửa đón ${name} đi học về. ${name} rất yêu quý ${petName}.`;
    return {
      title: `Thú cưng của ${name}`,
      text,
      qs: [
        mcQuestion(`Thú cưng của ${name} tên là gì?`, petName, others(NAMES, petName), `Bài đọc cho biết tên là ${petName}.`),
        mcQuestion(`${petName} có bộ lông màu gì?`, color, others(COLORS, color), `"Bộ lông màu ${color}".`),
        mcQuestion(`Mỗi sáng ${petName} làm gì?`, `Chạy ra cửa đón ${name}`, ['Ngủ suốt ngày', 'Đi bắt chuột', 'Trốn dưới gầm bàn'], `${petName} chạy ra đón ${name} đi học về.`),
      ],
    };
  },
  // Chuyến đi
  () => {
    const name = pick(NAMES), place = pick(PLACES), n = rint(2, 9), animal = pick(ANIMALS);
    const text = `Cuối tuần, ${name} được bố mẹ đưa đi ${place}. Ở đó, ${name} nhìn thấy ${n} ${animal} rất đáng yêu. ${name} chụp được nhiều bức ảnh đẹp và cảm thấy rất vui.`;
    return {
      title: `${name} đi ${place}`,
      text,
      qs: [
        mcQuestion(`Cuối tuần ${name} đi đâu?`, place, others(PLACES, place), `${name} được đưa đi ${place}.`),
        mcQuestion(`${name} thấy bao nhiêu ${animal}?`, String(n), [String(n + 1), String(n - 1), String(n + 2)].filter((x) => Number(x) >= 0), `Bài đọc nói có ${n} ${animal}.`),
        mcQuestion(`${name} cảm thấy thế nào?`, 'Rất vui', ['Rất buồn', 'Sợ hãi', 'Mệt mỏi'], `${name} chụp ảnh và cảm thấy rất vui.`),
      ],
    };
  },
  // Học tập chăm chỉ
  () => {
    const name = pick(NAMES), g = rint(3, 6), mins = [20, 30, 45][rint(0, 2)]!, chore = pick(CHORES);
    const text = `${name} là học sinh lớp ${g}. Mỗi tối, ${name} dành ${mins} phút để ôn bài và đọc sách. Cuối tuần, ${name} còn giúp mẹ ${chore}. Nhờ chăm chỉ, ${name} học rất tiến bộ.`;
    return {
      title: `Bạn ${name} chăm chỉ`,
      text,
      qs: [
        mcQuestion(`${name} học lớp mấy?`, `Lớp ${g}`, [3, 4, 5, 6].filter((x) => x !== g).map((x) => `Lớp ${x}`), `"${name} là học sinh lớp ${g}".`),
        mcQuestion(`Mỗi tối ${name} ôn bài bao nhiêu phút?`, `${mins} phút`, [15, 20, 30, 45, 60].filter((x) => x !== mins).slice(0, 3).map((x) => `${x} phút`), `Bài đọc nói ${mins} phút.`),
        mcQuestion(`Cuối tuần ${name} giúp mẹ làm gì?`, chore.charAt(0).toUpperCase() + chore.slice(1), others(CHORES, chore).map((c) => c.charAt(0).toUpperCase() + c.slice(1)), `${name} giúp mẹ ${chore}.`),
      ],
    };
  },
  // Sở thích
  () => {
    const name = pick(NAMES), hobby = pick(HOBBIES), times = rint(2, 5);
    const text = `${name} rất thích ${hobby}. Mỗi tuần, ${name} luyện tập ${times} lần. ${name} mơ ước sau này sẽ thật giỏi. Bạn bè ai cũng quý ${name} vì sự chăm chỉ.`;
    return {
      title: `Sở thích của ${name}`,
      text,
      qs: [
        mcQuestion(`${name} thích làm gì?`, hobby.charAt(0).toUpperCase() + hobby.slice(1), others(HOBBIES, hobby).map((h) => h.charAt(0).toUpperCase() + h.slice(1)), `"${name} rất thích ${hobby}".`),
        mcQuestion(`Mỗi tuần ${name} luyện tập mấy lần?`, `${times} lần`, [1, 2, 3, 4, 5, 6].filter((x) => x !== times).slice(0, 3).map((x) => `${x} lần`), `Bài đọc nói ${times} lần/tuần.`),
        mcQuestion('Vì sao bạn bè quý mến?', 'Vì sự chăm chỉ', ['Vì giàu có', 'Vì cao lớn', 'Vì hát hay'], 'Bạn bè quý vì sự chăm chỉ.'),
      ],
    };
  },
  // Mini truyện về động vật (khoa học + đọc hiểu)
  () => {
    const animal = pick(ANIMALS), place = pick(['trong rừng', 'trên đồng cỏ', 'dưới nước', 'trên cây']), ability = pick(ABILITIES);
    const food = pick(['lá cây', 'côn trùng', 'cá nhỏ', 'quả chín']);
    const text = `${animal.charAt(0).toUpperCase() + animal.slice(1)} sống ${place}. Hằng ngày, nó đi tìm ${food} để ăn. Điều đặc biệt là nó ${ability}. Nhờ vậy, nó tự bảo vệ mình khỏi kẻ thù.`;
    return {
      title: `Tìm hiểu ${animal}`,
      text,
      qs: [
        mcQuestion(`${animal.charAt(0).toUpperCase() + animal.slice(1)} sống ở đâu?`, place, others(['trong rừng', 'trên đồng cỏ', 'dưới nước', 'trên cây'], place), `Bài đọc: sống ${place}.`),
        mcQuestion('Nó ăn gì?', food, others(['lá cây', 'côn trùng', 'cá nhỏ', 'quả chín'], food), `Nó tìm ${food} để ăn.`),
        mcQuestion('Điều đặc biệt ở nó là gì?', ability.charAt(0).toUpperCase() + ability.slice(1), others(ABILITIES, ability).map((a) => a.charAt(0).toUpperCase() + a.slice(1)), `Nó ${ability}.`),
      ],
    };
  },
];

/** Sinh `target` bài đọc hiểu (truyện ngắn + câu hỏi). Đoạn văn nằm trong câu hỏi đầu. */
export function buildReadingLessons(target: number): SeedLesson[] {
  const lessons: SeedLesson[] = [];
  for (let i = 0; i < target; i++) {
    const p = templates[i % templates.length]!();
    const questions = p.qs.map((q, idx) =>
      idx === 0 ? { ...q, text: `📖 Đọc đoạn văn sau:\n\n"${p.text}"\n\n❓ ${q.text}` } : q,
    );
    lessons.push({
      title: p.title,
      module: 'Đọc hiểu',
      estMinutes: 10,
      xpReward: 22,
      type: 'MULTIPLE_CHOICE',
      questions,
    });
  }
  return lessons;
}
