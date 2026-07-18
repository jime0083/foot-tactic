import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { vi, type Mock } from 'vitest';
import type { User } from 'firebase/auth';
import { ProjectListPage } from './ProjectListPage';
import {
  createProject,
  deleteProject,
  duplicateProject,
  listProjects,
  updateProjectMeta,
} from './projectService';
import { AuthContext } from '@/features/auth/auth-context';

vi.mock('./projectService', () => ({
  listProjects: vi.fn(),
  createProject: vi.fn(),
  duplicateProject: vi.fn(),
  deleteProject: vi.fn(),
  updateProjectMeta: vi.fn(),
}));

const mockUser = { uid: 'u1' } as User;

const sampleItems = [
  {
    id: 'p1',
    title: 'vs FC東京',
    tags: ['リーグ戦'],
    sportType: 'soccer11' as const,
    updatedAt: Date.now(),
    previewObjects: [],
  },
  {
    id: 'p2',
    title: 'フットサル練習',
    tags: [],
    sportType: 'futsal' as const,
    updatedAt: null,
    previewObjects: [],
  },
];

function renderPage() {
  return render(
    <AuthContext.Provider value={{ user: mockUser, loading: false }}>
      <MemoryRouter initialEntries={['/projects']}>
        <ProjectListPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProjectListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (listProjects as Mock).mockResolvedValue(sampleItems);
  });

  it('プロジェクト一覧がサムネイル付きで表示される', async () => {
    renderPage();
    expect(await screen.findByText('vs FC東京')).toBeInTheDocument();
    expect(screen.getByText('フットサル練習')).toBeInTheDocument();
  });

  it('一覧が空の場合は案内が表示される', async () => {
    (listProjects as Mock).mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(/プロジェクトがまだありません/)).toBeInTheDocument();
  });

  it('新規作成でプロジェクトが作成される', async () => {
    (createProject as Mock).mockResolvedValue('new-id');
    renderPage();
    await screen.findByText('vs FC東京');

    await userEvent.type(screen.getByLabelText('プロジェクト名'), '週末の試合');
    await userEvent.selectOptions(screen.getByLabelText('競技'), 'futsal');
    await userEvent.click(screen.getByRole('button', { name: '新規作成' }));

    expect(createProject).toHaveBeenCalledWith('u1', '週末の試合', 'futsal');
  });

  it('タイトル未入力の場合は既定タイトルで作成される', async () => {
    (createProject as Mock).mockResolvedValue('new-id');
    renderPage();
    await screen.findByText('vs FC東京');

    await userEvent.click(screen.getByRole('button', { name: '新規作成' }));

    expect(createProject).toHaveBeenCalledWith('u1', '新しいプロジェクト', 'soccer11');
  });

  it('複製ボタンで複製され一覧が更新される', async () => {
    (duplicateProject as Mock).mockResolvedValue('copy-id');
    renderPage();
    await screen.findByText('vs FC東京');

    await userEvent.click(screen.getAllByRole('button', { name: '複製' })[0]);

    expect(duplicateProject).toHaveBeenCalledWith('u1', 'p1');
    expect(listProjects).toHaveBeenCalledTimes(2);
  });

  it('削除は確認後に実行される', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    (deleteProject as Mock).mockResolvedValue(undefined);
    renderPage();
    await screen.findByText('vs FC東京');

    await userEvent.click(screen.getAllByRole('button', { name: '削除' })[0]);

    expect(deleteProject).toHaveBeenCalledWith('u1', 'p1');
    confirmSpy.mockRestore();
  });

  it('タイトル検索で一覧が絞り込まれる', async () => {
    renderPage();
    await screen.findByText('vs FC東京');

    await userEvent.type(screen.getByLabelText('タイトルで検索'), 'フットサル');

    expect(screen.queryByText('vs FC東京')).not.toBeInTheDocument();
    expect(screen.getByText('フットサル練習')).toBeInTheDocument();
  });

  it('タグで絞り込める', async () => {
    renderPage();
    await screen.findByText('vs FC東京');

    await userEvent.selectOptions(screen.getByLabelText('タグで絞り込み'), 'リーグ戦');

    expect(screen.getByText('vs FC東京')).toBeInTheDocument();
    expect(screen.queryByText('フットサル練習')).not.toBeInTheDocument();
  });

  it('タグを追加できる', async () => {
    (updateProjectMeta as Mock).mockResolvedValue(undefined);
    renderPage();
    await screen.findByText('フットサル練習');

    const input = screen.getByLabelText('タグを追加: フットサル練習');
    await userEvent.type(input, '朝練{enter}');

    expect(updateProjectMeta).toHaveBeenCalledWith('u1', 'p2', { tags: ['朝練'] });
  });

  it('タグを削除できる', async () => {
    (updateProjectMeta as Mock).mockResolvedValue(undefined);
    renderPage();
    await screen.findByText('vs FC東京');

    await userEvent.click(screen.getByRole('button', { name: 'タグを削除: リーグ戦' }));

    expect(updateProjectMeta).toHaveBeenCalledWith('u1', 'p1', { tags: [] });
  });

  it('確認をキャンセルすると削除されない', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderPage();
    await screen.findByText('vs FC東京');

    await userEvent.click(screen.getAllByRole('button', { name: '削除' })[0]);

    expect(deleteProject).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
