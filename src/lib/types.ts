import type { Timestamp } from 'firebase/firestore';

import type { SeedKind } from '@/constants/catalog';

// Firestore のドキュメント形（SPEC.md「データモデル」）。id はドキュメントIDを足したもの。

export interface UserDoc {
  createdAt: Timestamp | null;
  blockedUids: string[];
  termsVersion: number;
}

export interface Seed {
  id: string;
  authorUid: string;
  kind: SeedKind;
  text: string;
  /** 砂漠の種だけ：苦労にどう向き合ったか。 */
  response?: string;
  createdAt: Timestamp | null;
  waterCount: number;
  /** 実った作物・花の数（カタログの id → 数）。この項目ができる前に実った分は入っていない。 */
  crops?: Record<string, number>;
  reportCount: number;
  hidden: boolean;
}

export interface Watering {
  id: string;
  seedId: string;
  seedAuthorUid: string;
  waterUid: string;
  kind: SeedKind;
  cropId: string;
  createdAt: Timestamp | null;
}

export interface Post {
  id: string;
  authorUid: string;
  text: string;
  createdAt: Timestamp | null;
  expiresAt: Timestamp;
  giftCount: number;
  reportCount: number;
  hidden: boolean;
}

export interface Gift {
  id: string;
  postId: string;
  fromUid: string;
  toUid: string;
  itemId: string;
  createdAt: Timestamp | null;
}

export type ReportTargetType = 'seed' | 'post';
