import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import SubscriptionRow from '../components/SubscriptionRow';
import { sortSubscriptions } from '../lib/format';
import { UIIcon } from '../lib/icons';

const STATUS_FILTERS = [
  ['ALL', 'Semua'],
  ['ACTIVE', 'Aktif'],
  ['PAUSED', 'Dijeda'],
  ['CANCELLED', 'Dibatalkan'],
];

export default function SubscriptionsPage() {
  const { subs, cats, deleteSubscription } = useData();
  const { openSubscriptionForm, askConfirm } = useUI();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [cat, setCat] = useState('ALL'); // 'ALL' | 'NONE' | id kategori

  const catById = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c])), [cats]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return sortSubscriptions(
      subs.filter((s) => {
        if (status !== 'ALL' && s.status !== status) return false;
        if (cat === 'NONE' && s.category_id) return false;
        if (cat !== 'ALL' && cat !== 'NONE' && s.category_id !== cat) return false;
        if (term) {
          const hay = `${s.service_name} ${s.notes || ''} ${catById[s.category_id]?.name || ''}`.toLowerCase();
          if (!hay.includes(term)) return false;
        }
        return true;
      }),
    );
  }, [subs, q, status, cat, catById]);

  const filtered = q.trim() !== '' || status !== 'ALL' || cat !== 'ALL';

  const remove = (s) =>
    askConfirm({
      title: `Hapus “${s.service_name}”?`,
      body: 'Data langganan ini akan dihapus permanen.',
      onConfirm: () => deleteSubscription(s.id),
    });

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div className="stack-sm">
          <h1 className="page-title">Langganan</h1>
          <p className="lead">{subs.length} langganan tercatat.</p>
        </div>
        <button type="button" className="btn btn-primary btn-lg hide-mobile" onClick={() => openSubscriptionForm()}>
          <UIIcon name="plus" size={18} strokeWidth={2.2} />
          Tambah langganan
        </button>
      </div>

      <div className="stack-sm">
        <div className="toolbar">
          <label className="search">
            <span className="sr-only">Cari langganan</span>
            <UIIcon name="search" size={18} />
            <input type="search" placeholder="Cari nama layanan atau catatan" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="chip-scroll" role="group" aria-label="Filter status">
            {STATUS_FILTERS.map(([key, label]) => (
              <button key={key} type="button" className="chip" aria-pressed={status === key} onClick={() => setStatus(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="chip-scroll" role="group" aria-label="Filter kategori">
          {[['ALL', 'Semua kategori'], ...cats.map((c) => [c.id, c.name]), ['NONE', 'Tanpa kategori']].map(([key, label]) => (
            <button key={key} type="button" className="chip" aria-pressed={cat === key} onClick={() => setCat(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="sub-list">
        <div className="sub-scroll">
          <div className="sub-table">
            <div className="sub-head" aria-hidden="true">
              <span>Layanan</span>
              <span>Harga</span>
              <span>Siklus</span>
              <span>Tagihan berikutnya</span>
              <span>Status</span>
              <span />
            </div>
            {rows.map((s) => (
              <SubscriptionRow
                key={s.id}
                sub={s}
                category={catById[s.category_id]}
                onEdit={() => openSubscriptionForm(s)}
                onDelete={() => remove(s)}
              />
            ))}
            {rows.length === 0 && (
              <div className="empty">
                {filtered ? 'Tidak ada langganan yang cocok dengan filter ini.' : 'Belum ada langganan. Tambahkan yang pertama.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
