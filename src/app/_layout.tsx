import { DefaultTheme, router, Stack, ThemeProvider, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BodyText, SerifText } from '@/components/ui';
import { Colors, HeaderOptions, Spacing } from '@/constants/theme';
import { isFirebaseConfigured } from '@/lib/firebase';
import { SessionProvider, useSession } from '@/providers/session-provider';

SplashScreen.preventAutoHideAsync();

const villageTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.ember,
    background: Colors.background,
    card: Colors.parchment,
    text: Colors.ink,
    border: Colors.border,
  },
};

/** 利用規約などのモーダルを閉じる。戻る先がない時は、今の状態の最初の画面へ行く。 */
function CloseButton({ fallback }: { fallback: Href }) {
  return (
    <Pressable
      hitSlop={12}
      accessibilityRole="button"
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}>
      <Text style={styles.closeLabel}>閉じる</Text>
    </Pressable>
  );
}

function RootNavigator() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'loading') SplashScreen.hideAsync();
  }, [status]);

  if (status === 'loading') return null;

  // 起動 → 匿名で村に入る → 村人登録（規約に同意）→ 3つのタブ（SPEC.md「画面構成」）
  // 見られない画面に来た時の行き先を、今の状態に合わせて明示する。
  // 指定しないとアンカー任せになり、村人登録ではなく利用規約に飛ばされてしまう。
  const home: Href =
    status === 'signed-out' ? '/sign-in' : status === 'needs-registration' ? '/register' : '/';
  return (
    <Stack screenOptions={{ ...HeaderOptions, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Protected guard={status === 'signed-out'} redirectTo={home}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={status === 'needs-registration'} redirectTo={home}>
        <Stack.Screen name="register" options={{ title: '村人登録', headerBackVisible: false }} />
      </Stack.Protected>
      <Stack.Protected guard={status === 'ready'} redirectTo={home}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen
        name="terms"
        options={{
          title: '利用規約',
          presentation: 'modal',
          headerRight: () => <CloseButton fallback={home} />,
        }}
      />
    </Stack>
  );
}

function SetupNeeded() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return (
    <View style={styles.setup}>
      <SerifText style={styles.setupTitle}>Firebase の設定が必要です</SerifText>
      <BodyText>
        .env.example を .env.local にコピーし、Firebase コンソールの値を入れてから、開発サーバーを起動し直してください。手順は
        README.md にあります。
      </BodyText>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={villageTheme}>
      <StatusBar style="dark" />
      {isFirebaseConfigured ? (
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      ) : (
        <SetupNeeded />
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  setup: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
    backgroundColor: Colors.background,
  },
  setupTitle: {
    fontSize: 22,
  },
  closeLabel: {
    fontSize: 16,
    color: Colors.ember,
  },
});
