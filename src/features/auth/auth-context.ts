import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface AuthState {
  /** ログイン中のユーザー。未ログインの場合はnull */
  user: User | null;
  /** 認証状態の初期判定が完了していない間はtrue */
  loading: boolean;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
