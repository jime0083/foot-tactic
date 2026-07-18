import { useParams } from 'react-router';

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <main className="app">
      <h1>戦術ボード</h1>
      <p>プロジェクトID: {projectId}</p>
      {/* ボードUIはPhase2で実装 */}
    </main>
  );
}
