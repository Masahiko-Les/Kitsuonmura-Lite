import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MutedText, ParchmentModal, PillButton, SerifText } from '@/components/ui';
import { alpha, Colors, Spacing } from '@/constants/theme';
import type { Post } from '@/lib/types';
import { sendGift } from '@/lib/village';
import { useBasket } from '@/providers/basket-provider';
import { useUid } from '@/providers/session-provider';

/** 手持ちの野菜や花を、焚き火のひとことに贈る。言葉は添えられない。 */
export function GiftPicker({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const uid = useUid();
  const { entries, countOf } = useBasket();
  const [sendingId, setSendingId] = useState<string | null>(null);

  async function handleSend(itemId: string, name: string) {
    if (!post || countOf(itemId) <= 0) return;
    setSendingId(itemId);
    try {
      await sendGift(uid, post, itemId);
      onClose();
      Alert.alert(`${name}を贈りました`, 'あなたからだとは伝わりません。');
    } catch (e) {
      console.warn(e);
      Alert.alert('贈れませんでした', 'ひとことが燃え尽きたか、通信がうまくいきませんでした。');
    } finally {
      setSendingId(null);
    }
  }

  return (
    <ParchmentModal visible={post !== null} onClose={onClose}>
      <SerifText style={styles.title}>何を贈りますか？</SerifText>
      <ScrollView style={styles.list} contentContainerStyle={{ gap: Spacing.sm }}>
        {entries.map(({ item, count }) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.itemLabel}>
              {item.emoji} {item.name} ×{count}
            </Text>
            <PillButton
              small
              variant="ember"
              label="贈る"
              loading={sendingId === item.id}
              disabled={sendingId !== null}
              onPress={() => handleSend(item.id, item.name)}
            />
          </View>
        ))}
        {entries.length === 0 ? (
          <MutedText style={styles.empty}>
            贈れるものがまだありません。{'\n'}農園や砂漠で水やりすると、野菜や花が届きます。
          </MutedText>
        ) : null}
      </ScrollView>
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
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  itemLabel: {
    fontSize: 15,
    color: Colors.ink,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.lg,
    color: alpha(Colors.ink, 0.5),
  },
});
