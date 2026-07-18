import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('アプリ名の見出しが表示される', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'foot-tactic' })).toBeInTheDocument();
  });
});
