import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { User } from 'firebase/auth';
import { AuthContext, type AuthState } from '@/features/auth/auth-context';
import { AppRoutes } from '@/AppRoutes';

function renderWithAuth(state: AuthState, initialPath: string) {
  return render(
    <AuthContext.Provider value={state}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

const mockUser = { uid: 'test-uid', displayName: 'テストユーザー' } as User;

describe('AppRoutes 認証ガード', () => {
  it('未ログインで/projectsにアクセスするとログイン画面へリダイレクトされる', () => {
    renderWithAuth({ user: null, loading: false }, '/projects');
    expect(screen.getByRole('heading', { name: 'foot-tactic' })).toBeInTheDocument();
  });

  it('未ログインで/settingsにアクセスするとログイン画面へリダイレクトされる', () => {
    renderWithAuth({ user: null, loading: false }, '/settings');
    expect(screen.getByRole('heading', { name: 'foot-tactic' })).toBeInTheDocument();
  });

  it('ログイン済みで/projectsにアクセスすると一覧画面が表示される', () => {
    renderWithAuth({ user: mockUser, loading: false }, '/projects');
    expect(screen.getByRole('heading', { name: 'プロジェクト一覧' })).toBeInTheDocument();
  });

  it('ログイン済みで/loginにアクセスすると/projectsへリダイレクトされる', () => {
    renderWithAuth({ user: mockUser, loading: false }, '/login');
    expect(screen.getByRole('heading', { name: 'プロジェクト一覧' })).toBeInTheDocument();
  });

  it('ログイン済みで/board/:projectIdにアクセスするとボード画面が表示される', () => {
    renderWithAuth({ user: mockUser, loading: false }, '/board/abc123');
    expect(screen.getByRole('heading', { name: '戦術ボード' })).toBeInTheDocument();
    expect(screen.getByTestId('board-canvas')).toBeInTheDocument();
  });

  it('不明なパスは/projectsへリダイレクトされる', () => {
    renderWithAuth({ user: mockUser, loading: false }, '/unknown-path');
    expect(screen.getByRole('heading', { name: 'プロジェクト一覧' })).toBeInTheDocument();
  });

  it('認証状態の判定中はローディング表示になる', () => {
    renderWithAuth({ user: null, loading: true }, '/projects');
    expect(screen.getByRole('status')).toHaveTextContent('読み込み中...');
  });
});
