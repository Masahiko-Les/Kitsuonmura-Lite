import * as WebBrowser from 'expo-web-browser';
import { StyleSheet } from 'react-native';

import { BodyText, ParchmentModal, PillButton, SerifText } from '@/components/ui';
import { CRISIS_SUPPORT_URL } from '@/constants/app-config';
import { Spacing } from '@/constants/theme';

/** つらい言葉を書いた本人にだけ、相談窓口をそっと案内する。他の村人には何も伝わらない。 */
export function CrisisSupportModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <ParchmentModal visible={visible} onClose={onClose}>
      <SerifText style={styles.title}>言葉を届けてくれて、ありがとうございます</SerifText>
      <BodyText style={styles.body}>
        もし今とてもつらい気持ちでいるなら、話を聞いてくれる場所があります。電話やSNSで、無料で相談できます。
      </BodyText>
      <PillButton
        label="相談できる場所を見る"
        variant="outline"
        onPress={() => WebBrowser.openBrowserAsync(CRISIS_SUPPORT_URL)}
        style={{ alignSelf: 'center' }}
      />
    </ParchmentModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  body: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});
