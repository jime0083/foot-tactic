import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import i18n from '@/i18n';

beforeEach(async () => {
  // テスト間の言語切替の影響を避けるため常に日本語へ戻す
  if (i18n.language !== 'ja') {
    await i18n.changeLanguage('ja');
  }
});

afterEach(() => {
  cleanup();
});
