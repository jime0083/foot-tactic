import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ja } from './ja';
import { en } from './en';

export type AppLanguage = 'ja' | 'en';

export const LANGUAGE_STORAGE_KEY = 'foot-tactic:language';

export function loadStoredLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === 'en' ? 'en' : 'ja';
  } catch {
    // localStorageが使用できない環境ではデフォルト言語を使用する
    return 'ja';
  }
}

export function storeLanguage(language: AppLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // 保存できなくても言語切替自体は継続する
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
  },
  lng: loadStoredLanguage(),
  fallbackLng: 'ja',
  interpolation: {
    // Reactがエスケープするためi18next側のエスケープは不要
    escapeValue: false,
  },
});

export default i18n;
