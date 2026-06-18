import { mcQuestion, rint, shuffle, type SeedCourse, type SeedLesson, type SeedQuestion } from './types';

interface Word { en: string; vi: string }

const THEMES: { theme: string; words: Word[] }[] = [
  { theme: 'Animals — Động vật', words: [
    { en: 'cat', vi: 'con mèo' }, { en: 'dog', vi: 'con chó' }, { en: 'bird', vi: 'con chim' },
    { en: 'fish', vi: 'con cá' }, { en: 'lion', vi: 'sư tử' }, { en: 'tiger', vi: 'con hổ' },
    { en: 'elephant', vi: 'con voi' }, { en: 'monkey', vi: 'con khỉ' }, { en: 'bear', vi: 'con gấu' },
    { en: 'rabbit', vi: 'con thỏ' }, { en: 'horse', vi: 'con ngựa' }, { en: 'duck', vi: 'con vịt' },
  ]},
  { theme: 'Family — Gia đình', words: [
    { en: 'father', vi: 'bố' }, { en: 'mother', vi: 'mẹ' }, { en: 'brother', vi: 'anh/em trai' },
    { en: 'sister', vi: 'chị/em gái' }, { en: 'grandfather', vi: 'ông' }, { en: 'grandmother', vi: 'bà' },
    { en: 'uncle', vi: 'chú/bác' }, { en: 'aunt', vi: 'cô/dì' }, { en: 'son', vi: 'con trai' },
    { en: 'daughter', vi: 'con gái' }, { en: 'baby', vi: 'em bé' }, { en: 'family', vi: 'gia đình' },
  ]},
  { theme: 'Food — Thức ăn', words: [
    { en: 'rice', vi: 'cơm' }, { en: 'bread', vi: 'bánh mì' }, { en: 'milk', vi: 'sữa' },
    { en: 'egg', vi: 'trứng' }, { en: 'apple', vi: 'táo' }, { en: 'banana', vi: 'chuối' },
    { en: 'water', vi: 'nước' }, { en: 'fish', vi: 'cá' }, { en: 'meat', vi: 'thịt' },
    { en: 'cake', vi: 'bánh ngọt' }, { en: 'noodle', vi: 'mì' }, { en: 'candy', vi: 'kẹo' },
  ]},
  { theme: 'Colors — Màu sắc', words: [
    { en: 'red', vi: 'màu đỏ' }, { en: 'blue', vi: 'màu xanh dương' }, { en: 'green', vi: 'màu xanh lá' },
    { en: 'yellow', vi: 'màu vàng' }, { en: 'black', vi: 'màu đen' }, { en: 'white', vi: 'màu trắng' },
    { en: 'pink', vi: 'màu hồng' }, { en: 'orange', vi: 'màu cam' }, { en: 'purple', vi: 'màu tím' },
    { en: 'brown', vi: 'màu nâu' }, { en: 'gray', vi: 'màu xám' }, { en: 'gold', vi: 'màu vàng kim' },
  ]},
  { theme: 'School — Trường học', words: [
    { en: 'book', vi: 'quyển sách' }, { en: 'pen', vi: 'cây bút' }, { en: 'pencil', vi: 'bút chì' },
    { en: 'desk', vi: 'bàn học' }, { en: 'chair', vi: 'cái ghế' }, { en: 'teacher', vi: 'giáo viên' },
    { en: 'student', vi: 'học sinh' }, { en: 'school', vi: 'trường học' }, { en: 'bag', vi: 'cặp sách' },
    { en: 'ruler', vi: 'thước kẻ' }, { en: 'eraser', vi: 'cục tẩy' }, { en: 'board', vi: 'bảng' },
  ]},
  { theme: 'Body — Cơ thể', words: [
    { en: 'head', vi: 'cái đầu' }, { en: 'hand', vi: 'bàn tay' }, { en: 'foot', vi: 'bàn chân' },
    { en: 'eye', vi: 'con mắt' }, { en: 'ear', vi: 'cái tai' }, { en: 'nose', vi: 'cái mũi' },
    { en: 'mouth', vi: 'cái miệng' }, { en: 'arm', vi: 'cánh tay' }, { en: 'leg', vi: 'cái chân' },
    { en: 'hair', vi: 'tóc' }, { en: 'tooth', vi: 'cái răng' }, { en: 'face', vi: 'khuôn mặt' },
  ]},
  { theme: 'Nature — Thiên nhiên', words: [
    { en: 'tree', vi: 'cái cây' }, { en: 'flower', vi: 'bông hoa' }, { en: 'sun', vi: 'mặt trời' },
    { en: 'moon', vi: 'mặt trăng' }, { en: 'star', vi: 'ngôi sao' }, { en: 'sky', vi: 'bầu trời' },
    { en: 'rain', vi: 'mưa' }, { en: 'wind', vi: 'gió' }, { en: 'mountain', vi: 'ngọn núi' },
    { en: 'river', vi: 'dòng sông' }, { en: 'sea', vi: 'biển' }, { en: 'cloud', vi: 'đám mây' },
  ]},
  { theme: 'Action verbs — Động từ', words: [
    { en: 'run', vi: 'chạy' }, { en: 'jump', vi: 'nhảy' }, { en: 'eat', vi: 'ăn' },
    { en: 'drink', vi: 'uống' }, { en: 'read', vi: 'đọc' }, { en: 'write', vi: 'viết' },
    { en: 'sing', vi: 'hát' }, { en: 'play', vi: 'chơi' }, { en: 'sleep', vi: 'ngủ' },
    { en: 'walk', vi: 'đi bộ' }, { en: 'swim', vi: 'bơi' }, { en: 'draw', vi: 'vẽ' },
  ]},
  { theme: 'Numbers & Time — Số và thời gian', words: [
    { en: 'one', vi: 'một' }, { en: 'two', vi: 'hai' }, { en: 'three', vi: 'ba' },
    { en: 'ten', vi: 'mười' }, { en: 'today', vi: 'hôm nay' }, { en: 'tomorrow', vi: 'ngày mai' },
    { en: 'morning', vi: 'buổi sáng' }, { en: 'night', vi: 'ban đêm' }, { en: 'day', vi: 'ngày' },
    { en: 'week', vi: 'tuần' }, { en: 'month', vi: 'tháng' }, { en: 'year', vi: 'năm' },
  ]},
  { theme: 'Home — Ngôi nhà', words: [
    { en: 'house', vi: 'ngôi nhà' }, { en: 'door', vi: 'cửa ra vào' }, { en: 'window', vi: 'cửa sổ' },
    { en: 'table', vi: 'cái bàn' }, { en: 'bed', vi: 'cái giường' }, { en: 'kitchen', vi: 'nhà bếp' },
    { en: 'room', vi: 'căn phòng' }, { en: 'lamp', vi: 'cái đèn' }, { en: 'clock', vi: 'đồng hồ' },
    { en: 'TV', vi: 'tivi' }, { en: 'cup', vi: 'cái cốc' }, { en: 'key', vi: 'chìa khóa' },
  ]},
  { theme: 'Jobs — Nghề nghiệp', words: [
    { en: 'doctor', vi: 'bác sĩ' }, { en: 'teacher', vi: 'giáo viên' }, { en: 'farmer', vi: 'nông dân' },
    { en: 'police', vi: 'cảnh sát' }, { en: 'driver', vi: 'tài xế' }, { en: 'cook', vi: 'đầu bếp' },
    { en: 'nurse', vi: 'y tá' }, { en: 'pilot', vi: 'phi công' }, { en: 'singer', vi: 'ca sĩ' },
    { en: 'worker', vi: 'công nhân' }, { en: 'artist', vi: 'họa sĩ' }, { en: 'engineer', vi: 'kỹ sư' },
  ]},
  { theme: 'Weather — Thời tiết', words: [
    { en: 'sunny', vi: 'nắng' }, { en: 'rainy', vi: 'mưa' }, { en: 'cloudy', vi: 'nhiều mây' },
    { en: 'windy', vi: 'gió' }, { en: 'hot', vi: 'nóng' }, { en: 'cold', vi: 'lạnh' },
    { en: 'snow', vi: 'tuyết' }, { en: 'storm', vi: 'bão' }, { en: 'warm', vi: 'ấm áp' },
    { en: 'cool', vi: 'mát mẻ' }, { en: 'fog', vi: 'sương mù' }, { en: 'rainbow', vi: 'cầu vồng' },
  ]},
  { theme: 'Sports — Thể thao', words: [
    { en: 'football', vi: 'bóng đá' }, { en: 'basketball', vi: 'bóng rổ' }, { en: 'swimming', vi: 'bơi lội' },
    { en: 'running', vi: 'chạy bộ' }, { en: 'cycling', vi: 'đạp xe' }, { en: 'tennis', vi: 'quần vợt' },
    { en: 'badminton', vi: 'cầu lông' }, { en: 'ball', vi: 'quả bóng' }, { en: 'team', vi: 'đội' },
    { en: 'win', vi: 'thắng' }, { en: 'jump', vi: 'nhảy' }, { en: 'play', vi: 'chơi' },
  ]},
  { theme: 'Fruits — Trái cây', words: [
    { en: 'apple', vi: 'táo' }, { en: 'orange', vi: 'cam' }, { en: 'mango', vi: 'xoài' },
    { en: 'grape', vi: 'nho' }, { en: 'watermelon', vi: 'dưa hấu' }, { en: 'pineapple', vi: 'dứa' },
    { en: 'strawberry', vi: 'dâu tây' }, { en: 'lemon', vi: 'chanh' }, { en: 'peach', vi: 'đào' },
    { en: 'coconut', vi: 'dừa' }, { en: 'papaya', vi: 'đu đủ' }, { en: 'guava', vi: 'ổi' },
  ]},
  { theme: 'Clothes — Quần áo', words: [
    { en: 'shirt', vi: 'áo sơ mi' }, { en: 'dress', vi: 'váy' }, { en: 'hat', vi: 'cái mũ' },
    { en: 'shoes', vi: 'giày' }, { en: 'socks', vi: 'tất' }, { en: 'pants', vi: 'quần dài' },
    { en: 'coat', vi: 'áo khoác' }, { en: 'skirt', vi: 'chân váy' }, { en: 'glasses', vi: 'kính' },
    { en: 'gloves', vi: 'găng tay' }, { en: 'scarf', vi: 'khăn quàng' }, { en: 'belt', vi: 'thắt lưng' },
  ]},
  { theme: 'Transport — Phương tiện', words: [
    { en: 'car', vi: 'ô tô' }, { en: 'bus', vi: 'xe buýt' }, { en: 'bike', vi: 'xe đạp' },
    { en: 'train', vi: 'tàu hỏa' }, { en: 'plane', vi: 'máy bay' }, { en: 'boat', vi: 'thuyền' },
    { en: 'ship', vi: 'tàu thủy' }, { en: 'motorbike', vi: 'xe máy' }, { en: 'taxi', vi: 'taxi' },
    { en: 'truck', vi: 'xe tải' }, { en: 'helicopter', vi: 'trực thăng' }, { en: 'rocket', vi: 'tên lửa' },
  ]},
  { theme: 'Feelings — Cảm xúc', words: [
    { en: 'happy', vi: 'vui' }, { en: 'sad', vi: 'buồn' }, { en: 'angry', vi: 'tức giận' },
    { en: 'tired', vi: 'mệt' }, { en: 'scared', vi: 'sợ hãi' }, { en: 'excited', vi: 'hào hứng' },
    { en: 'hungry', vi: 'đói' }, { en: 'thirsty', vi: 'khát' }, { en: 'bored', vi: 'chán' },
    { en: 'surprised', vi: 'ngạc nhiên' }, { en: 'proud', vi: 'tự hào' }, { en: 'shy', vi: 'nhút nhát' },
  ]},
  { theme: 'Shapes & Sizes — Hình & Cỡ', words: [
    { en: 'circle', vi: 'hình tròn' }, { en: 'square', vi: 'hình vuông' }, { en: 'triangle', vi: 'hình tam giác' },
    { en: 'star', vi: 'ngôi sao' }, { en: 'heart', vi: 'trái tim' }, { en: 'big', vi: 'to' },
    { en: 'small', vi: 'nhỏ' }, { en: 'long', vi: 'dài' }, { en: 'short', vi: 'ngắn' },
    { en: 'tall', vi: 'cao' }, { en: 'wide', vi: 'rộng' }, { en: 'round', vi: 'tròn' },
  ]},
  { theme: 'Vegetables — Rau củ', words: [
    { en: 'carrot', vi: 'cà rốt' }, { en: 'potato', vi: 'khoai tây' }, { en: 'tomato', vi: 'cà chua' },
    { en: 'onion', vi: 'hành' }, { en: 'cabbage', vi: 'bắp cải' }, { en: 'corn', vi: 'ngô' },
    { en: 'cucumber', vi: 'dưa chuột' }, { en: 'pumpkin', vi: 'bí ngô' }, { en: 'bean', vi: 'đậu' },
    { en: 'pepper', vi: 'ớt chuông' }, { en: 'mushroom', vi: 'nấm' }, { en: 'garlic', vi: 'tỏi' },
  ]},
];

