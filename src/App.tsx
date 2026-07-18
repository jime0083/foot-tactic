import { BrowserRouter } from 'react-router';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { AppRoutes } from '@/AppRoutes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
