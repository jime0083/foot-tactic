/** Googleドキュメントへ変換するHTMLの組み立て(Drive APIのHTML→Docs変換を利用) */

export interface DocMemoEntry {
  text: string;
  tags: string[];
  /** 表示用の作成日時文字列 */
  createdAtLabel: string;
}

export interface BuildDocHtmlParams {
  title: string;
  /** シーン画像(PNG data URL)をシーン順に */
  sceneImages: string[];
  /** シーン見出しの生成(例: n → "シーン n") */
  sceneHeading: (sceneNumber: number) => string;
  memoSectionHeading: string;
  /** タグなしメモの見出し */
  untaggedLabel: string;
  noMemosLabel: string;
  memos: DocMemoEntry[];
}

/** HTML特殊文字をエスケープする */
export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** 改行を<br>に変換しつつエスケープする */
function toHtmlText(text: string): string {
  return escapeHtml(text).replaceAll('\n', '<br>');
}

/**
 * ボード画像+メモ一覧のHTMLを組み立てる。
 * 構成: タイトル → 全シーン画像(シーン番号見出し付き) → メモ一覧(タグ見出し+本文+日時)
 */
export function buildDocHtml(params: BuildDocHtmlParams): string {
  const parts: string[] = [];
  parts.push(`<h1>${escapeHtml(params.title)}</h1>`);

  params.sceneImages.forEach((dataUrl, index) => {
    parts.push(`<h2>${escapeHtml(params.sceneHeading(index + 1))}</h2>`);
    parts.push(`<p><img src="${dataUrl}" width="640"></p>`);
  });

  parts.push(`<h2>${escapeHtml(params.memoSectionHeading)}</h2>`);
  if (params.memos.length === 0) {
    parts.push(`<p>${escapeHtml(params.noMemosLabel)}</p>`);
  } else {
    for (const memo of params.memos) {
      const heading =
        memo.tags.length > 0
          ? memo.tags.map(escapeHtml).join(' / ')
          : escapeHtml(params.untaggedLabel);
      parts.push(`<h3>${heading}</h3>`);
      parts.push(`<p>${toHtmlText(memo.text)}</p>`);
      parts.push(`<p><i>${escapeHtml(memo.createdAtLabel)}</i></p>`);
    }
  }

  return `<html><body>${parts.join('')}</body></html>`;
}
