// 作物と花のカタログ（SPEC.md「作物と花のカタログ」）。
// active を false にすると、新しく実るものから外れる（手持ちの表示には残る）。
// ここを変えたら firestore.rules の cropIds も合わせて更新すること。

export type SeedKind = 'farm' | 'desert';

export interface CatalogItem {
  id: string;
  name: string;
  emoji: string;
  kind: SeedKind;
  active: boolean;
}

export const CROP_CATALOG: CatalogItem[] = [
  { id: 'tomato', name: 'トマト', emoji: '🍅', kind: 'farm', active: true },
  { id: 'potato', name: 'じゃがいも', emoji: '🥔', kind: 'farm', active: true },
  { id: 'pumpkin', name: 'かぼちゃ', emoji: '🎃', kind: 'farm', active: true },
  { id: 'corn', name: 'とうもろこし', emoji: '🌽', kind: 'farm', active: true },
  { id: 'carrot', name: 'にんじん', emoji: '🥕', kind: 'farm', active: true },
];

export const FLOWER_CATALOG: CatalogItem[] = [
  { id: 'sakura', name: 'さくら', emoji: '🌸', kind: 'desert', active: true },
  { id: 'tulip', name: 'チューリップ', emoji: '🌷', kind: 'desert', active: true },
  { id: 'hibiscus', name: 'ハイビスカス', emoji: '🌺', kind: 'desert', active: true },
  { id: 'sunflower', name: 'ひまわり', emoji: '🌻', kind: 'desert', active: true },
  { id: 'margaret', name: 'マーガレット', emoji: '🌼', kind: 'desert', active: true },
];

export const ALL_ITEMS = [...CROP_CATALOG, ...FLOWER_CATALOG];

const itemById = new Map(ALL_ITEMS.map((item) => [item.id, item]));

export function getItem(id: string): CatalogItem {
  return (
    itemById.get(id) ?? { id, name: 'おくりもの', emoji: '🎁', kind: 'farm', active: false }
  );
}

/** 有効なものからランダムに1つ選ぶ。農園なら野菜、砂漠なら花。 */
export function pickRandomItem(kind: SeedKind): CatalogItem {
  const pool = (kind === 'farm' ? CROP_CATALOG : FLOWER_CATALOG).filter((item) => item.active);
  return pool[Math.floor(Math.random() * pool.length)];
}
