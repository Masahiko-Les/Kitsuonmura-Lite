import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { TERMS_VERSION } from '@/constants/app-config';
import { auth, db } from '@/lib/firebase';
import type { UserDoc } from '@/lib/types';

type SessionStatus =
  | 'loading'
  | 'signed-out'
  /** サインイン済みで、村人登録（規約への同意）がまだ。規約が改定された時もここに戻る。 */
  | 'needs-registration'
  | 'ready';

interface Session {
  status: SessionStatus;
  user: User | null;
  userDoc: UserDoc | null;
  blockedUids: Set<string>;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  // どの村人の users ドキュメントかも一緒に持ち、サインインし直した直後に前の人のものを使わないようにする。
  const [loadedUserDoc, setLoadedUserDoc] = useState<{ uid: string; data: UserDoc | null } | null>(
    null,
  );

  useEffect(
    () =>
      onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
        setAuthReady(true);
      }),
    [],
  );

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    return onSnapshot(
      doc(db, 'users', uid),
      (snapshot) =>
        setLoadedUserDoc({ uid, data: snapshot.exists() ? (snapshot.data() as UserDoc) : null }),
      (error) => {
        // 退会直後などに権限エラーになることがある。登録前と同じ扱いにする。
        console.warn(error);
        setLoadedUserDoc({ uid, data: null });
      },
    );
  }, [user]);

  const userDoc = user && loadedUserDoc?.uid === user.uid ? loadedUserDoc.data : null;

  let status: SessionStatus;
  if (!authReady) status = 'loading';
  else if (!user) status = 'signed-out';
  else if (loadedUserDoc?.uid !== user.uid) status = 'loading';
  else if (!userDoc || (userDoc.termsVersion ?? 0) < TERMS_VERSION) status = 'needs-registration';
  else status = 'ready';

  const session: Session = {
    status,
    user,
    userDoc,
    blockedUids: new Set(userDoc?.blockedUids ?? []),
  };

  return <SessionContext value={session}>{children}</SessionContext>;
}

export function useSession() {
  const session = use(SessionContext);
  if (!session) throw new Error('useSession must be used inside SessionProvider');
  return session;
}

/** サインイン済みの画面でだけ使う。 */
export function useUid() {
  const { user } = useSession();
  if (!user) throw new Error('useUid must be used while signed in');
  return user.uid;
}
