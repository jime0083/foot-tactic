import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Googleドキュメント保存に使うスコープ。
 * 非機密のdrive.fileのみを要求する(このアプリが作成したファイルだけにアクセス可能)。
 * ドキュメント作成はDrive APIのHTML→Googleドキュメント変換で行うため、
 * 機密スコープ(documents)は不要。
 */
export const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

export type GoogleDocsAuthErrorKind = 'cancelled' | 'no-user' | 'failed';

export class GoogleDocsAuthError extends Error {
  readonly kind: GoogleDocsAuthErrorKind;

  constructor(kind: GoogleDocsAuthErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

/** アクセストークンの有効期限は約1時間。余裕をみて50分でキャッシュを破棄する */
const TOKEN_TTL_MS = 50 * 60 * 1000;

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export function clearCachedDriveToken(): void {
  cachedToken = null;
}

const CANCELLED_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

/**
 * Drive APIアクセス用のトークンを取得する。
 * 初回はGoogleの追加同意ポップアップ(インクリメンタル認可)が表示され、
 * 取得後はメモリ内にキャッシュして再利用する。
 */
export async function getDriveAccessToken(now = Date.now()): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }
  const user = auth.currentUser;
  if (!user) {
    throw new GoogleDocsAuthError('no-user', 'ログインしていません');
  }
  const provider = new GoogleAuthProvider();
  provider.addScope(DRIVE_FILE_SCOPE);

  let result;
  try {
    result = await reauthenticateWithPopup(user, provider);
  } catch (error) {
    const code = (error as { code?: string } | null)?.code ?? '';
    if (CANCELLED_CODES.has(code)) {
      throw new GoogleDocsAuthError('cancelled', '認可がキャンセルされました');
    }
    throw new GoogleDocsAuthError('failed', `Google認可に失敗しました: ${code}`);
  }

  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new GoogleDocsAuthError('failed', 'アクセストークンを取得できませんでした');
  }
  cachedToken = { token: credential.accessToken, expiresAt: now + TOKEN_TTL_MS };
  return credential.accessToken;
}
