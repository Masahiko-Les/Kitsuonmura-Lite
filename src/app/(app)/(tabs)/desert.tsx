import { SeedBoard } from '@/components/seed-board';

export default function DesertScreen() {
  return (
    <SeedBoard
      kind="desert"
      copy={{
        title: '砂漠',
        icon: require('@/assets/images/facilities/desert.png'),
        description:
          '吃音とともに踏み出した挑戦を、ひとことの種として植える村の砂漠です。村人が水やりすると、乾いた大地に花が咲き、植えた人と水やりした人の両方に届きます。種は消えません。',
        placeholder: '吃音とともに挑戦したことを、種として植えてみましょう。',
        plantedMessage: 'よく踏み出しましたね。\n砂漠に花が咲くのを待ちましょう。',
        emptyMessage: 'まだ挑戦の種がありません。最初の種を植えてみませんか。',
        fruitWord: '花',
        fruitVerb: '咲きました',
      }}
    />
  );
}
