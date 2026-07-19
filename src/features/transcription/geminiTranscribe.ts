import { kindFromStatus, TranscriptionError } from './errors';

const GEMINI_MODEL = 'gemini-2.0-flash';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const TRANSCRIBE_PROMPT =
  'この音声を文字起こししてください。話された内容のテキストだけを返し、説明や前置きは付けないでください。';

/** BlobをBase64文字列(data:プレフィックスなし)へ変換する */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error('音声データの変換に失敗しました'));
    reader.readAsDataURL(blob);
  });
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: unknown }> };
  }>;
}

/** Google Gemini APIで音声を文字起こしする */
export async function transcribeWithGemini(audio: Blob, apiKey: string): Promise<string> {
  const base64 = await blobToBase64(audio);
  const body = {
    contents: [
      {
        parts: [
          { text: TRANSCRIBE_PROMPT },
          {
            inline_data: {
              mime_type: audio.type || 'audio/webm',
              data: base64,
            },
          },
        ],
      },
    ],
  };

  let response: Response;
  try {
    response = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new TranscriptionError('network', 'Gemini APIへの接続に失敗しました');
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new TranscriptionError(
      kindFromStatus(response.status),
      `Gemini APIエラー(${response.status}): ${errorBody.slice(0, 200)}`,
    );
  }

  const result = (await response.json()) as GeminiResponse;
  const text = (result.candidates?.[0]?.content?.parts ?? [])
    .map((part) => (typeof part.text === 'string' ? part.text : ''))
    .join('')
    .trim();
  if (text === '') {
    throw new TranscriptionError('other', 'Gemini APIから文字起こし結果が得られませんでした');
  }
  return text;
}
