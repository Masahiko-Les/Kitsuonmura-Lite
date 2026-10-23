import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BodyText, Card, PillButton, SerifText } from '@/components/ui';
import { alpha, Colors, Spacing } from '@/constants/theme';
import { acceptTerms, registerVillager } from '@/lib/village';
import { useSession, useUid } from '@/providers/session-provider';

function CheckRow({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={styles.checkRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}>
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>
      <BodyText style={{ flex: 1 }}>{label}</BodyText>
    </Pressable>
  );
}

/** 村人登録。初回起動時に利用規約へ同意してもらい、users/{uid} を作る。 */
export default function RegisterScreen() {
  const uid = useUid();
  const { userDoc } = useSession();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [pending, setPending] = useState(false);

  const isReconsent = userDoc !== null;

  async function handleRegister() {
    setPending(true);
    try {
      if (isReconsent) await acceptTerms(uid);
      else await registerVillager(uid);
    } catch (e) {
      console.warn(e);
      Alert.alert('登録できませんでした', '通信状態を確かめて、もう一度お試しください。');
      setPending(false);
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      <SerifText style={styles.title}>
        {isReconsent ? '利用規約が新しくなりました' : 'ようこそ、吃音村Liteへ'}
      </SerifText>
      <BodyText>
        ここは、吃音の苦労や挑戦を種として植え、水やりで実った野菜や花を焚き火で贈り合う、小さな村です。メッセージやコメントはありません。
      </BodyText>

      <Card style={{ gap: Spacing.sm }}>
        <SerifText style={styles.heading}>村の決まり</SerifText>
        <BodyText>・他の村人を傷つける投稿はできません</BodyText>
        <BodyText>・あなたが誰か分かることは書かないでください</BodyText>
        <BodyText>・連絡先やSNSのIDは書けません</BodyText>
        <BodyText>・気になる投稿は通報・ブロックできます</BodyText>
        <Link href="/terms" style={styles.link}>
          利用規約をすべて読む
        </Link>
      </Card>

      <View style={{ gap: Spacing.md }}>
        <CheckRow
          checked={agreeTerms}
          onToggle={() => setAgreeTerms((v) => !v)}
          label="利用規約に同意し、不適切な投稿をしないことを約束します"
        />
        <CheckRow
          checked={agreeAge}
          onToggle={() => setAgreeAge((v) => !v)}
          label="13歳以上です。18歳未満の場合は、保護者の同意を得ています"
        />
      </View>

      <PillButton
        label={isReconsent ? '同意して村に戻る' : '村人になる'}
        variant="ember"
        disabled={!agreeTerms || !agreeAge}
        loading={pending}
        onPress={handleRegister}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl * 2,
    gap: Spacing.xl,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
  heading: {
    fontSize: 17,
    marginBottom: Spacing.xs,
  },
  link: {
    color: Colors.ember,
    marginTop: Spacing.sm,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: alpha(Colors.ink, 0.4),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: Colors.leaf,
    borderColor: Colors.leaf,
  },
  checkMark: {
    color: Colors.white,
    fontWeight: '700',
  },
});
