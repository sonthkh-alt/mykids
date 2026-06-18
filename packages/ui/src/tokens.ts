/**
 * Design tokens — phong cách Duolingo × Khan Academy Kids × Minecraft.
 * Tươi sáng, bo tròn, nhiều màu năng lượng. Dùng chung cho Tailwind theme.
 */
export const tokens = {
  color: {
    brand: '#58CC02', // xanh lá năng lượng (Duolingo-like)
    brandDark: '#46A302',
    sky: '#1CB0F6',
    sun: '#FFC800',
    coral: '#FF4B4B',
    grape: '#CE82FF',
    ink: '#3C3C3C',
    cloud: '#F7F7F7',
  },
  radius: { sm: '0.5rem', md: '1rem', lg: '1.5rem', pill: '9999px' },
  shadow: {
    pop: '0 4px 0 0 rgba(0,0,0,0.12)', // hiệu ứng nút "3D" như game
  },
  font: {
    display: '"Baloo 2", "Nunito", system-ui, sans-serif',
    body: '"Nunito", system-ui, sans-serif',
  },
} as const;

export type Tokens = typeof tokens;
