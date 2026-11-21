import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore, setUnauthorizedHandler } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(() => !!tokenStore.get());

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  // Pulihkan sesi dari token yang tersimpan
  useEffect(() => {
    if (!tokenStore.get()) return;
    api.auth
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setBooting(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      booting,
      async login(credentials) {
        const { token, user: u } = await api.auth.login(credentials);
        tokenStore.set(token);
        setUser(u);
      },
      async register(input) {
        const { token, user: u } = await api.auth.register(input);
        tokenStore.set(token);
        setUser(u);
      },
      logout,
    }),
    [user, booting, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
