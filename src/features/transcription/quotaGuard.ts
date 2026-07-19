/**
 * API無料枠(クォータ)超過のブロック管理(要件VOICE-9)。
 * 超過を検知したらブロック状態をlocalStorageに保持し、
 * ユーザーが手動で再有効化するまでAPI呼び出しを止める。
 * (クォータは日次リセットされるため、翌日以降の再有効化を想定)
 */

export const QUOTA_BLOCK_STORAGE_KEY = 'foot-tactic:quota-block';

/** クォータ超過でブロック中かどうか */
export function isQuotaBlocked(): boolean {
  return getQuotaBlockedAt() !== null;
}

/** ブロックされた日時(ミリ秒)。未ブロックならnull */
export function getQuotaBlockedAt(): number | null {
  try {
    const raw = localStorage.getItem(QUOTA_BLOCK_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { blockedAt?: unknown };
    return typeof parsed.blockedAt === 'number' ? parsed.blockedAt : null;
  } catch {
    return null;
  }
}

/** クォータ超過を記録してブロックする */
export function setQuotaBlocked(): void {
  try {
    localStorage.setItem(QUOTA_BLOCK_STORAGE_KEY, JSON.stringify({ blockedAt: Date.now() }));
  } catch {
    // localStorageが使用できない場合はセッション中のみのブロックになる
  }
}

/** ブロックを手動で解除する */
export function clearQuotaBlock(): void {
  try {
    localStorage.removeItem(QUOTA_BLOCK_STORAGE_KEY);
  } catch {
    // 解除失敗は無視する
  }
}
