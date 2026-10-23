import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Composer } from '@/components/composer';
import {
  BodyText,
  Card,
  FacilityHeader,
  MutedText,
  ParchmentModal,
  PillButton,
  SerifText,
} from '@/components/ui';
import { REPORT_HIDE_THRESHOLD, SEED_MAX_LENGTH } from '@/constants/app-config';
import type { CatalogItem, SeedKind } from '@/constants/catalog';
import { alpha, Colors, Radius, Spacing } from '@/constants/theme';
import { useContentMenu } from '@/hooks/use-content-menu';
import type { Seed } from '@/lib/types';
import { deleteSeed, plantSeed, subscribeSeeds, waterSeed } from '@/lib/village';
import { useBasket } from '@/providers/basket-provider';
import { useSession, useUid } from '@/providers/session-provider';

export interface SeedBoardCopy {
  title: string;
  description: string;
  icon: number;
  placeholder: string;
  plantedMessage: string;
  emptyMessage: string;
  /** 実るものの呼び名（野菜・花）。 */
  fruitWord: string;
  /** 「実りました」「咲きました」 */
  fruitVerb: string;
}

/** 農園と砂漠は「苦労／挑戦の種」と「実るもの」が違うだけなので、同じ画面を使い回す。 */
export function SeedBoard({ kind, copy }: { kind: SeedKind; copy: SeedBoardCopy }) {
  const uid = useUid();
  const { blockedUids } = useSession();
  const { wateredSeedIds } = useBasket();
  const openMenu = useContentMenu();

  const [seeds, setSeeds] = useState<Seed[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [showPlanted, setShowPlanted] = useState(false);
  const [harvest, setHarvest] = useState<{ item: CatalogItem; own: boolean } | null>(null);
  const [wateringId, setWateringId] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeSeeds(
        kind,
        (next) => {
          setSeeds(next);
          setLoadError(false);
        },
        (error) => {
          console.warn(error);
          setLoadError(true);
        },
      ),
    [kind],
  );

  const visibleSeeds = (seeds ?? []).filter(
    (seed) => seed.reportCount < REPORT_HIDE_THRESHOLD && !blockedUids.has(seed.authorUid),
  );

  async function handleWater(seed: Seed) {
    setWateringId(seed.id);
    try {
      const item = await waterSeed(uid, seed);
      setHarvest({ item, own: seed.authorUid === uid });
    } catch (e) {
      console.warn(e);
      Alert.alert('水やりできませんでした', 'もう一度お試しください。');
    } finally {
      setWateringId(null);
    }
  }

  function confirmDelete(seed: Seed) {
    Alert.alert('この種を削除しますか？', 'これまでに実ったものは、みんなの手持ちに残ります。', [
      { text: 'やめる', style: 'cancel' },
      {
        text: '削除する',
        style: 'destructive',
        onPress: () => deleteSeed(seed.id).catch((e) => console.warn(e)),
      },
    ]);
  }

  return (
    <>
      <FlatList
        data={visibleSeeds}
        keyExtractor={(seed) => seed.id}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        style={styles.list}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
        ListHeaderComponent={
          <>
            <FacilityHeader title={copy.title} description={copy.description} icon={copy.icon} />
            <Composer
              placeholder={copy.placeholder}
              submitLabel="種を植える"
              pendingLabel="植えています…"
              maxLength={SEED_MAX_LENGTH}
              variant="leaf"
              onSubmit={async (text) => {
                await plantSeed(uid, kind, text);
                setShowPlanted(true);
              }}
            />
            {loadError ? (
              <MutedText style={styles.empty}>
                種を読み込めませんでした。通信状態を確かめてください。
              </MutedText>
            ) : null}
          </>
        }
        ListEmptyComponent={
          seeds && !loadError ? <MutedText style={styles.empty}>{copy.emptyMessage}</MutedText> : undefined
        }
        renderItem={({ item: seed }) => {
          const isOwn = seed.authorUid === uid;
          const watered = wateredSeedIds.has(seed.id);
          return (
            <Card>
              <View style={styles.cardHeader}>
                <Text style={styles.seedMark}>{isOwn ? 'あなたの種' : '村人の種'}</Text>
                <Pressable
                  hitSlop={12}
                  accessibilityLabel={isOwn ? 'この種の操作' : '通報・ブロック'}
                  onPress={() =>
                    isOwn ? confirmDelete(seed) : openMenu('seed', seed.id, seed.authorUid)
                  }>
                  <Text style={styles.menu}>…</Text>
                </Pressable>
              </View>
              <BodyText>{seed.text}</BodyText>
              <View style={styles.cardFooter}>
                <MutedText>
                  💧 {seed.waterCount}
                  {seed.waterCount > 0 ? `　${copy.fruitWord}が${seed.waterCount}回${copy.fruitVerb}` : ''}
                </MutedText>
                {watered ? (
                  <MutedText style={styles.watered}>水やりしました</MutedText>
                ) : (
                  <PillButton
                    small
                    variant="outline"
                    label="水やりする"
                    loading={wateringId === seed.id}
                    disabled={wateringId !== null}
                    onPress={() => handleWater(seed)}
                  />
                )}
              </View>
            </Card>
          );
        }}
      />

      <ParchmentModal visible={showPlanted} onClose={() => setShowPlanted(false)}>
        <BodyText style={styles.modalText}>{copy.plantedMessage}</BodyText>
      </ParchmentModal>

      <ParchmentModal visible={harvest !== null} onClose={() => setHarvest(null)}>
        {harvest ? (
          <>
            <Text style={styles.harvestEmoji}>{harvest.item.emoji}</Text>
            <SerifText style={styles.harvestTitle}>
              {harvest.item.name}が{copy.fruitVerb}
            </SerifText>
            <BodyText style={styles.modalText}>
              {harvest.own
                ? `あなたの手持ちに${harvest.item.name}が1つ届きました。`
                : `種を植えた村人とあなたに、${harvest.item.name}が1つずつ届きました。`}
              {'\n'}焚き火で、だれかに贈ることもできます。
            </BodyText>
          </>
        ) : null}
      </ParchmentModal>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  seedMark: {
    fontSize: 12,
    color: Colors.leaf,
    backgroundColor: alpha(Colors.leaf, 0.1),
    borderRadius: Radius.pill,
    overflow: 'hidden',
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
  },
  menu: {
    fontSize: 18,
    color: alpha(Colors.ink, 0.45),
    paddingHorizontal: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  watered: {
    fontSize: 12,
    color: alpha(Colors.ink, 0.45),
  },
  modalText: {
    textAlign: 'center',
  },
  harvestEmoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  harvestTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
