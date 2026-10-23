import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Composer } from '@/components/composer';
import { Flame } from '@/components/flame';
import { GiftPicker } from '@/components/gift-picker';
import { BodyText, Card, FacilityHeader, MutedText, PillButton } from '@/components/ui';
import { POST_LIFETIME_MS, POST_MAX_LENGTH, REPORT_HIDE_THRESHOLD } from '@/constants/app-config';
import { getItem } from '@/constants/catalog';
import { alpha, Colors, Radius, Spacing } from '@/constants/theme';
import { useContentMenu } from '@/hooks/use-content-menu';
import type { Post } from '@/lib/types';
import { createPost, deletePost, subscribeBurningPosts } from '@/lib/village';
import { useBasket } from '@/providers/basket-provider';
import { useSession, useUid } from '@/providers/session-provider';

function remainingLabel(ms: number) {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours >= 1) return `あと${hours}時間ほどで燃え尽きます`;
  const minutes = Math.max(1, Math.ceil(ms / (60 * 1000)));
  return `あと${minutes}分ほどで燃え尽きます`;
}

/** 1分ごとに時計を進め、炎の大きさと燃え尽きを画面に反映する。 */
function useNow(intervalMs = 60 * 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

export function BonfireBoard() {
  const uid = useUid();
  const { blockedUids } = useSession();
  const { receivedGifts } = useBasket();
  const openMenu = useContentMenu();
  const now = useNow();

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [giftTarget, setGiftTarget] = useState<Post | null>(null);

  useEffect(
    () =>
      subscribeBurningPosts(
        (next) => {
          setPosts(next);
          setLoadError(false);
        },
        (error) => {
          console.warn(error);
          setLoadError(true);
        },
      ),
    [],
  );

  const visiblePosts = (posts ?? []).filter(
    (post) =>
      post.expiresAt.toMillis() > now &&
      post.reportCount < REPORT_HIDE_THRESHOLD &&
      !blockedUids.has(post.authorUid),
  );

  function giftsFor(postId: string) {
    const grouped = new Map<string, number>();
    receivedGifts
      .filter((gift) => gift.postId === postId)
      .forEach((gift) => grouped.set(gift.itemId, (grouped.get(gift.itemId) ?? 0) + 1));
    return [...grouped.entries()].map(([itemId, count]) => ({ item: getItem(itemId), count }));
  }

  function confirmDelete(post: Post) {
    Alert.alert('このひとことを火から下ろしますか？', '受け取った贈り物は手持ちに残ります。', [
      { text: 'やめる', style: 'cancel' },
      {
        text: '下ろす',
        style: 'destructive',
        onPress: () => deletePost(post.id).catch((e) => console.warn(e)),
      },
    ]);
  }

  return (
    <>
      <FlatList
        data={visiblePosts}
        keyExtractor={(post) => post.id}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        style={styles.list}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
        ListHeaderComponent={
          <>
            <FacilityHeader
              title="焚き火"
              icon={require('@/assets/images/facilities/bonfire.png')}
              description="焚き火を囲みながら、吃音にまつわる日々の気持ちや出来事を、ポツリポツリとくべてみませんか。くべたひとことは24時間で燃え尽きます。農園や砂漠で実った野菜や花を、だれかのひとことに贈ることもできます。"
            />
            <Composer
              placeholder="思ったことを、焚き火にくべてみましょう。"
              submitLabel="焚き火にくべる"
              pendingLabel="くべています…"
              maxLength={POST_MAX_LENGTH}
              variant="ember"
              onSubmit={(text) => createPost(uid, text)}
            />
            {loadError ? (
              <MutedText style={styles.empty}>
                焚き火を読み込めませんでした。通信状態を確かめてください。
              </MutedText>
            ) : null}
          </>
        }
        ListEmptyComponent={
          posts && !loadError ? (
            <MutedText style={styles.empty}>
              いまは静かな焚き火です。最初のひとことをくべてみませんか。
            </MutedText>
          ) : undefined
        }
        renderItem={({ item: post }) => {
          const isOwn = post.authorUid === uid;
          const remainingMs = post.expiresAt.toMillis() - now;
          const gifts = isOwn ? giftsFor(post.id) : [];
          return (
            <Card style={styles.card}>
              <Flame remaining={remainingMs / POST_LIFETIME_MS} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <MutedText style={styles.remaining}>
                    {isOwn ? 'あなたのひとこと・' : ''}
                    {remainingLabel(remainingMs)}
                  </MutedText>
                  <Pressable
                    hitSlop={12}
                    accessibilityLabel={isOwn ? 'このひとことの操作' : '通報・ブロック'}
                    onPress={() =>
                      isOwn ? confirmDelete(post) : openMenu('post', post.id, post.authorUid)
                    }>
                    <Text style={styles.menu}>…</Text>
                  </Pressable>
                </View>
                <BodyText>{post.text}</BodyText>

                {gifts.length > 0 ? (
                  <View style={styles.gifts}>
                    {gifts.map(({ item, count }) => (
                      <Text key={item.id} style={styles.giftChip}>
                        {item.emoji} {item.name}
                        {count > 1 ? ` ×${count}` : ''}
                      </Text>
                    ))}
                  </View>
                ) : null}

                {isOwn ? null : (
                  <View style={styles.cardFooter}>
                    {post.giftCount > 0 ? (
                      <MutedText style={styles.giftCount}>🎁 {post.giftCount}</MutedText>
                    ) : (
                      <View />
                    )}
                    <PillButton
                      small
                      variant="outline"
                      label="＋贈る"
                      onPress={() => setGiftTarget(post)}
                    />
                  </View>
                )}
              </View>
            </Card>
          );
        }}
      />
      <GiftPicker post={giftTarget} onClose={() => setGiftTarget(null)} />
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
  card: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  remaining: {
    fontSize: 11,
    color: alpha(Colors.ember, 0.85),
  },
  menu: {
    fontSize: 18,
    color: alpha(Colors.ink, 0.45),
    paddingHorizontal: Spacing.xs,
  },
  gifts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  giftChip: {
    fontSize: 12,
    color: Colors.leaf,
    backgroundColor: alpha(Colors.leaf, 0.1),
    borderRadius: Radius.pill,
    overflow: 'hidden',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  giftCount: {
    fontSize: 12,
  },
});
