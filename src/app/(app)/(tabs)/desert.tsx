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
          '砂漠は吃音村の生きづらさを象徴する場所です。吃音で苦労したこと、それにどう向き合ったかを「種」として蒔いて、みんなで応援の水やりをして、吃音村に花を咲かせていきましょう。',
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
