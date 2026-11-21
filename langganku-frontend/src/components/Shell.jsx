import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { UIContext } from '../context/UIContext';
import { useData } from '../context/DataContext';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import SubscriptionForm from './SubscriptionForm';
import ConfirmDialog from './ConfirmDialog';

export default function Shell() {
  const { loading, error, reload } = useData();
  const [form, setForm] = useState(null); // null | { sub: objek | null }
  const [confirm, setConfirm] = useState(null);

  const ui = useMemo(
    () => ({
      openSubscriptionForm: (sub = null) => setForm({ sub }),
      askConfirm: (config) => setConfirm(config),
    }),
    [],
  );

  return (
    <UIContext.Provider value={ui}>
      <div className="shell">
        {/* motif latar */}
        <div className="deco deco-ring" aria-hidden="true" />
        <div className="deco deco-ring-small" aria-hidden="true" />
        <div className="deco deco-disc" aria-hidden="true" />
        <div className="deco deco-dot" aria-hidden="true" />

        <TopNav />
        <main className="container page">
          {error ? (
            <div className="card notice" role="alert">
              <p>{error}</p>
              <button type="button" className="btn btn-ghost" onClick={reload}>
                Coba lagi
              </button>
            </div>
          ) : loading ? (
            <p className="muted">Memuat data…</p>
          ) : (
            <Outlet />
          )}
        </main>
        <BottomNav onAdd={() => ui.openSubscriptionForm()} />

        {form && <SubscriptionForm sub={form.sub} onClose={() => setForm(null)} />}
        {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
      </div>
    </UIContext.Provider>
  );
}
