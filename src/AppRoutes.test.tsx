import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { User } from 'firebase/auth';
import { vi } from 'vitest';
import { AuthContext, type AuthState } from '@/features/auth/auth-context';
import { AppRoutes } from '@/AppRoutes';
import { createInitialSnapshot } from '@/features/projects/projectTypes';

vi.mock('@/features/projects/projectService', () => ({
  loadProject: vi.fn(async (_uid: string, projectId: string) => ({
    meta: {
      id: projectId,
      title: 'テストプロジェクト',
      tags: [],
      sportType: 'soccer11',
      updatedAt: null,
    },
    snapshot: createInitialSnapshot('soccer11'),
  })),
  listProjects: vi.fn(async () => []),
  createProject: vi.fn(),
  duplicateProject: vi.fn(),
  deleteProject: vi.fn(),
  saveProjectSnapshot: vi.fn(),
  updateProjectMeta: vi.fn(),
}));

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

  it('ログイン済みで/board/:projectIdにアクセスするとボード画面が表示される', async () => {
    renderWithAuth({ user: mockUser, loading: false }, '/board/abc123');
    expect(await screen.findByTestId('board-canvas')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'テストプロジェクト' })).toBeInTheDocument();
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
