import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { GiftArrivalNotice } from '@/components/gift-arrival-notice';
import { Colors, HeaderOptions } from '@/constants/theme';
import { cleanUpMyExpiredPosts } from '@/lib/village';
import { BasketProvider } from '@/providers/basket-provider';
import { useUid } from '@/providers/session-provider';

export default function AppLayout() {
  const uid = useUid();

  useEffect(() => {
    cleanUpMyExpiredPosts(uid).catch((e) => console.warn(e));
  }, [uid]);

  return (
    <BasketProvider>
      <Stack screenOptions={{ ...HeaderOptions, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="basket" options={{ title: '手持ちのかご' }} />
        <Stack.Screen name="settings" options={{ title: '設定' }} />
        <Stack.Screen name="blocked" options={{ title: 'ブロック一覧' }} />
      </Stack>
      <GiftArrivalNotice />
    </BasketProvider>
  );
}
