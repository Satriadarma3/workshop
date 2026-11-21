import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

// Backend bisa mengirim DECIMAL sebagai string; pastikan price selalu angka.
const normalize = (s) => ({ ...s, price: Number(s.price) });

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [c, s] = await Promise.all([api.categories.list(), api.subscriptions.list()]);
      setCats(c);
      setSubs(s.map(normalize));
    } catch (e) {
      setError(e.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) reload();
  }, [user, reload]);

  const actions = useMemo(
    () => ({
      async createSubscription(input) {
        const created = normalize(await api.subscriptions.create(input));
        setSubs((prev) => [...prev, created]);
      },
      async updateSubscription(id, input) {
        const updated = normalize(await api.subscriptions.update(id, input));
        setSubs((prev) => prev.map((s) => (s.id === id ? updated : s)));
      },
      async deleteSubscription(id) {
        await api.subscriptions.remove(id);
        setSubs((prev) => prev.filter((s) => s.id !== id));
      },
      async createCategory(input) {
        const created = await api.categories.create(input);
        setCats((prev) => [...prev, created]);
      },
      async updateCategory(id, input) {
        const updated = await api.categories.update(id, input);
        setCats((prev) => prev.map((c) => (c.id === id ? updated : c)));
      },
      async deleteCategory(id) {
        await api.categories.remove(id);
        setCats((prev) => prev.filter((c) => c.id !== id));
        // Sesuai ERD: kategori opsional, jadi langganannya dikosongkan, bukan dihapus.
        setSubs((prev) => prev.map((s) => (s.category_id === id ? { ...s, category_id: null } : s)));
      },
    }),
    [],
  );

  const value = useMemo(() => ({ subs, cats, loading, error, reload, ...actions }), [subs, cats, loading, error, reload, actions]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
