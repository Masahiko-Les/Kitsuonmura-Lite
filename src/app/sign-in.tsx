import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BodyText, MutedText, Ornament, PillButton, SerifText } from '@/components/ui';
import { alpha, Colors, Spacing } from '@/constants/theme';
import { enterVillage } from '@/lib/auth';

const FACILITY_ICONS = [
  require('@/assets/images/facilities/garden.png'),
  require('@/assets/images/facilities/bonfire.png'),
  require('@/assets/images/facilities/desert.png'),
];

export default function SignInScreen() {
  const [pending, setPending] = useState(false);

  async function handleEnter() {
    setPending(true);
    try {
      await enterVillage();
    } catch (e) {
      console.warn(e);
      Alert.alert('村に入れませんでした', '通信状態を確かめて、もう一度お試しください。');
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.icons}>
          {FACILITY_ICONS.map((icon, index) => (
            <Image key={index} source={icon} style={styles.icon} contentFit="contain" />
          ))}
        </View>
        <SerifText style={styles.title}>吃音村Lite</SerifText>
        <Ornament />
        <BodyText style={styles.tagline}>
          苦労を種として育て、{'\n'}言葉を交わさずに、ねぎらい合う場所です。
        </BodyText>
      </View>

      <View style={styles.bottom}>
        <PillButton label="村に入る" variant="ember" loading={pending} onPress={handleEnter} />
        <MutedText style={styles.center}>
          名前やメールアドレスは受け取りません。{'\n'}村では、だれもが匿名の村人です。
        </MutedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.parchment,
    paddingHorizontal: Spacing.xl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  icon: {
    width: 84,
    height: 72,
  },
  title: {
    fontSize: 38,
    letterSpacing: 2,
  },
  tagline: {
    textAlign: 'center',
    color: alpha(Colors.ink, 0.8),
  },
  bottom: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  center: {
    textAlign: 'center',
  },
});
