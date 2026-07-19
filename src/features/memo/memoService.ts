import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MEMO_TEXT_MAX_LENGTH, type Memo, type MemoSource } from './memoTypes';

function memosCollection(uid: string, projectId: string) {
  return collection(db, 'users', uid, 'projects', projectId, 'memos');
}

function memoDoc(uid: string, projectId: string, memoId: string) {
  return doc(db, 'users', uid, 'projects', projectId, 'memos', memoId);
}

/** メモ本文のバリデーション。問題があればErrorを投げる */
function validateText(text: string): string {
  const trimmed = text.trim();
  if (trimmed === '') {
    throw new Error('メモ本文が空です');
  }
  if (trimmed.length > MEMO_TEXT_MAX_LENGTH) {
    throw new Error('メモ本文が長すぎます');
  }
  return trimmed;
}

/** プロジェクトのメモ一覧を作成日時の古い順(時系列)で取得する */
export async function listMemos(uid: string, projectId: string): Promise<Memo[]> {
  const result = await getDocs(memosCollection(uid, projectId));
  return result.docs
    .map((snapshot) => {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        text: typeof data.text === 'string' ? data.text : '',
        tags: Array.isArray(data.tags) ? data.tags.filter((tag) => typeof tag === 'string') : [],
        source: data.source === 'voice' ? ('voice' as const) : ('manual' as const),
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
        updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0,
      };
    })
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** メモを追加し、追加されたメモを返す */
export async function addMemo(
  uid: string,
  projectId: string,
  input: { text: string; tags?: string[]; source?: MemoSource },
): Promise<Memo> {
  const now = Date.now();
  const memo = {
    text: validateText(input.text),
    tags: input.tags ?? [],
    source: input.source ?? 'manual',
    createdAt: now,
    updatedAt: now,
  };
  const reference = await addDoc(memosCollection(uid, projectId), memo);
  return { id: reference.id, ...memo };
}

/** メモの本文・タグを更新する */
export async function updateMemo(
  uid: string,
  projectId: string,
  memoId: string,
  patch: { text?: string; tags?: string[] },
): Promise<void> {
  const data: Record<string, unknown> = { updatedAt: Date.now() };
  if (patch.text !== undefined) {
    data.text = validateText(patch.text);
  }
  if (patch.tags !== undefined) {
    data.tags = patch.tags;
  }
  await updateDoc(memoDoc(uid, projectId, memoId), data);
}

/** メモを削除する */
export async function deleteMemo(uid: string, projectId: string, memoId: string): Promise<void> {
  await deleteDoc(memoDoc(uid, projectId, memoId));
}