function buildThemeLessons(theme: string, words: Word[], quizCount: number): SeedLesson[] {
  const lessons: SeedLesson[] = [];

  // 1) Flashcard — học nghĩa
  lessons.push({
    title: `${theme}: Học từ mới`,
    module: 'Vocabulary',
    estMinutes: 6,
    xpReward: 15,
    type: 'FLASHCARD',
    questions: words.map((w) =>
      mcQuestion(`"${w.en}" nghĩa là gì?`, w.vi, shuffle(words.filter((x) => x.vi !== w.vi)).slice(0, 3).map((x) => x.vi), `"${w.en}" = ${w.vi}.`),
    ),
  });

  // 2) Quiz nghĩa (nhiều phần, mỗi phần xáo trộn)
  for (let i = 1; i <= quizCount; i++) {
    const qs: SeedQuestion[] = shuffle(words).slice(0, 8).map((w) => {
      const reverse = Math.random() < 0.5;
      if (reverse) {
        return mcQuestion(`Từ tiếng Anh của "${w.vi}" là gì?`, w.en, shuffle(words.filter((x) => x.en !== w.en)).slice(0, 3).map((x) => x.en), `"${w.vi}" = "${w.en}".`);
      }
      return mcQuestion(`"${w.en}" nghĩa là gì?`, w.vi, shuffle(words.filter((x) => x.vi !== w.vi)).slice(0, 3).map((x) => x.vi), `"${w.en}" = ${w.vi}.`);
    });
    lessons.push({ title: `${theme}: Luyện tập ${i}`, module: 'Vocabulary Quiz', estMinutes: 7, xpReward: 18, type: 'MULTIPLE_CHOICE', questions: qs });
  }
  return lessons;
}

