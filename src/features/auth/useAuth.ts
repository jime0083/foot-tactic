import { useContext } from 'react';
import { AuthContext, type AuthState } from './auth-context';

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthはAuthProviderの内側で使用してください');
  }
  return context;
}
