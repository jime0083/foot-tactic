import { defineConfig } from 'vitest/config';

// Firestoreセキュリティルールのテスト専用設定
// 実行には firebase emulators:exec を使用する(npm run test:rules)
export default defineConfig({
  test: {
    include: ['rules-tests/**/*.test.ts'],
    environment: 'node',
    globals: true,
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
