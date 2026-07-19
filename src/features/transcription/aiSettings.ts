/** AI文字起こしのプロバイダ */
export type AiProvider = 'openai' | 'gemini';

/**
 * AI設定。APIキーは端末のlocalStorageにのみ保存し、
 * サーバー(Firebase)には一切送信しない(要件VOICE-4)。
 */
export interface AiSettings {
  provider: AiProvider;
  openaiKey: string;
  geminiKey: string;
}

export const AI_SETTINGS_STORAGE_KEY = 'foot-tactic:ai-settings';

const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: 'gemini',
  openaiKey: '',
  geminiKey: '',
};

/** localStorageからAI設定を読み込む(壊れている場合は既定値) */
export function loadAiSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_AI_SETTINGS;
    }
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    return {
      provider: parsed.provider === 'openai' ? 'openai' : 'gemini',
      openaiKey: typeof parsed.openaiKey === 'string' ? parsed.openaiKey : '',
      geminiKey: typeof parsed.geminiKey === 'string' ? parsed.geminiKey : '',
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

/** AI設定を部分更新してlocalStorageへ保存し、更新後の設定を返す */
export function saveAiSettings(patch: Partial<AiSettings>): AiSettings {
  const next = { ...loadAiSettings(), ...patch };
  try {
    localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorageが使用できない環境でも画面上の設定は維持する
  }
  return next;
}

/** 選択中プロバイダのAPIキーを返す(未登録なら空文字) */
export function getActiveApiKey(settings: AiSettings): string {
  return settings.provider === 'openai' ? settings.openaiKey : settings.geminiKey;
}
