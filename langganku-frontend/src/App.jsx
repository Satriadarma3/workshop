import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Shell from './components/Shell';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import CategoriesPage from './pages/CategoriesPage';
import AccountPage from './pages/AccountPage';

function RequireAuth({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <div className="boot">Memuat…</div>;
  if (!user) return <Navigate to="/masuk" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <div className="boot">Memuat…</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/masuk"
        element={
          <GuestOnly>
            <AuthPage />
          </GuestOnly>
        }
      />
      <Route
        element={
          <RequireAuth>
            <DataProvider>
              <Shell />
            </DataProvider>
          </RequireAuth>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="langganan" element={<SubscriptionsPage />} />
        <Route path="kategori" element={<CategoriesPage />} />
        <Route path="akun" element={<AccountPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
