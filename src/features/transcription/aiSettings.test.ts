import {
  AI_SETTINGS_STORAGE_KEY,
  getActiveApiKey,
  loadAiSettings,
  saveAiSettings,
} from './aiSettings';

describe('aiSettings', () => {
  beforeEach(() => {
    localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
  });

  it('未保存の場合はGeminiが既定プロバイダになる', () => {
    const settings = loadAiSettings();
    expect(settings.provider).toBe('gemini');
    expect(settings.geminiKey).toBe('');
    expect(settings.openaiKey).toBe('');
  });

  it('保存と読み込みの往復ができる(部分更新)', () => {
    saveAiSettings({ geminiKey: 'gemini-key-123' });
    saveAiSettings({ provider: 'openai', openaiKey: 'openai-key-456' });

    const settings = loadAiSettings();
    expect(settings.provider).toBe('openai');
    expect(settings.geminiKey).toBe('gemini-key-123');
    expect(settings.openaiKey).toBe('openai-key-456');
  });

  it('壊れたJSONは既定値にフォールバックする', () => {
    localStorage.setItem(AI_SETTINGS_STORAGE_KEY, '{broken');
    expect(loadAiSettings().provider).toBe('gemini');
  });

  it('不正なプロバイダ値はgeminiに補正される', () => {
    localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify({ provider: 'claude' }));
    expect(loadAiSettings().provider).toBe('gemini');
  });

  it('getActiveApiKeyは選択中プロバイダのキーを返す', () => {
    expect(getActiveApiKey({ provider: 'gemini', geminiKey: 'g', openaiKey: 'o' })).toBe('g');
    expect(getActiveApiKey({ provider: 'openai', geminiKey: 'g', openaiKey: 'o' })).toBe('o');
  });
});
