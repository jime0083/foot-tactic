import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserSettings {
  language: 'ja' | 'en';
  aiProvider: 'openai' | 'gemini';
}

export interface UserPlan {
  type: 'free';
  trialEndsAt: null;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  language: 'ja',
  aiProvider: 'gemini',
};

export const DEFAULT_USER_PLAN: UserPlan = {
  type: 'free',
  trialEndsAt: null,
};

/** 初回ログイン時にusers/{uid}ドキュメントを作成する(既存の場合は何もしない) */
export async function ensureUserDocument(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    return;
  }
  await setDoc(userRef, {
    displayName: user.displayName ?? '',
    email: user.email ?? '',
    settings: DEFAULT_USER_SETTINGS,
    plan: DEFAULT_USER_PLAN,
    createdAt: serverTimestamp(),
  });
}
