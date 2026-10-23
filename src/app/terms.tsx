import { ScrollView, StyleSheet, View } from 'react-native';

import { BodyText, MutedText, SerifText } from '@/components/ui';
import { TERMS_SECTIONS, TERMS_UPDATED_AT } from '@/constants/terms';
import { Colors, Spacing } from '@/constants/theme';

export default function TermsScreen() {
  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      <SerifText style={styles.title}>吃音村Lite 利用規約</SerifText>
      {TERMS_SECTIONS.map((section) => (
        <View key={section.heading} style={styles.section}>
          <SerifText style={styles.heading}>{section.heading}</SerifText>
          <BodyText>{section.body}</BodyText>
        </View>
      ))}
      <MutedText>{TERMS_UPDATED_AT} 制定</MutedText>
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
    fontSize: 22,
  },
  section: {
    gap: Spacing.sm,
  },
  heading: {
    fontSize: 17,
  },
});