// ---------- Ngữ pháp đơn giản (sinh để tăng đa dạng) ----------
function grammarQuestion(): SeedQuestion {
  const kind = rint(0, 3);
  if (kind === 0) {
    const sing = ['cat', 'dog', 'book', 'apple', 'box', 'car'][rint(0, 5)]!;
    const plural = sing === 'box' ? 'boxes' : `${sing}s`;
    return mcQuestion(`Số nhiều của "${sing}" là gì?`, plural, [`${sing}`, `${sing}es`, `many ${sing}`].filter((x) => x !== plural).slice(0, 3), `Thêm -s (hoặc -es) để tạo số nhiều: ${plural}.`);
  }
  if (kind === 1) {
    const subj = ['I', 'He', 'She', 'They', 'We', 'It'][rint(0, 5)]!;
    const be = subj === 'I' ? 'am' : subj === 'He' || subj === 'She' || subj === 'It' ? 'is' : 'are';
    return mcQuestion(`Chọn từ đúng: "${subj} ___ happy."`, be, ['am', 'is', 'are'].filter((x) => x !== be), `Với "${subj}" dùng động từ to be: "${be}".`);
  }
  if (kind === 2) {
    const n = rint(2, 9);
    return mcQuestion(`"I see ___ birds." (có ${n} con) — chọn đúng:`, String(n), [String(n + 1), 'a', 'much'], `Đếm được nên dùng số ${n}.`);
  }
  const pairs = [['this', 'gần'], ['that', 'xa']] as const;
  const p = pairs[rint(0, 1)]!;
  return mcQuestion(`Vật ở ${p[1]} ta dùng từ nào?`, p[0], p[0] === 'this' ? ['that', 'these', 'those'] : ['this', 'these', 'those'], `"${p[0]}" chỉ vật ở ${p[1]}.`);
}

