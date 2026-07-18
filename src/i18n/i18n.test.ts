import i18n, { LANGUAGE_STORAGE_KEY, loadStoredLanguage, storeLanguage } from './index';

describe('i18n', () => {
  afterEach(async () => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    await i18n.changeLanguage('ja');
  });

  it('デフォルトは日本語リソースを返す', () => {
    expect(i18n.t('login.button')).toBe('Googleでログイン');
    expect(i18n.t('settings.title')).toBe('設定');
  });

  it('英語に切り替えると英語リソースを返す', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('login.button')).toBe('Sign in with Google');
    expect(i18n.t('settings.title')).toBe('Settings');
  });

  it('storeLanguage/loadStoredLanguageで言語設定を永続化できる', () => {
    storeLanguage('en');
    expect(loadStoredLanguage()).toBe('en');
    storeLanguage('ja');
    expect(loadStoredLanguage()).toBe('ja');
  });

  it('不正な保存値の場合はデフォルトの日本語を返す', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr');
    expect(loadStoredLanguage()).toBe('ja');
  });
});
