import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { CrisisSupportModal } from '@/components/crisis-support-modal';
import { MutedText, PillButton } from '@/components/ui';
import { alpha, Colors, Fonts, Spacing } from '@/constants/theme';
import { checkText, MODERATION_MESSAGES, needsCrisisSupport } from '@/lib/moderation';

/**
 * 種を植える・焚き火にくべる、の共通の入力欄。
 * NGワードと連絡先は送信前に止め、つらい言葉には送信後に相談窓口をそっと案内する。
 */
export function Composer({
  placeholder,
  submitLabel,
  pendingLabel,
  maxLength,
  variant,
  onSubmit,
}: {
  placeholder: string;
  submitLabel: string;
  pendingLabel: string;
  maxLength: number;
  variant: 'leaf' | 'ember';
  onSubmit: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);

  const trimmed = text.trim();
  const length = [...trimmed].length;
  const tooLong = length > maxLength;

  async function handleSubmit() {
    if (length === 0 || tooLong || pending) return;
    const result = checkText(trimmed);
    if (!result.ok) {
      setError(MODERATION_MESSAGES[result.reason]);
      return;
    }
    setError(null);
    setPending(true);
    try {
      await onSubmit(trimmed);
      setText('');
      if (needsCrisisSupport(trimmed)) setShowCrisisSupport(true);
    } catch (e) {
      console.warn(e);
      Alert.alert('うまく届きませんでした', '通信状態を確かめて、もう一度お試しください。');
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={(value) => {
          setText(value);
          if (error) setError(null);
        }}
        placeholder={placeholder}
        placeholderTextColor={alpha(Colors.ink, 0.4)}
        multiline
        style={[styles.input, (error || tooLong) && { borderColor: Colors.danger }]}
        accessibilityLabel={placeholder}
      />
      <MutedText style={styles.notice}>
        年齢・学校・住んでいる場所など、あなたが誰か分かることは書かないでください。
      </MutedText>
      {error ? <MutedText style={styles.error}>{error}</MutedText> : null}
      <View style={styles.footer}>
        <MutedText style={[styles.counter, tooLong && { color: Colors.danger }]}>
          {length} / {maxLength}
        </MutedText>
        <PillButton
          label={pending ? pendingLabel : submitLabel}
          onPress={handleSubmit}
          variant={variant}
          disabled={length === 0 || tooLong}
          loading={pending}
        />
      </View>
      <CrisisSupportModal
        visible={showCrisisSupport}
        onClose={() => setShowCrisisSupport(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.ink,
    textAlignVertical: 'top',
  },
  notice: {
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: Colors.danger,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    fontSize: 12,
  },
});
