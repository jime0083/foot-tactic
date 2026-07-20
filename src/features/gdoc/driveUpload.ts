/** Drive APIでHTMLをGoogleドキュメントとして作成する */

const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

export type DriveUploadErrorKind = 'auth' | 'network' | 'other';

export class DriveUploadError extends Error {
  readonly kind: DriveUploadErrorKind;

  constructor(kind: DriveUploadErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

export interface CreatedDoc {
  id: string;
  /** 作成されたGoogleドキュメントのURL */
  url: string;
}

/**
 * HTMLをGoogleドキュメントへ変換してユーザーのドライブに新規作成する。
 * multipartアップロードでmimeTypeにGoogleドキュメントを指定すると
 * Drive側でHTML(data URI画像含む)がドキュメントへ変換される。
 */
export async function createGoogleDocFromHtml(
  accessToken: string,
  name: string,
  html: string,
): Promise<CreatedDoc> {
  const boundary = `foot_tactic_${Date.now().toString(36)}`;
  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.document',
  };
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
    `--${boundary}--`,
    '',
  ].join('\r\n');

  let response: Response;
  try {
    response = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
  } catch {
    throw new DriveUploadError('network', 'Google Driveへの接続に失敗しました');
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    const kind: DriveUploadErrorKind =
      response.status === 401 || response.status === 403 ? 'auth' : 'other';
    throw new DriveUploadError(
      kind,
      `Google Drive APIエラー(${response.status}): ${errorBody.slice(0, 200)}`,
    );
  }

  const result = (await response.json()) as { id?: unknown };
  if (typeof result.id !== 'string') {
    throw new DriveUploadError('other', 'Drive APIの応答形式が想定外です');
  }
  return {
    id: result.id,
    url: `https://docs.google.com/document/d/${result.id}/edit`,
  };
}
