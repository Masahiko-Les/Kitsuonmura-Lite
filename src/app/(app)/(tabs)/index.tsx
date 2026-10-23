import { SeedBoard } from '@/components/seed-board';

export default function FarmScreen() {
  return (
    <SeedBoard
      kind="farm"
      copy={{
        title: '農園',
        icon: require('@/assets/images/facilities/garden.png'),
        description:
          '吃音の苦労を、ひとことの種として植える村の農園です。村人が水やりすると、その場で野菜が実り、植えた人と水やりした人の両方に届きます。種は消えずに、水やりのたびに何度でも実ります。',
        placeholder: '吃音の苦労を、種として植えてみましょう。',
        plantedMessage: 'いい苦労をしましたね。\nみんなで水やりして育てましょう。',
        emptyMessage: 'まだ種が植えられていません。最初の種を植えてみませんか。',
        fruitWord: '野菜',
        fruitVerb: '実りました',
      }}
    />
  );
}
