import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateUserAiProvider } from '@/features/auth/userDocument';
import { useAuth } from '@/features/auth/useAuth';
import {
  loadAiSettings,
  saveAiSettings,
  type AiProvider,
  type AiSettings,
} from '@/features/transcription/aiSettings';

/** AI音声文字起こしの設定(プロバイダ選択・APIキー登録) */
export function AiSettingsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [settings, setSettings] = useState<AiSettings>(() => loadAiSettings());
  const [showKeys, setShowKeys] = useState(false);

  const handleProviderChange = async (provider: AiProvider) => {
    setSettings(saveAiSettings({ provider }));
    if (user) {
      try {
        await updateUserAiProvider(user.uid, provider);
      } catch (error) {
        // Firestoreへの保存に失敗しても端末上の設定は維持する
        console.error('AIプロバイダ設定の保存に失敗しました', error);
      }
    }
  };

  return (
    <section className="ai-settings">
      <h2>{t('settings.ai.title')}</h2>
      <p className="ai-settings__note">{t('settings.ai.localOnlyNote')}</p>
      <p className="ai-settings__note">{t('settings.ai.billingNote')}</p>
      <label>
        {t('settings.ai.provider')}
        <select
          value={settings.provider}
          onChange={(event) => void handleProviderChange(event.target.value as AiProvider)}
        >
          <option value="gemini">Google Gemini</option>
          <option value="openai">OpenAI</option>
        </select>
      </label>
      <label>
        {t('settings.ai.geminiKey')}
        <input
          type={showKeys ? 'text' : 'password'}
          autoComplete="off"
          value={settings.geminiKey}
          placeholder={t('settings.ai.keyPlaceholder')}
          onChange={(event) => setSettings(saveAiSettings({ geminiKey: event.target.value }))}
        />
      </label>
      <label>
        {t('settings.ai.openaiKey')}
        <input
          type={showKeys ? 'text' : 'password'}
          autoComplete="off"
          value={settings.openaiKey}
          placeholder={t('settings.ai.keyPlaceholder')}
          onChange={(event) => setSettings(saveAiSettings({ openaiKey: event.target.value }))}
        />
      </label>
      <label className="ai-settings__show-keys">
        <input
          type="checkbox"
          checked={showKeys}
          onChange={(event) => setShowKeys(event.target.checked)}
        />
        {t('settings.ai.showKeys')}
      </label>
    </section>
  );
}
