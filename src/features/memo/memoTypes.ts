/** メモの入力元 */
export type MemoSource = 'manual' | 'voice';

/** 戦術ボード下部のメモ1件(プロジェクト単位で保持) */
export interface Memo {
  id: string;
  text: string;
  /** ユーザーが任意に付ける見出しタグ(例: フォーメーション、決定機シーン) */
  tags: string[];
  source: MemoSource;
  /** 作成日時(ミリ秒) */
  createdAt: number;
  /** 更新日時(ミリ秒) */
  updatedAt: number;
}

/** メモ本文の最大文字数 */
export const MEMO_TEXT_MAX_LENGTH = 2000;

/** タグの最大文字数 */
export const MEMO_TAG_MAX_LENGTH = 20;
