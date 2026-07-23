# foot-tactic

サッカー用戦術ボード + メモ Webアプリ(TACTICAListaクローン + 独自機能)

## 本番環境

https://foot-tactic.web.app

## 開発

```bash
npm install
npm run dev        # 開発サーバー
npm run build      # ビルド
npm run lint       # ESLint
npm run format     # Prettier
npm run typecheck  # 型チェック
npm test           # テスト
npm run test:coverage  # カバレッジ計測
npm run test:rules # Firestoreルールテスト(要Java/エミュレータ)
npm run e2e        # E2Eテスト(要Java/エミュレータ)
```

## デプロイ

```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

詳細は requirements.md / progress.txt / manual-work.txt を参照。
