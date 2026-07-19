import { getActiveApiKey, type AiSettings } from './aiSettings';
import { TranscriptionError } from './errors';
import { transcribeWithGemini } from './geminiTranscribe';
import { transcribeWithOpenAI } from './openaiTranscribe';
import { isQuotaBlocked, setQuotaBlocked } from './quotaGuard';

/** プロバイダ別の文字起こし実装 */
const providers: Record<AiSettings['provider'], (audio: Blob, key: string) => Promise<string>> = {
  openai: transcribeWithOpenAI,
  gemini: transcribeWithGemini,
};

/**
 * 選択中のプロバイダで音声を文字起こしする。
 * クォータ超過ブロック中はAPIを呼ばず、超過エラーを検知したらブロックを記録する(VOICE-9)。
 */
export async function transcribeAudio(audio: Blob, settings: AiSettings): Promise<string> {
  if (isQuotaBlocked()) {
    throw new TranscriptionError('quota', 'API利用がブロック中です(無料枠超過)');
  }
  const apiKey = getActiveApiKey(settings);
  if (apiKey === '') {
    throw new TranscriptionError('auth', 'APIキーが登録されていません');
  }
  try {
    return await providers[settings.provider](audio, apiKey);
  } catch (error) {
    if (error instanceof TranscriptionError && error.kind === 'quota') {
      setQuotaBlocked();
    }
    throw error;
  }
}
