import { Alert } from 'react-native';

import type { ReportTargetType } from '@/lib/types';
import { blockVillager, report, REPORT_REASONS } from '@/lib/village';
import { useUid } from '@/providers/session-provider';

const TARGET_LABEL: Record<ReportTargetType, string> = {
  seed: '種',
  post: '焚き火のひとこと',
};

/** 他の村人の種・投稿につける「…」メニュー（通報・ブロック）。農園・砂漠・焚き火で共通。 */
export function useContentMenu() {
  const uid = useUid();

  function askReason(targetType: ReportTargetType, targetId: string) {
    Alert.alert('通報する理由', '運営が内容を確かめます。通報したことは相手に伝わりません。', [
      ...REPORT_REASONS.map((reason) => ({
        text: reason,
        onPress: async () => {
          try {
            await report(uid, targetType, targetId, reason);
            Alert.alert('通報しました', 'お知らせくださり、ありがとうございます。');
          } catch (e) {
            console.warn(e);
            // ドキュメントIDが同じ＝すでに通報済みの時もここに来る。
            Alert.alert('通報できませんでした', 'すでに通報済みか、通信がうまくいきませんでした。');
          }
        },
      })),
      { text: 'やめる', style: 'cancel' },
    ]);
  }

  function confirmBlock(authorUid: string) {
    Alert.alert(
      'この村人をブロックしますか？',
      'この村人の種と焚き火のひとことが、農園・砂漠・焚き火のすべてで見えなくなります。設定からいつでも解除できます。',
      [
        { text: 'やめる', style: 'cancel' },
        {
          text: 'ブロックする',
          style: 'destructive',
          onPress: () =>
            blockVillager(uid, authorUid).catch((e) => {
              console.warn(e);
              Alert.alert('ブロックできませんでした', 'もう一度お試しください。');
            }),
        },
      ],
    );
  }

  return function openMenu(targetType: ReportTargetType, targetId: string, authorUid: string) {
    Alert.alert(`この${TARGET_LABEL[targetType]}について`, undefined, [
      { text: '通報する', onPress: () => askReason(targetType, targetId) },
      { text: 'この村人をブロックする', style: 'destructive', onPress: () => confirmBlock(authorUid) },
      { text: 'やめる', style: 'cancel' },
    ]);
  };
}
