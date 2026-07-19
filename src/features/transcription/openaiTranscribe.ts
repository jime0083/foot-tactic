import { kindFromStatus, TranscriptionError } from './errors';

const OPENAI_TRANSCRIPTION_URL = 'https://api.openai.com/v1/audio/transcriptions';

/** 使用する文字起こしモデル */
const OPENAI_MODEL = 'whisper-1';

/**
 * OpenAI Audio API(Whisper)で音声を文字起こしする。
 * 注意: OpenAI APIキーが用意できないため実キーでの動作検証は未実施(CLAUDE.md参照)。
 */
export async function transcribeWithOpenAI(audio: Blob, apiKey: string): Promise<string> {
  const formData = new FormData();
  const extension = audio.type.includes('mp4') ? 'mp4' : 'webm';
  formData.append('file', audio, `recording.${extension}`);
  formData.append('model', OPENAI_MODEL);

  let response: Response;
  try {
    response = await fetch(OPENAI_TRANSCRIPTION_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });
  } catch {
    throw new TranscriptionError('network', 'OpenAI APIへの接続に失敗しました');
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new TranscriptionError(
      kindFromStatus(response.status),
      `OpenAI APIエラー(${response.status}): ${body.slice(0, 200)}`,
    );
  }

  const result = (await response.json()) as { text?: unknown };
  if (typeof result.text !== 'string') {
    throw new TranscriptionError('other', 'OpenAI APIの応答形式が想定外です');
  }
  return result.text.trim();
}
