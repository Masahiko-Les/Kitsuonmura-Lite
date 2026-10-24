import { SeedBoard } from '@/components/seed-board';
import { DESERT_FIELD_MAX_LENGTH } from '@/constants/app-config';

export default function DesertScreen() {
  return (
    <SeedBoard
      kind="desert"
      copy={{
        title: '砂漠',
        icon: require('@/assets/images/facilities/desert.png'),
        description:
          '吃音のことで苦労したことと、それにどう向き合ったかを、種として植える村の砂漠です。村人が水やりすると、乾いた大地に花が咲き、植えた人と水やりした人の両方に届きます。種は消えません。',
        fields: [
          {
            label: '① 苦労したこと',
            placeholder: '吃音のことで、苦労したことを書いてみましょう。',
            maxLength: DESERT_FIELD_MAX_LENGTH,
          },
          {
            label: '② それにどう向き合ったか',
            placeholder: 'その苦労に、どう向き合ったかを書いてみましょう。',
            maxLength: DESERT_FIELD_MAX_LENGTH,
          },
        ],
        plantedMessage: '頑張りましたね。\n砂漠に花が咲くのを待ちましょう。',
        emptyMessage: 'まだ種がありません。最初の種を植えてみませんか。',
        fruitVerb: '咲きました',
      }}
    />
  );
}
