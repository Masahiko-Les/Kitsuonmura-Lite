import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

/**
 * 残り時間を炎の大きさで表す。remaining は 0（燃え尽き）〜 1（くべたばかり）。
 * ゆらぎは Animated のループで、ほんの少しだけ大きさと傾きを揺らす。
 */
export function Flame({ remaining }: { remaining: number }) {
  const [flicker] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, {
          toValue: 1,
          duration: 700 + Math.random() * 400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0,
          duration: 700 + Math.random() * 400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [flicker]);

  const clamped = Math.max(0, Math.min(1, remaining));
  const fontSize = 16 + 32 * clamped;
  const scale = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] });
  const rotate = flicker.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] });

  return (
    <View style={styles.box} accessibilityLabel={`炎の大きさ：残り${Math.round(clamped * 100)}%`}>
      <Animated.View
        style={{ transform: [{ scale }, { rotate }], opacity: 0.55 + 0.45 * clamped }}>
        <Text style={{ fontSize, lineHeight: fontSize * 1.2 }}>🔥</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 60,
    height: 64,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
