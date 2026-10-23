import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CenteredLoading, Card, MutedText, SerifText } from '@/components/ui';
import { getItem } from '@/constants/catalog';
import { alpha, Colors, Spacing } from '@/constants/theme';
import { useBasket } from '@/providers/basket-provider';

function formatDate(millis: number) {
  const date = new Date(millis);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

/** 手持ちの野菜・花と、焚き火で受け取った贈り物の一覧。燃え尽きた後も残る。 */
export default function BasketScreen() {
  const { loading, entries, receivedGifts } = useBasket();
  if (loading) return <CenteredLoading />;

  const crops = entries.filter((entry) => entry.item.kind === 'farm');
  const flowers = entries.filter((entry) => entry.item.kind === 'desert');
  const gifts = [...receivedGifts].sort(
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0),
  );

  return (
    <ScrollView
      style={{ backgroundColor: Colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      <Section title="野菜" emptyText="農園で水やりすると、野菜が届きます。">
        {crops.map(({ item, count }) => (
          <ItemTile key={item.id} emoji={item.emoji} name={item.name} count={count} />
        ))}
      </Section>

      <Section title="花" emptyText="砂漠で水やりすると、花が届きます。">
        {flowers.map(({ item, count }) => (
          <ItemTile key={item.id} emoji={item.emoji} name={item.name} count={count} />
        ))}
      </Section>

      <View style={{ gap: Spacing.md }}>
        <SerifText style={styles.heading}>焚き火で受け取った贈り物</SerifText>
        {gifts.length === 0 ? (
          <MutedText>まだ届いていません。焚き火にひとことをくべてみませんか。</MutedText>
        ) : (
          <Card style={{ gap: Spacing.sm }}>
            {gifts.map((gift) => {
              const item = getItem(gift.itemId);
              return (
                <View key={gift.id} style={styles.giftRow}>
                  <Text style={styles.giftText}>
                    {item.emoji} {item.name}が届きました
                  </Text>
                  {gift.createdAt ? (
                    <MutedText style={{ fontSize: 12 }}>
                      {formatDate(gift.createdAt.toMillis())}
                    </MutedText>
                  ) : null}
                </View>
              );
            })}
          </Card>
        )}
        <MutedText style={{ fontSize: 12 }}>
          受け取った贈り物も手持ちに加わります。もう一度、だれかに贈ることもできます。
        </MutedText>
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode[];
}) {
  return (
    <View style={{ gap: Spacing.md }}>
      <SerifText style={styles.heading}>{title}</SerifText>
      {children.length === 0 ? (
        <MutedText>{emptyText}</MutedText>
      ) : (
        <View style={styles.grid}>{children}</View>
      )}
    </View>
  );
}

function ItemTile({ emoji, name, count }: { emoji: string; name: string; count: number }) {
  return (
    <View style={styles.tile} accessibilityLabel={`${name} ${count}個`}>
      <Text style={styles.tileEmoji}>{emoji}</Text>
      <Text style={styles.tileName}>{name}</Text>
      <Text style={styles.tileCount}>×{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
    gap: Spacing.xxl,
  },
  heading: {
    fontSize: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  tile: {
    width: 96,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.paper,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
  },
  tileEmoji: {
    fontSize: 34,
  },
  tileName: {
    fontSize: 12,
    color: Colors.ink,
    marginTop: Spacing.xs,
  },
  tileCount: {
    fontSize: 13,
    fontWeight: '600',
    color: alpha(Colors.ink, 0.7),
  },
  giftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  giftText: {
    fontSize: 14,
    color: Colors.ink,
  },
});
