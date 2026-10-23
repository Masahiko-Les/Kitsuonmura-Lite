import { Platform } from 'react-native';

// Web版「吃音村」(KitsuonmuraWEBver2/src/app/globals.css) の配色をそのまま引き継ぐ。
export const Colors = {
  background: '#f6efe1',
  foreground: '#3f3226',
  paper: '#fbf6ea',
  ink: '#4a3b2c',
  ember: '#b5613a',
  emberDark: '#8a4326',
  leaf: '#5c7a4f',
  border: '#d9c9a8',
  parchment: '#f5e8cc',
  timber: '#3f2c22',
  gold: '#be8c4e',
  sand: '#e9d3a6',
  white: '#ffffff',
  danger: '#b91c1c',
} as const;

/** `#rrggbb` に不透明度を足す（Tailwind の `text-village-ink/70` 相当）。 */
export function alpha(hex: string, opacity: number) {
  const a = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

// Web版は見出しに Shippori Mincho を使う。iOS に標準で入っているヒラギノ明朝で同じ雰囲気を出す。
export const Fonts = {
  serif: Platform.select({ ios: 'Hiragino Mincho ProN', default: 'serif' }),
  sans: Platform.select({ ios: 'Hiragino Sans', default: undefined }),
};

/** 画面上部のヘッダー。Web版の羊皮紙色のヘッダーに合わせる。 */
export const HeaderOptions = {
  headerStyle: { backgroundColor: Colors.parchment },
  headerTintColor: Colors.ink,
  headerTitleStyle: { fontFamily: Fonts.serif, color: Colors.ink },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  card: 12,
  pill: 999,
  modal: 28,
} as const;