/** Sinh `target` bài học Tiếng Anh: flashcard cho mỗi chủ đề + quiz xoay vòng + ngữ pháp. */
export function buildEnglishLessons(target: number): SeedLesson[] {
  const lessons: SeedLesson[] = [];

  // Flashcard giới thiệu mỗi chủ đề
  for (const t of THEMES) {
    lessons.push({
      title: `${t.theme}: Học từ mới`,
      module: 'Vocabulary',
      estMinutes: 6,
      xpReward: 15,
      type: 'FLASHCARD',
      questions: t.words.map((w) =>
        mcQuestion(`"${w.en}" nghĩa là gì?`, w.vi, shuffle(t.words.filter((x) => x.vi !== w.vi)).slice(0, 3).map((x) => x.vi), `"${w.en}" = ${w.vi}.`),
      ),
    });
  }

  // Quiz xoay vòng cho tới khi đạt target
  let i = 0;
  while (lessons.length < target) {
    const t = THEMES[i % THEMES.length]!;
    const round = Math.floor(i / THEMES.length) + 1;
    const isGrammar = i % 5 === 4; // cứ 5 bài có 1 bài ngữ pháp
    if (isGrammar) {
      lessons.push({
        title: `Ngữ pháp vui ${round}`,
        module: 'Grammar',
        estMinutes: 7,
        xpReward: 18,
        type: 'MULTIPLE_CHOICE',
        questions: Array.from({ length: 8 }, () => grammarQuestion()),
      });
    } else {
      const qs: SeedQuestion[] = shuffle(t.words).slice(0, 8).map((w) => {
        if (Math.random() < 0.5) {
          return mcQuestion(`Từ tiếng Anh của "${w.vi}" là gì?`, w.en, shuffle(t.words.filter((x) => x.en !== w.en)).slice(0, 3).map((x) => x.en), `"${w.vi}" = "${w.en}".`);
        }
        return mcQuestion(`"${w.en}" nghĩa là gì?`, w.vi, shuffle(t.words.filter((x) => x.vi !== w.vi)).slice(0, 3).map((x) => x.vi), `"${w.en}" = ${w.vi}.`);
      });
      lessons.push({ title: `${t.theme}: Luyện tập ${round}`, module: 'Vocabulary Quiz', estMinutes: 7, xpReward: 18, type: 'MULTIPLE_CHOICE', questions: qs });
    }
    i++;
  }
  return lessons;
}

