import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MutedText, SerifText } from '@/components/ui';
import { CONTACT_EMAIL, PRIVACY_POLICY_URL } from '@/constants/app-config';
import { alpha, Colors, Spacing } from '@/constants/theme';
import { deleteAccount } from '@/lib/auth';

function Row({
  label,
  onPress,
  destructive,
  detail,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  detail?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: alpha(Colors.border, 0.4) }]}>
      <Text style={[styles.rowLabel, destructive && { color: Colors.danger }]}>{label}</Text>
      {detail ? <MutedText style={{ fontSize: 12 }}>{detail}</MutedText> : <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [deleting, setDeleting] = useState(false);

  function confirmDeleteAccount() {
    Alert.alert(
      'アカウントを削除しますか？',
      'あなたの種・焚き火のひとこと・アカウントが削除され、元に戻せません。他の村人の手持ちが減らないよう、水やりと贈り物の記録だけは残ります。',
      [
        { text: 'やめる', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              // サインアウト状態になると、ルートの案内でサインイン画面に戻る。
            } catch (e) {
              console.warn(e);
              Alert.alert('削除できませんでした', '通信状態を確かめて、もう一度お試しください。');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      <View style={styles.group}>
        <SerifText style={styles.groupTitle}>村での暮らし</SerifText>
        <View style={styles.card}>
          <Row label="ブロック一覧" onPress={() => router.push('/blocked')} />
        </View>
      </View>

      <View style={styles.group}>
        <SerifText style={styles.groupTitle}>決まりとお問い合わせ</SerifText>
        <View style={styles.card}>
          <Row label="利用規約" onPress={() => router.push('/terms')} />
          <View style={styles.divider} />
          <Row
            label="プライバシーポリシー"
            onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
          />
          <View style={styles.divider} />
          <Row
            label="お問い合わせ"
            detail={CONTACT_EMAIL}
            onPress={() =>
              Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('吃音村Lite について')}`).catch(
                () => Alert.alert('お問い合わせ', CONTACT_EMAIL),
              )
            }
          />
        </View>
      </View>

      <View style={styles.group}>
        <SerifText style={styles.groupTitle}>アカウント</SerifText>
        <View style={styles.card}>
          <Row label="アカウント削除" destructive onPress={confirmDeleteAccount} />
        </View>
      </View>

      {deleting ? (
        <View style={styles.deleting}>
          <ActivityIndicator color={Colors.ember} />
          <MutedText>削除しています…</MutedText>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
    gap: Spacing.xl,
  },
  group: {
    gap: Spacing.sm,
  },
  groupTitle: {
    fontSize: 14,
    color: alpha(Colors.ink, 0.7),
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.paper,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    gap: Spacing.md,
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.ink,
  },
  chevron: {
    fontSize: 20,
    color: alpha(Colors.ink, 0.35),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg,
  },
  deleting: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
