import { mcQuestion, rint, shuffle, type SeedLesson, type SeedQuestion } from './types';

// ---------- Dữ liệu ----------
interface Animal { name: string; diet: string; habitat: string; group: string }
const DIETS = ['Ăn cỏ', 'Ăn thịt', 'Ăn tạp'];
const GROUPS = ['Thú (có vú)', 'Chim', 'Cá', 'Bò sát', 'Côn trùng', 'Lưỡng cư'];
const HABITATS = ['Rừng', 'Đồng cỏ', 'Dưới nước', 'Sa mạc', 'Vùng cực', 'Trên cây'];

const ANIMALS: Animal[] = [
  { name: 'Voi', diet: 'Ăn cỏ', habitat: 'Đồng cỏ', group: 'Thú (có vú)' },
  { name: 'Sư tử', diet: 'Ăn thịt', habitat: 'Đồng cỏ', group: 'Thú (có vú)' },
  { name: 'Hổ', diet: 'Ăn thịt', habitat: 'Rừng', group: 'Thú (có vú)' },
  { name: 'Khỉ', diet: 'Ăn tạp', habitat: 'Trên cây', group: 'Thú (có vú)' },
  { name: 'Thỏ', diet: 'Ăn cỏ', habitat: 'Đồng cỏ', group: 'Thú (có vú)' },
  { name: 'Gấu Bắc Cực', diet: 'Ăn thịt', habitat: 'Vùng cực', group: 'Thú (có vú)' },
  { name: 'Cá heo', diet: 'Ăn thịt', habitat: 'Dưới nước', group: 'Thú (có vú)' },
  { name: 'Lạc đà', diet: 'Ăn cỏ', habitat: 'Sa mạc', group: 'Thú (có vú)' },
  { name: 'Đại bàng', diet: 'Ăn thịt', habitat: 'Rừng', group: 'Chim' },
  { name: 'Chim sẻ', diet: 'Ăn tạp', habitat: 'Trên cây', group: 'Chim' },
  { name: 'Chim cánh cụt', diet: 'Ăn thịt', habitat: 'Vùng cực', group: 'Chim' },
  { name: 'Vịt', diet: 'Ăn tạp', habitat: 'Dưới nước', group: 'Chim' },
  { name: 'Cá mập', diet: 'Ăn thịt', habitat: 'Dưới nước', group: 'Cá' },
  { name: 'Cá vàng', diet: 'Ăn tạp', habitat: 'Dưới nước', group: 'Cá' },
  { name: 'Cá hồi', diet: 'Ăn thịt', habitat: 'Dưới nước', group: 'Cá' },
  { name: 'Rắn', diet: 'Ăn thịt', habitat: 'Rừng', group: 'Bò sát' },
  { name: 'Rùa', diet: 'Ăn tạp', habitat: 'Dưới nước', group: 'Bò sát' },
  { name: 'Cá sấu', diet: 'Ăn thịt', habitat: 'Dưới nước', group: 'Bò sát' },
  { name: 'Thằn lằn', diet: 'Ăn thịt', habitat: 'Sa mạc', group: 'Bò sát' },
  { name: 'Ong', diet: 'Ăn cỏ', habitat: 'Trên cây', group: 'Côn trùng' },
  { name: 'Bướm', diet: 'Ăn cỏ', habitat: 'Đồng cỏ', group: 'Côn trùng' },
  { name: 'Kiến', diet: 'Ăn tạp', habitat: 'Rừng', group: 'Côn trùng' },
  { name: 'Ếch', diet: 'Ăn thịt', habitat: 'Dưới nước', group: 'Lưỡng cư' },
];

const PLANETS = ['Sao Thủy', 'Sao Kim', 'Trái Đất', 'Sao Hỏa', 'Sao Mộc', 'Sao Thổ', 'Sao Thiên Vương', 'Sao Hải Vương'];

