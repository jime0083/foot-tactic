import { Navigate, Route, Routes } from 'react-router';
import { LoginPage } from '@/features/auth/LoginPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { BoardPage } from '@/features/board/BoardPage';
import { ProjectListPage } from '@/features/projects/ProjectListPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/board/:projectId" element={<BoardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}
