import { SeedBoard } from '@/components/seed-board';
import { SEED_MAX_LENGTH } from '@/constants/app-config';

export default function FarmScreen() {
  return (
    <SeedBoard
      kind="farm"
      copy={{
        title: '農園',
        icon: require('@/assets/images/facilities/garden.png'),
        description:
          '吃音の苦労を「種」として植える農園です。村人が水やりをすると、作物が育ち、お互いに収穫物が得られます。収穫した野菜は、村人たちにあげることもできます。',
        fields: [{ placeholder: '吃音の苦労を、種として植えてみましょう。', maxLength: SEED_MAX_LENGTH }],
        plantedMessage: 'いい苦労をしましたね。\nみんなで水やりして育てましょう。',
        emptyMessage: 'まだ種が植えられていません。最初の種を植えてみませんか。',
        fruitVerb: '実りました',
      }}
    />
  );
}
