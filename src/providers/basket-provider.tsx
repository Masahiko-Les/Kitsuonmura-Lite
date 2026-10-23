import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { ALL_ITEMS, getItem, type CatalogItem } from '@/constants/catalog';
import type { Gift, Watering } from '@/lib/types';
import { subscribeGiftsBy, subscribeWateringsBy } from '@/lib/village';
import { useUid } from '@/providers/session-provider';

// 手持ちのかご。持ち物は保存せず、水やりと贈り物の記録から数える（SPEC.md「データモデル」）。
//   手持ち ＝ 自分の種が受けた水やり ＋ 自分がした水やり ＋ 受け取った贈り物 − 贈った贈り物
// 自分の種に自分で水やりした記録は両方のクエリに出るが、ドキュメントIDで重ねるので1つと数える。

export interface BasketEntry {
  item: CatalogItem;
  count: number;
}

interface Basket {
  loading: boolean;
  entries: BasketEntry[];
  countOf: (itemId: string) => number;
  /** 自分が水やりした種のID（1人1回の判定用）。 */
  wateredSeedIds: Set<string>;
  receivedGifts: Gift[];
}

const BasketContext = createContext<Basket | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const uid = useUid();
  const [onMySeeds, setOnMySeeds] = useState<Watering[] | null>(null);
  const [byMe, setByMe] = useState<Watering[] | null>(null);
  const [received, setReceived] = useState<Gift[] | null>(null);
  const [sent, setSent] = useState<Gift[] | null>(null);

  useEffect(() => {
    const onError = (error: Error) => console.warn(error);
    const unsubscribers = [
      subscribeWateringsBy('seedAuthorUid', uid, setOnMySeeds, onError),
      subscribeWateringsBy('waterUid', uid, setByMe, onError),
      subscribeGiftsBy('toUid', uid, setReceived, onError),
      subscribeGiftsBy('fromUid', uid, setSent, onError),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [uid]);

  const counts = new Map<string, number>();
  const add = (itemId: string, delta: number) =>
    counts.set(itemId, (counts.get(itemId) ?? 0) + delta);

  const waterings = new Map<string, Watering>();
  for (const watering of [...(onMySeeds ?? []), ...(byMe ?? [])]) {
    waterings.set(watering.id, watering);
  }
  waterings.forEach((watering) => add(watering.cropId, 1));
  received?.forEach((gift) => add(gift.itemId, 1));
  sent?.forEach((gift) => add(gift.itemId, -1));

  const entries = ALL_ITEMS.map((item) => ({ item, count: counts.get(item.id) ?? 0 }));
  // カタログから外れたものも手持ちには残す。
  counts.forEach((count, itemId) => {
    if (!ALL_ITEMS.some((item) => item.id === itemId)) {
      entries.push({ item: getItem(itemId), count });
    }
  });

  const basket: Basket = {
    loading: !onMySeeds || !byMe || !received || !sent,
    entries: entries.filter((entry) => entry.count > 0),
    countOf: (itemId) => Math.max(0, counts.get(itemId) ?? 0),
    wateredSeedIds: new Set((byMe ?? []).map((watering) => watering.seedId)),
    receivedGifts: received ?? [],
  };

  return <BasketContext value={basket}>{children}</BasketContext>;
}

export function useBasket() {
  const basket = use(BasketContext);
  if (!basket) throw new Error('useBasket must be used inside BasketProvider');
  return basket;
}
