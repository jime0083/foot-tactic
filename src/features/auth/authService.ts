import { GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ensureUserDocument } from './userDocument';

/** ユーザーが自分でポップアップを閉じた場合のFirebaseエラーコード */
const CANCELLED_ERROR_CODES = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
]);

export function isPopupCancelledError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    CANCELLED_ERROR_CODES.has((error as { code: string }).code)
  );
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  try {
    await ensureUserDocument(credential.user);
  } catch (error) {
    // ユーザードキュメント作成に失敗してもログイン自体は成立させる
    // (次回ログイン時に再試行される)
    console.error('ユーザードキュメントの作成に失敗しました', error);
  }
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
