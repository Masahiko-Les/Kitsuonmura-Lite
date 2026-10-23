import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,

  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';

import { alpha, Colors, Fonts, Radius, Spacing } from '@/constants/theme';

// Web版の部品（FacilityHeader・羊皮紙カードのモーダル・丸いボタン）を React Native で描き直したもの。

export function SerifText({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.serif, style]} />;
}

export function BodyText({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.body, style]} />;
}

export function MutedText({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.muted, style]} />;
}

/** 金色の細い線とひし形の飾り。 */
export function Ornament({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.ornament, style]}>
      <View style={styles.ornamentLine} />
      <View style={styles.ornamentDiamond} />
      <View style={styles.ornamentLine} />
    </View>
  );
}

export function FacilityHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: number;
}) {
  return (
    <View style={styles.facilityHeader}>
      <View style={styles.facilityTitleRow}>
        {icon ? <Image source={icon} style={styles.facilityIcon} contentFit="contain" /> : null}
        <SerifText style={styles.facilityTitle}>{title}</SerifText>
      </View>
      {description ? <MutedText style={styles.facilityDescription}>{description}</MutedText> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonVariant = 'leaf' | 'ember' | 'outline' | 'ghost' | 'danger';

export function PillButton({
  label,
  onPress,
  variant = 'leaf',
  disabled,
  loading,
  small,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const filled = variant === 'leaf' || variant === 'ember' || variant === 'danger';
  const textColor = filled
    ? Colors.white
    : variant === 'outline'
      ? Colors.leaf
      : alpha(Colors.ink, 0.6);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.pill,
        small && styles.pillSmall,
        variant === 'leaf' && { backgroundColor: Colors.leaf },
        variant === 'ember' && { backgroundColor: Colors.ember },
        variant === 'danger' && { backgroundColor: Colors.danger },
        variant === 'outline' && styles.pillOutline,
        (disabled || loading) && { opacity: 0.45 },
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.pillLabel, small && styles.pillLabelSmall, { color: textColor }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

/** Web版の「village-auth-card」風の羊皮紙モーダル。 */
export function ParchmentModal({
  visible,
  onClose,
  children,
  closeLabel = '閉じる',
  hideCloseButton,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
  hideCloseButton?: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="閉じる">
        <Pressable style={styles.parchment} onPress={() => {}}>
          <View pointerEvents="none" style={styles.parchmentInnerBorder} />
          <Ornament style={{ marginBottom: Spacing.md }} />
          {children}
          {hideCloseButton ? null : (
            <PillButton
              label={closeLabel}
              onPress={onClose}
              variant="ember"
              style={{ alignSelf: 'center', marginTop: Spacing.xl }}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function CenteredLoading() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={Colors.ember} />
    </View>
  );
}

export const styles = StyleSheet.create({
  serif: {
    fontFamily: Fonts.serif,
    color: Colors.ink,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 24,
    color: alpha(Colors.ink, 0.92),
  },
  muted: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    color: alpha(Colors.ink, 0.65),
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  ornamentLine: {
    height: StyleSheet.hairlineWidth * 2,
    width: 32,
    backgroundColor: alpha(Colors.gold, 0.7),
  },
  ornamentDiamond: {
    width: 6,
    height: 6,
    borderWidth: 1,
    borderColor: alpha(Colors.gold, 0.7),
    transform: [{ rotate: '45deg' }],
  },
  facilityHeader: {
    paddingBottom: Spacing.xl,
    marginBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  facilityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  facilityIcon: {
    width: 64,
    height: 64,
  },
  facilityTitle: {
    fontSize: 28,
  },
  facilityDescription: {
    marginTop: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.paper,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.lg,
  },
  pill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  pillSmall: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    minHeight: 32,
  },
  pillOutline: {
    borderWidth: 1,
    borderColor: Colors.leaf,
  },
  pillLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  pillLabelSmall: {
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: alpha(Colors.ink, 0.5),
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  parchment: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    backgroundColor: Colors.parchment,
    borderRadius: Radius.modal,
    borderWidth: 1,
    borderColor: alpha(Colors.gold, 0.4),
    padding: Spacing.xl,
    shadowColor: '#1f140e',
    shadowOpacity: 0.45,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 20 },
  },
  parchmentInnerBorder: {
    position: 'absolute',
    top: 7,
    left: 7,
    right: 7,
    bottom: 7,
    borderRadius: Radius.modal - 7,
    borderWidth: 1,
    borderColor: alpha(Colors.gold, 0.25),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
