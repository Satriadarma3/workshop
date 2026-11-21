import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import SubscriptionRow from '../components/SubscriptionRow';
import { sortSubscriptions, daysUntilDeletion } from '../lib/format';
import { UIIcon } from '../lib/icons';

const STATUS_FILTERS = [
  ['ALL', 'Semua'],
  ['ACTIVE', 'Aktif'],
  ['PAUSED', 'Dijeda'],
  ['CANCELLED', 'Dibatalkan'],
];

/** Bar countdown visual untuk 1 langganan yang dibatalkan */
function CancelledCountdown({ sub, onDelete, onRestore, catName }) {
  const sisa = daysUntilDeletion(sub.cancelled_at);
  const pct = sub.cancelled_at ? Math.round((sisa / 30) * 100) : 100;
  const urgent = sisa <= 7;
  const color = sisa <= 3 ? '#a32a2a' : sisa <= 7 ? '#d97706' : '#6c8494';

  return (
    <div className={`cancel-row${urgent ? ' cancel-row-urgent' : ''}`}>
      <div className="cancel-info">
        <span className="cancel-name">{sub.service_name}</span>
        {catName && <span className="cancel-cat">{catName}</span>}
      </div>
      <div className="cancel-bar-wrap">
        <div className="cancel-bar-bg">
          <div
            className="cancel-bar-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="cancel-sisa" style={{ color }}>
          {sub.cancelled_at
            ? sisa === 0
              ? 'Dihapus hari ini'
              : `${sisa} hari lagi`
            : 'Tanpa batas'}
        </span>
      </div>
      <div className="cancel-actions">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          title="Aktifkan kembali"
          onClick={onRestore}
        >
          <UIIcon name="refresh" size={15} strokeWidth={2} />
          Pulihkan
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          title="Hapus sekarang"
          onClick={onDelete}
        >
          <UIIcon name="trash" size={15} strokeWidth={2} />
          Hapus
        </button>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const { subs, cats, deleteSubscription, updateSubscription } = useData();
  const { openSubscriptionForm, askConfirm } = useUI();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [cat, setCat] = useState('ALL'); // 'ALL' | 'NONE' | id kategori

  const catById = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c])), [cats]);

  // Langganan yang dibatalkan — tampil di panel terpisah
  const cancelledSubs = useMemo(
    () => subs.filter((s) => s.status === 'CANCELLED'),
    [subs],
  );

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
      title: `Hapus "${s.service_name}"?`,
      body: 'Data langganan ini akan dihapus permanen.',
      onConfirm: () => deleteSubscription(s.id),
    });

  const restore = (s) =>
    askConfirm({
      title: `Pulihkan "${s.service_name}"?`,
      body: 'Status akan dikembalikan ke Aktif dan timer 30 hari akan direset.',
      onConfirm: () =>
        updateSubscription(s.id, {
          ...s,
          status: 'ACTIVE',
          cancelled_at: null,
        }),
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

      {/* ===== PANEL DIBATALKAN — auto-hapus 30 hari ===== */}
      {cancelledSubs.length > 0 && (
        <div className="cancel-panel">
          <div className="cancel-panel-head">
            <span className="cancel-panel-icon" aria-hidden="true">🗑</span>
            <div>
              <h2 className="cancel-panel-title">Akan Dihapus Otomatis</h2>
              <p className="cancel-panel-desc">
                Langganan yang dibatalkan akan dihapus permanen setelah <strong>30 hari</strong>.
                Pulihkan sebelum waktu habis jika ingin menyimpannya.
              </p>
            </div>
          </div>
          <div className="cancel-list">
            {cancelledSubs.map((s) => (
              <CancelledCountdown
                key={s.id}
                sub={s}
                catName={catById[s.category_id]?.name}
                onDelete={() => remove(s)}
                onRestore={() => restore(s)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===== FILTER & TABEL ===== */}
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
                {key === 'CANCELLED' && cancelledSubs.length > 0 && (
                  <span className="chip-badge">{cancelledSubs.length}</span>
                )}
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
