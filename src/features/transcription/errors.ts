/** 文字起こしエラーの分類 */
export type TranscriptionErrorKind =
  /** APIキーが無効・未認証 */
  | 'auth'
  /** レート制限・無料枠(クォータ)超過 */
  | 'quota'
  /** ネットワークエラー */
  | 'network'
  /** その他のAPIエラー */
  | 'other';

export class TranscriptionError extends Error {
  readonly kind: TranscriptionErrorKind;

  constructor(kind: TranscriptionErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

/** HTTPステータスコードからエラー種別を判定する */
export function kindFromStatus(status: number): TranscriptionErrorKind {
  if (status === 401 || status === 403) {
    return 'auth';
  }
  if (status === 429) {
    return 'quota';
  }
  return 'other';
}
