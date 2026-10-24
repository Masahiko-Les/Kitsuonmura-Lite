import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { CrisisSupportModal } from '@/components/crisis-support-modal';
import { MutedText, PillButton, SerifText } from '@/components/ui';
import { alpha, Colors, Fonts, Spacing } from '@/constants/theme';
import { checkText, MODERATION_MESSAGES, needsCrisisSupport } from '@/lib/moderation';

export interface ComposerField {
  /** 複数の欄がある時だけ見出しを出す（例：「① 苦労したこと」）。 */
  label?: string;
  placeholder: string;
  maxLength: number;
}

function lengthOf(text: string) {
  return [...text.trim()].length;
}

/**
 * 種を植える・焚き火にくべる、の共通の入力欄。欄はいくつでも並べられ、すべて書くと送れる。
 * NGワードと連絡先は送信前に止め、つらい言葉には送信後に相談窓口をそっと案内する。
 */
export function Composer({
  fields,
  submitLabel,
  pendingLabel,
  variant,
  onSubmit,
}: {
  fields: ComposerField[];
  submitLabel: string;
  pendingLabel: string;
  variant: 'leaf' | 'ember';
  /** 欄と同じ順で、前後の空白を除いた文字列を受け取る。 */
  onSubmit: (values: string[]) => Promise<void>;
}) {
  const [values, setValues] = useState(() => fields.map(() => ''));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);

  const lengths = values.map(lengthOf);
  const tooLong = fields.map((field, i) => lengths[i] > field.maxLength);
  const canSubmit = lengths.every((length) => length > 0) && !tooLong.some(Boolean);

  async function handleSubmit() {
    if (!canSubmit || pending) return;
    const trimmed = values.map((value) => value.trim());
    for (const text of trimmed) {
      const result = checkText(text);
      if (!result.ok) {
        setError(MODERATION_MESSAGES[result.reason]);
        return;
      }
    }
    setError(null);
    setPending(true);
    try {
      await onSubmit(trimmed);
      setValues(fields.map(() => ''));
      if (trimmed.some(needsCrisisSupport)) setShowCrisisSupport(true);
    } catch (e) {
      console.warn(e);
      Alert.alert('うまく届きませんでした', '通信状態を確かめて、もう一度お試しください。');
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={styles.container}>
      {fields.map((field, i) => (
        <View key={i} style={styles.field}>
          {field.label ? <SerifText style={styles.label}>{field.label}</SerifText> : null}
          <TextInput
            value={values[i]}
            onChangeText={(value) => {
              setValues((prev) => prev.map((v, j) => (j === i ? value : v)));
              if (error) setError(null);
            }}
            placeholder={field.placeholder}
            placeholderTextColor={alpha(Colors.ink, 0.4)}
            multiline
            style={[styles.input, tooLong[i] && { borderColor: Colors.danger }]}
            accessibilityLabel={field.label ?? field.placeholder}
          />
          <MutedText style={[styles.counter, tooLong[i] && { color: Colors.danger }]}>
            {lengths[i]} / {field.maxLength}
          </MutedText>
        </View>
      ))}
      {error ? <MutedText style={styles.error}>{error}</MutedText> : null}
      <PillButton
        label={pending ? pendingLabel : submitLabel}
        onPress={handleSubmit}
        variant={variant}
        disabled={!canSubmit}
        loading={pending}
        style={styles.submit}
      />
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
  field: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 15,
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
  counter: {
    fontSize: 12,
    textAlign: 'right',
  },
  error: {
    color: Colors.danger,
  },
  submit: {
    alignSelf: 'flex-end',
  },
});
