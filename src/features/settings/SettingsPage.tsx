import { useTranslation } from 'react-i18next';
import { LanguageSelect } from '@/components/LanguageSelect';

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <main className="app">
      <h1>{t('settings.title')}</h1>
      <section>
        <LanguageSelect />
      </section>
      {/* AIプロバイダ・APIキー設定はPhase6.1で実装 */}
      <section>
        {/* アカウント削除の実処理はPhase8.3で実装 */}
        <button type="button" disabled>
          {t('settings.deleteAccount')}
        </button>
      </section>
    </main>
  );
}