const BODY: { organ: string; fn: string }[] = [
  { organ: 'Tim', fn: 'bơm máu đi khắp cơ thể' },
  { organ: 'Phổi', fn: 'giúp ta hít thở, lấy oxy' },
  { organ: 'Não', fn: 'điều khiển suy nghĩ và cơ thể' },
  { organ: 'Dạ dày', fn: 'tiêu hóa thức ăn' },
  { organ: 'Mắt', fn: 'giúp ta nhìn' },
  { organ: 'Tai', fn: 'giúp ta nghe' },
  { organ: 'Da', fn: 'bảo vệ cơ thể' },
  { organ: 'Xương', fn: 'nâng đỡ cơ thể' },
  { organ: 'Thận', fn: 'lọc chất thải khỏi máu' },
  { organ: 'Răng', fn: 'nghiền nhỏ thức ăn' },
];

const MATERIALS: { item: string; floats: boolean; magnetic: boolean }[] = [
  { item: 'Miếng gỗ', floats: true, magnetic: false },
  { item: 'Hòn đá', floats: false, magnetic: false },
  { item: 'Đinh sắt', floats: false, magnetic: true },
  { item: 'Lá cây', floats: true, magnetic: false },
  { item: 'Kẹp giấy sắt', floats: false, magnetic: true },
  { item: 'Quả bóng nhựa', floats: true, magnetic: false },
  { item: 'Đồng xu', floats: false, magnetic: false },
  { item: 'Cục tẩy', floats: true, magnetic: false },
];

const FACTS: SeedQuestion[] = [
  mcQuestion('Cây xanh nhả ra khí gì giúp ta thở?', 'Khí oxy', ['Khí CO₂', 'Khói', 'Hơi nước'], 'Cây quang hợp tạo ra oxy.'),
  mcQuestion('Nước sôi ở nhiệt độ bao nhiêu?', '100°C', ['50°C', '0°C', '200°C'], 'Ở áp suất thường, nước sôi ở 100°C.'),
  mcQuestion('Nước đóng băng thành đá ở nhiệt độ nào?', '0°C', ['10°C', '−100°C', '100°C'], 'Nước đông đặc ở 0°C.'),
  mcQuestion('Cầu vồng thường xuất hiện sau hiện tượng gì?', 'Cơn mưa', ['Bão tuyết', 'Động đất', 'Núi lửa'], 'Ánh nắng chiếu qua giọt nước mưa tạo cầu vồng.'),
  mcQuestion('Bộ phận nào của cây hút nước từ đất?', 'Rễ', ['Lá', 'Hoa', 'Quả'], 'Rễ hút nước và chất dinh dưỡng.'),
  mcQuestion('Mặt Trời mọc ở hướng nào?', 'Hướng Đông', ['Hướng Tây', 'Hướng Bắc', 'Hướng Nam'], 'Mặt Trời mọc ở Đông, lặn ở Tây.'),
  mcQuestion('Loài vật nào tạo ra mật ong?', 'Con ong', ['Con kiến', 'Con bướm', 'Con ruồi'], 'Ong hút mật hoa và làm mật ong.'),
  mcQuestion('Nam châm KHÔNG hút được vật nào?', 'Mảnh giấy', ['Đinh sắt', 'Kẹp giấy sắt', 'Ốc vít sắt'], 'Nam châm chỉ hút vật bằng sắt/thép.'),
];

// ---------- Bộ sinh câu hỏi ----------
function animalQ(): SeedQuestion {
  const a = ANIMALS[rint(0, ANIMALS.length - 1)]!;
  const kind = rint(0, 2);
  if (kind === 0) return mcQuestion(`${a.name} thuộc nhóm động vật nào?`, a.group, shuffle(GROUPS.filter((g) => g !== a.group)).slice(0, 3), `${a.name} là ${a.group.toLowerCase()}.`);
  if (kind === 1) return mcQuestion(`${a.name} ăn gì là chủ yếu?`, a.diet, DIETS.filter((d) => d !== a.diet), `${a.name}: ${a.diet.toLowerCase()}.`);
  return mcQuestion(`${a.name} thường sống ở đâu?`, a.habitat, shuffle(HABITATS.filter((h) => h !== a.habitat)).slice(0, 3), `${a.name} sống ở ${a.habitat.toLowerCase()}.`);
}