export function buildEnglish(quizPerTheme: number): SeedCourse[] {
  // Chia theo độ khó: chủ đề đầu cho lớp nhỏ, sau cho lớp lớn (gối lên nhau).
  const beginner = THEMES.slice(0, 6);
  const advanced = THEMES.slice(4);

  const courseBeginner: SeedCourse = {
    subject: 'ENGLISH',
    title: 'Tiếng Anh Cơ bản (Lớp 3–4)',
    slug: 'english-basic',
    description: 'Từ vựng nền tảng theo chủ đề: động vật, gia đình, thức ăn, màu sắc...',
    gradeMin: 3,
    gradeMax: 4,
    lessons: beginner.flatMap((t) => buildThemeLessons(t.theme, t.words, quizPerTheme)),
  };
  const courseAdvanced: SeedCourse = {
    subject: 'ENGLISH',
    title: 'Tiếng Anh Mở rộng (Lớp 5–6)',
    slug: 'english-advanced',
    description: 'Mở rộng từ vựng: thiên nhiên, động từ, thời gian, ngôi nhà...',
    gradeMin: 5,
    gradeMax: 6,
    lessons: advanced.flatMap((t) => buildThemeLessons(t.theme, t.words, quizPerTheme)),
  };
  return [courseBeginner, courseAdvanced];
}
