import { useTranslation } from 'react-i18next';
import { LanguageSelect } from '@/components/LanguageSelect';
import { AiSettingsSection } from './AiSettingsSection';

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <main className="app">
      <h1>{t('settings.title')}</h1>
      <section>
        <LanguageSelect />
      </section>
      <AiSettingsSection />
      <section>
        {/* アカウント削除の実処理はPhase9.3で実装 */}
        <button type="button" disabled>
          {t('settings.deleteAccount')}
        </button>
      </section>
    </main>
  );
}
