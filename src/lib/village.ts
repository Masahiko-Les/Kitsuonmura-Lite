import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';

import { pickRandomItem, type CatalogItem, type SeedKind } from '@/constants/catalog';
import { POST_LIFETIME_MS, TERMS_VERSION } from '@/constants/app-config';
import { db } from '@/lib/firebase';
import type { Gift, Post, ReportTargetType, Seed, Watering } from '@/lib/types';

// Firestore への読み書きをここに集める。書き込みの可否は firestore.rules が最終判断する。

function toList<T>(snapshot: QuerySnapshot<DocumentData>): T[] {
  // serverTimestamp() がまだ確定していない自分の書き込みも、推定時刻で並べられるようにする。
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as T,
  );
}

// ---- 村人 ----

export async function registerVillager(uid: string) {
  await setDoc(doc(db, 'users', uid), {
    createdAt: serverTimestamp(),
    blockedUids: [],
    termsVersion: TERMS_VERSION,
  });
}

export async function acceptTerms(uid: string) {
  await updateDoc(doc(db, 'users', uid), { termsVersion: TERMS_VERSION });
}

export async function blockVillager(myUid: string, targetUid: string) {
  await updateDoc(doc(db, 'users', myUid), { blockedUids: arrayUnion(targetUid) });
}

export async function unblockVillager(myUid: string, targetUid: string) {
  await updateDoc(doc(db, 'users', myUid), { blockedUids: arrayRemove(targetUid) });
}

// ---- 種（農園・砂漠） ----

export function subscribeSeeds(
  kind: SeedKind,
  onChange: (seeds: Seed[]) => void,
  onError: (error: Error) => void,
) {
  const q = query(
    collection(db, 'seeds'),
    where('kind', '==', kind),
    where('hidden', '==', false),
    orderBy('createdAt', 'desc'),
    limit(200),
  );
  return onSnapshot(q, (snapshot) => onChange(toList<Seed>(snapshot)), onError);
}

export async function plantSeed(uid: string, kind: SeedKind, text: string) {
  const batch = writeBatch(db);
  batch.set(doc(collection(db, 'seeds')), {
    authorUid: uid,
    kind,
    text,
    createdAt: serverTimestamp(),
    waterCount: 0,
    reportCount: 0,
    hidden: false,
  });
  await batch.commit();
}

/**
 * 水やり。1人1回はドキュメントID（seedId_uid）で保証する。
 * 水やり1回ですぐ実り、実ったものは waterings の記録から両者の手持ちとして数えられる。
 */
export async function waterSeed(uid: string, seed: Seed): Promise<CatalogItem> {
  const crop = pickRandomItem(seed.kind);
  const batch = writeBatch(db);
  batch.set(doc(db, 'waterings', `${seed.id}_${uid}`), {
    seedId: seed.id,
    seedAuthorUid: seed.authorUid,
    waterUid: uid,
    kind: seed.kind,
    cropId: crop.id,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, 'seeds', seed.id), { waterCount: increment(1) });
  await batch.commit();
  return crop;
}

export async function deleteSeed(seedId: string) {
  await deleteDoc(doc(db, 'seeds', seedId));
}

// ---- 焚き火 ----

export function subscribeBurningPosts(
  onChange: (posts: Post[]) => void,
  onError: (error: Error) => void,
) {
  // 燃え尽きた投稿は読み込まない。購読中に燃え尽きたものは画面側で時刻を見て外す。
  const q = query(
    collection(db, 'posts'),
    where('hidden', '==', false),
    where('expiresAt', '>', Timestamp.now()),
    orderBy('expiresAt', 'desc'),
    limit(200),
  );
  return onSnapshot(q, (snapshot) => onChange(toList<Post>(snapshot)), onError);
}

export async function createPost(uid: string, text: string) {
  const batch = writeBatch(db);
  batch.set(doc(collection(db, 'posts')), {
    authorUid: uid,
    text,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + POST_LIFETIME_MS),
    giftCount: 0,
    reportCount: 0,
    hidden: false,
  });
  await batch.commit();
}

export async function deletePost(postId: string) {
  await deleteDoc(doc(db, 'posts', postId));
}

/** 無料プランの間は TTL が使えないので、アプリを開いた時に自分の燃え尽きた投稿を片付ける。 */
export async function cleanUpMyExpiredPosts(uid: string) {
  const snapshot = await getDocs(query(collection(db, 'posts'), where('authorUid', '==', uid)));
  const now = Date.now();
  const expired = snapshot.docs.filter(
    (d) => (d.data().expiresAt as Timestamp).toMillis() <= now,
  );
  await Promise.all(expired.map((d) => deleteDoc(d.ref)));
}

export async function sendGift(uid: string, post: Post, itemId: string) {
  const batch = writeBatch(db);
  batch.set(doc(collection(db, 'gifts')), {
    postId: post.id,
    fromUid: uid,
    toUid: post.authorUid,
    itemId,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, 'posts', post.id), { giftCount: increment(1) });
  await batch.commit();
}

// ---- 手持ちの計算に使う記録 ----

export function subscribeWateringsBy(
  field: 'seedAuthorUid' | 'waterUid',
  uid: string,
  onChange: (waterings: Watering[]) => void,
  onError: (error: Error) => void,
) {
  const q = query(collection(db, 'waterings'), where(field, '==', uid));
  return onSnapshot(q, (snapshot) => onChange(toList<Watering>(snapshot)), onError);
}

export function subscribeGiftsBy(
  field: 'fromUid' | 'toUid',
  uid: string,
  onChange: (gifts: Gift[]) => void,
  onError: (error: Error) => void,
) {
  const q = query(collection(db, 'gifts'), where(field, '==', uid));
  return onSnapshot(q, (snapshot) => onChange(toList<Gift>(snapshot)), onError);
}

// ---- 通報 ----

export const REPORT_REASONS = [
  '村人を傷つける内容',
  '個人情報・連絡先が書かれている',
  '宣伝・勧誘',
  'その他',
] as const;

/** 同じ対象への通報は1人1回まで（ドキュメントIDで保証）。 */
export async function report(
  uid: string,
  targetType: ReportTargetType,
  targetId: string,
  reason: string,
) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'reports', `${targetType}_${targetId}_${uid}`), {
    targetType,
    targetId,
    reporterUid: uid,
    reason,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, targetType === 'seed' ? 'seeds' : 'posts', targetId), {
    reportCount: increment(1),
  });
  await batch.commit();
}

// ---- 退会 ----

/** その人の種・焚き火の投稿・アカウントを消す。水やりと贈り物の記録は相手の手持ちのために残す。 */
export async function deleteVillagerData(uid: string) {
  const [seeds, posts] = await Promise.all([
    getDocs(query(collection(db, 'seeds'), where('authorUid', '==', uid))),
    getDocs(query(collection(db, 'posts'), where('authorUid', '==', uid))),
  ]);
  const refs = [...seeds.docs, ...posts.docs].map((d) => d.ref);
  // 1つのバッチは500件まで。
  for (let i = 0; i < refs.length; i += 450) {
    const batch = writeBatch(db);
    refs.slice(i, i + 450).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  await deleteDoc(doc(db, 'users', uid));
}
