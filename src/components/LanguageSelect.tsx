import { type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { updateUserLanguage } from '@/features/auth/userDocument';
import { useAuth } from '@/features/auth/useAuth';
import { storeLanguage, type AppLanguage } from '@/i18n';

/** 言語切替セレクト。切替時にlocalStorageとFirestore(ログイン時のみ)へ保存する */
export function LanguageSelect() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const language: AppLanguage = event.target.value === 'en' ? 'en' : 'ja';
    await i18n.changeLanguage(language);
    storeLanguage(language);
    if (user) {
      try {
        await updateUserLanguage(user.uid, language);
      } catch (error) {
        // Firestoreへの保存に失敗しても画面上の言語切替は維持する
        console.error('言語設定の保存に失敗しました', error);
      }
    }
  };

  return (
    <label>
      {t('settings.language')}
      <select value={i18n.language} onChange={handleChange}>
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}
