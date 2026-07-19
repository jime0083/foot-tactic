import { getActiveApiKey, type AiSettings } from './aiSettings';
import { TranscriptionError } from './errors';
import { transcribeWithGemini } from './geminiTranscribe';
import { transcribeWithOpenAI } from './openaiTranscribe';

/** プロバイダ別の文字起こし実装 */
const providers: Record<AiSettings['provider'], (audio: Blob, key: string) => Promise<string>> = {
  openai: transcribeWithOpenAI,
  gemini: transcribeWithGemini,
};

/** 選択中のプロバイダで音声を文字起こしする */
export async function transcribeAudio(audio: Blob, settings: AiSettings): Promise<string> {
  const apiKey = getActiveApiKey(settings);
  if (apiKey === '') {
    throw new TranscriptionError('auth', 'APIキーが登録されていません');
  }
  return providers[settings.provider](audio, apiKey);
}
