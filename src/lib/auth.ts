import { deleteUser, signInAnonymously } from 'firebase/auth';

import { auth } from '@/lib/firebase';
import { deleteVillagerData } from '@/lib/village';

/**
 * 匿名で村に入る。名前・メールアドレス・パスワードは何も受け取らない。
 * 匿名アカウントは端末に結びつくため、サインアウトやアプリの削除をすると同じ村人には戻れない。
 * そのためアプリにはサインアウトを置かず、やめる時は「アカウント削除」だけにしている。
 */
export async function enterVillage() {
  await signInAnonymously(auth);
}

/** 退会。その人の種・焚き火の投稿・users を消してから、アカウントを削除する。 */
export async function deleteAccount() {
  const user = auth.currentUser;
  if (!user) return;
  // users/{uid} を消すと画面が村人登録に切り替わるので、データ削除とアカウント削除は続けて行う。
  await deleteVillagerData(user.uid);
  await deleteUser(user);
}
