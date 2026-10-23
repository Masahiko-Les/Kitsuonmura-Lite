import { Image } from 'expo-image';
import { router, Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { alpha, Colors, Fonts, HeaderOptions, Spacing } from '@/constants/theme';

// 村の施設のアイコン（Web版と同じ絵）をそのままタブに使う。選ばれていない施設は少し淡くする。
function FacilityTabIcon({ source, focused }: { source: number; focused: boolean }) {
  return (
    <Image
      source={source}
      style={[styles.tabIcon, { opacity: focused ? 1 : 0.5 }]}
      contentFit="contain"
    />
  );
}

function HeaderButtons() {
  return (
    <View style={styles.headerButtons}>
      <Pressable
        onPress={() => router.push('/basket')}
        hitSlop={8}
        accessibilityLabel="手持ちのかご">
        <SymbolView name="basket" size={22} tintColor={Colors.ink} />
      </Pressable>
      <Pressable onPress={() => router.push('/settings')} hitSlop={8} accessibilityLabel="設定">
        <SymbolView name="gearshape" size={22} tintColor={Colors.ink} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        ...HeaderOptions,
        // 施設名は各画面の見出しに出すので、ヘッダーは村の名前にする。
        headerTitle: '吃音村Lite',
        headerRight: () => <HeaderButtons />,
        tabBarActiveTintColor: Colors.ember,
        tabBarInactiveTintColor: alpha(Colors.ink, 0.6),
        tabBarStyle: {
          backgroundColor: Colors.paper,
          borderTopColor: Colors.border,
        },
        tabBarLabelStyle: { fontFamily: Fonts.serif, fontSize: 12 },
        sceneStyle: { backgroundColor: Colors.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '農園',
          tabBarIcon: ({ focused }) => (
            <FacilityTabIcon source={require('@/assets/images/facilities/garden.png')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="bonfire"
        options={{
          title: '焚き火',
          tabBarIcon: ({ focused }) => (
            <FacilityTabIcon source={require('@/assets/images/facilities/bonfire.png')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="desert"
        options={{
          title: '砂漠',
          tabBarIcon: ({ focused }) => (
            <FacilityTabIcon source={require('@/assets/images/facilities/desert.png')} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 36,
    height: 28,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
});
