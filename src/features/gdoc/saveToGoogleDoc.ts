import { listMemos } from '@/features/memo/memoService';
import { captureAllScenesPng } from './captureScenes';
import { buildDocHtml } from './docHtml';
import { createGoogleDocFromHtml, type CreatedDoc } from './driveUpload';
import { getDriveAccessToken } from './googleAuth';

export interface SaveDocLabels {
  /** シーン見出し(例: n → "シーン n") */
  sceneHeading: (sceneNumber: number) => string;
  memoSectionHeading: string;
  untaggedLabel: string;
  noMemosLabel: string;
}

/**
 * 現在のボード(全シーン画像)とメモを新規Googleドキュメントとして保存する。
 * 認可ポップアップはユーザー操作直後に出す必要があるため、最初にトークンを取得する。
 */
export async function saveBoardToGoogleDoc(
  uid: string,
  projectId: string,
  title: string,
  labels: SaveDocLabels,
  locale: string,
): Promise<CreatedDoc> {
  const accessToken = await getDriveAccessToken();
  const sceneImages = await captureAllScenesPng();
  const memos = await listMemos(uid, projectId);

  const html = buildDocHtml({
    title,
    sceneImages,
    sceneHeading: labels.sceneHeading,
    memoSectionHeading: labels.memoSectionHeading,
    untaggedLabel: labels.untaggedLabel,
    noMemosLabel: labels.noMemosLabel,
    memos: memos.map((memo) => ({
      text: memo.text,
      tags: memo.tags,
      createdAtLabel: new Date(memo.createdAt).toLocaleString(locale),
    })),
  });

  // ドキュメント名: プロジェクト名+保存日時
  const docName = `${title} ${new Date().toLocaleString(locale)}`;
  return createGoogleDocFromHtml(accessToken, docName, html);
}
