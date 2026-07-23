import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type AccountErrorKind = 'no-user' | 'cancelled' | 'failed';

export class AccountError extends Error {
  readonly kind: AccountErrorKind;

  constructor(kind: AccountErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

const CANCELLED_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

/**
 * ユーザーのFirestoreデータ(projects配下のmemosを含む)を削除する。
 * クライアントからはサブコレクションが自動削除されないため、
 * memos → projects → ユーザードキュメントの順に個別削除する。
 */
export async function deleteUserData(uid: string): Promise<void> {
  const projectsSnapshot = await getDocs(collection(db, 'users', uid, 'projects'));
  for (const projectDoc of projectsSnapshot.docs) {
    const memosSnapshot = await getDocs(
      collection(db, 'users', uid, 'projects', projectDoc.id, 'memos'),
    );
    await Promise.all(memosSnapshot.docs.map((memoDoc) => deleteDoc(memoDoc.ref)));
    await deleteDoc(projectDoc.ref);
  }
  await deleteDoc(doc(db, 'users', uid));
}

/**
 * アカウントを削除(退会)する。
 * 破壊的操作のため先に再認証を行い(recent loginを保証)、
 * その後Firestoreデータ→Firebase Authユーザーの順に削除する。
 */
export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new AccountError('no-user', 'ログインしていません');
  }

  const provider = new GoogleAuthProvider();
  try {
    await reauthenticateWithPopup(user, provider);
  } catch (error) {
    const code = (error as { code?: string } | null)?.code ?? '';
    if (CANCELLED_CODES.has(code)) {
      throw new AccountError('cancelled', '再認証がキャンセルされました');
    }
    throw new AccountError('failed', `再認証に失敗しました: ${code}`);
  }

  await deleteUserData(user.uid);
  await user.delete();
}
