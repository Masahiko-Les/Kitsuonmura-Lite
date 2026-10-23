import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BodyText, MutedText, ParchmentModal, SerifText } from '@/components/ui';
import { getItem } from '@/constants/catalog';
import { Spacing } from '@/constants/theme';
import { useBasket } from '@/providers/basket-provider';
import { useUid } from '@/providers/session-provider';

/**
 * 焚き火のひとことに贈り物が届いたら「トマトが届きました」と匿名で伝える。
 * どこまで見たかは端末に覚えておく。
 */
export function GiftArrivalNotice() {
  const uid = useUid();
  const { receivedGifts, loading } = useBasket();
  const storageKey = `giftsSeenUntil:${uid}`;
  const [seenUntil, setSeenUntil] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((value) => setSeenUntil(value ? Number(value) : 0))
      .catch(() => setSeenUntil(0));
  }, [storageKey]);

  const unseen =
    seenUntil === null || loading
      ? []
      : receivedGifts.filter((gift) => (gift.createdAt?.toMillis() ?? 0) > seenUntil);

  function close() {
    const latest = Math.max(...unseen.map((gift) => gift.createdAt?.toMillis() ?? 0), seenUntil ?? 0);
    setSeenUntil(latest);
    AsyncStorage.setItem(storageKey, String(latest)).catch(() => {});
  }

  const counts = new Map<string, number>();
  unseen.forEach((gift) => counts.set(gift.itemId, (counts.get(gift.itemId) ?? 0) + 1));

  return (
    <ParchmentModal visible={unseen.length > 0} onClose={close} closeLabel="手持ちに入れる">
      <SerifText style={styles.title}>焚き火に贈り物が届きました</SerifText>
      <View style={styles.list}>
        {[...counts.entries()].map(([itemId, count]) => {
          const item = getItem(itemId);
          return (
            <BodyText key={itemId} style={styles.row}>
              <Text style={styles.emoji}>{item.emoji}</Text> {item.name}
              {count > 1 ? `が${count}つ` : 'が'}届きました
            </BodyText>
          );
        })}
      </View>
      <MutedText style={styles.note}>
        だれかが、あなたのひとことを受け取ってくれたようです。
      </MutedText>
    </ParchmentModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  list: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  row: {
    textAlign: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  note: {
    textAlign: 'center',
  },
});
