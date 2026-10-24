import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Composer, type ComposerField } from '@/components/composer';
import {
  BodyText,
  Card,
  FacilityHeader,
  MutedText,
  ParchmentModal,
  PillButton,
  SerifText,
} from '@/components/ui';
import { REPORT_HIDE_THRESHOLD } from '@/constants/app-config';
import { ALL_ITEMS, type CatalogItem, type SeedKind } from '@/constants/catalog';
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
  /**
   * 種を植える欄。1つ目が本文（text）、2つ目があれば「どう向き合ったか」（response）。
   * 2つ以上ある時は、種のカードにも各欄の見出しを出す。
   */
  fields: ComposerField[];
  plantedMessage: string;
  emptyMessage: string;
  /** 「実りました」「咲きました」 */
  fruitVerb: string;
}

/**
 * 種のカードの実り。まだ水やりがなければ「💧 0」、実ったら「🥔 1　🍅 2」のように種類ごとに出す。
 * crops を数え始める前に実った分は何が実ったか分からないので、数えない。
 * 何が実ったか1つも分からない古い種だけは、空にならないよう「💧」で回数を出す。
 */
function harvestLabel(seed: Seed) {
  const crops = seed.crops ?? {};
  const parts = ALL_ITEMS.filter((item) => (crops[item.id] ?? 0) > 0).map(
    (item) => `${item.emoji} ${crops[item.id]}`,
  );
  return parts.length > 0 ? parts.join('　') : `💧 ${seed.waterCount}`;
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
              fields={copy.fields}
              submitLabel="種を植える"
              pendingLabel="植えています…"
              variant="leaf"
              onSubmit={async ([text, response]) => {
                await plantSeed(uid, kind, text, response);
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
              {copy.fields.length > 1 ? (
                <View style={styles.parts}>
                  {[seed.text, seed.response].map((part, i) =>
                    part ? (
                      <View key={i}>
                        <SerifText style={styles.partLabel}>{copy.fields[i]?.label}</SerifText>
                        <BodyText>{part}</BodyText>
                      </View>
                    ) : null,
                  )}
                </View>
              ) : (
                <BodyText>{seed.text}</BodyText>
              )}
              <View style={styles.cardFooter}>
                <MutedText style={styles.harvest}>{harvestLabel(seed)}</MutedText>
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
  parts: {
    gap: Spacing.md,
  },
  partLabel: {
    fontSize: 13,
    color: alpha(Colors.ink, 0.7),
    marginBottom: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  harvest: {
    flexShrink: 1,
    fontSize: 15,
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