function planetQ(): SeedQuestion {
  const i = rint(0, PLANETS.length - 1);
  const kind = rint(0, 2);
  if (kind === 0) return mcQuestion('Hành tinh nào gần Mặt Trời nhất?', PLANETS[0]!, shuffle(PLANETS.slice(1)).slice(0, 3), 'Sao Thủy gần Mặt Trời nhất.');
  if (kind === 1) return mcQuestion(`Hành tinh thứ ${i + 1} tính từ Mặt Trời là?`, PLANETS[i]!, shuffle(PLANETS.filter((p) => p !== PLANETS[i])).slice(0, 3), `Thứ tự: ${PLANETS.slice(0, 4).join(' → ')}...`);
  return mcQuestion('Chúng ta đang sống trên hành tinh nào?', 'Trái Đất', shuffle(PLANETS.filter((p) => p !== 'Trái Đất')).slice(0, 3), 'Trái Đất là hành tinh thứ 3.');
}

function bodyQ(): SeedQuestion {
  const b = BODY[rint(0, BODY.length - 1)]!;
  if (Math.random() < 0.5) return mcQuestion(`Cơ quan nào ${b.fn}?`, b.organ, shuffle(BODY.filter((x) => x.organ !== b.organ)).slice(0, 3).map((x) => x.organ), `${b.organ} ${b.fn}.`);
  return mcQuestion(`${b.organ} có chức năng gì?`, `Để ${b.fn}`, shuffle(BODY.filter((x) => x.organ !== b.organ)).slice(0, 3).map((x) => `Để ${x.fn}`), `${b.organ} ${b.fn}.`);
}

function materialQ(): SeedQuestion {
  const m = MATERIALS[rint(0, MATERIALS.length - 1)]!;
  if (Math.random() < 0.5) {
    const ans = m.floats ? 'Nổi' : 'Chìm';
    return mcQuestion(`Thả "${m.item}" vào nước, nó sẽ?`, ans, [m.floats ? 'Chìm' : 'Nổi', 'Tan ra', 'Bay lên'], `${m.item} ${m.floats ? 'nhẹ hơn nước nên nổi' : 'nặng hơn nước nên chìm'}.`);
  }
  const ans = m.magnetic ? 'Có' : 'Không';
  return mcQuestion(`Nam châm có hút được "${m.item}" không?`, ans, [m.magnetic ? 'Không' : 'Có', 'Chỉ khi nóng'], `${m.item} ${m.magnetic ? 'bằng sắt nên bị hút' : 'không phải sắt nên không bị hút'}.`);
}

const POOLS = [
  { module: 'Động vật', gen: animalQ },
  { module: 'Vũ trụ', gen: planetQ },
  { module: 'Cơ thể người', gen: bodyQ },
  { module: 'Vật liệu & Thí nghiệm', gen: materialQ },
  { module: 'Khám phá chung', gen: () => FACTS[rint(0, FACTS.length - 1)]! },
];

/** Sinh `target` bài học Khoa học, xoay vòng qua các chủ đề. */
export function buildScienceLessons(target: number): SeedLesson[] {
  const lessons: SeedLesson[] = [];
  for (let i = 0; i < target; i++) {
    const pool = POOLS[i % POOLS.length]!;
    const questions = Array.from({ length: 8 }, () => pool.gen());
    lessons.push({
      title: `${pool.module} — Khám phá ${Math.floor(i / POOLS.length) + 1}`,
      module: pool.module,
      estMinutes: 8,
      xpReward: 20,
      type: 'MULTIPLE_CHOICE',
      questions,
    });
  }
  return lessons;
}
