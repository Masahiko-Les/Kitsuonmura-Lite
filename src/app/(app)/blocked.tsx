import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Card, MutedText, PillButton } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { unblockVillager } from '@/lib/village';
import { useSession, useUid } from '@/providers/session-provider';

/** 村人には名前がないので、ブロックした順に番号で並べる。 */
export default function BlockedScreen() {
  const uid = useUid();
  const { userDoc } = useSession();
  const blocked = userDoc?.blockedUids ?? [];

  function confirmUnblock(targetUid: string, index: number) {
    Alert.alert(`村人${index + 1} のブロックを解除しますか？`, 'この村人の種とひとことが、また見えるようになります。', [
      { text: 'やめる', style: 'cancel' },
      {
        text: '解除する',
        onPress: () => unblockVillager(uid, targetUid).catch((e) => console.warn(e)),
      },
    ]);
  }

  return (
    <FlatList
      data={blocked}
      keyExtractor={(item) => item}
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      ListHeaderComponent={
        <MutedText style={{ marginBottom: Spacing.lg }}>
          ブロックした村人の種とひとことは、農園・砂漠・焚き火のどこにも表示されません。ブロックしたことは相手に伝わりません。
        </MutedText>
      }
      ListEmptyComponent={<MutedText style={styles.empty}>ブロックしている村人はいません。</MutedText>}
      renderItem={({ item, index }) => (
        <Card style={styles.row}>
          <Text style={styles.label}>村人{index + 1}</Text>
          <PillButton small variant="outline" label="解除する" onPress={() => confirmUnblock(item, index)} />
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  label: {
    fontSize: 15,
    color: Colors.ink,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
