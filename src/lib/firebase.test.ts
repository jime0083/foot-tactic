import { firebaseApp, auth, db } from './firebase';

describe('firebase初期化モジュール', () => {
  it('環境変数の構成値でFirebaseアプリが初期化される', () => {
    expect(firebaseApp.options.projectId).toBe(import.meta.env.VITE_FIREBASE_PROJECT_ID);
    expect(firebaseApp.options.apiKey).toBe(import.meta.env.VITE_FIREBASE_API_KEY);
    expect(firebaseApp.options.authDomain).toBe(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
  });

  it('AuthとFirestoreのインスタンスが同一アプリに紐付く', () => {
    expect(auth.app).toBe(firebaseApp);
    expect(db.app).toBe(firebaseApp);
  });
});
