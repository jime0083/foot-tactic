/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg', 'pwa-maskable.svg'],
      manifest: {
        name: 'foot-tactic - サッカー戦術ボード',
        short_name: 'foot-tactic',
        description: 'サッカー戦術ボード + メモ + Googleドキュメント保存',
        lang: 'ja',
        start_url: '/',
        display: 'standalone',
        theme_color: '#1a7a3a',
        background_color: '#16171d',
        icons: [
          { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'pwa-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // Google/Firebaseの認証・APIリクエストはService Workerでキャッシュしない
        navigateFallbackDenylist: [/^\/__/, /^\/api/],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/App.tsx',
        'src/**/*.d.ts',
        'src/test/**',
        // Konvaのcanvas描画に強く依存し、jsdomでは実描画できないコンポーネント。
        // 描画ロジックは純粋関数(fieldGeometry/boardView/shapeDrafting等)側でテスト済み。
        // これらの操作系はE2E(実ブラウザ)で担保する。
        'src/features/board/BoardCanvas.tsx',
        'src/features/board/objects/BoardObjects.tsx',
        'src/features/board/objects/PlayerShape.tsx',
        'src/features/board/field/FieldLines.tsx',
        // OpenAI連携はAPIキーが用意できず実キー検証不可のためテスト対象外(CLAUDE.md参照)
        'src/features/transcription/openaiTranscribe.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
