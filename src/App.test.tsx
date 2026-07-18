import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

vi.mock('@/lib/firebase', () => ({ auth: {} }));
vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    onAuthStateChanged: vi.fn((_auth, callback: (user: null) => void) => {
      callback(null);
      return vi.fn();
    }),
  };
});

describe('App', () => {
  it('未ログイン状態ではログイン画面が表示される', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'foot-tactic' })).toBeInTheDocument();
  });
});
