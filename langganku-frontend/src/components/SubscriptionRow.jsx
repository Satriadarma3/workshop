import { CYCLE_LABEL, STATUS_META, daysUntil, formatDate, relativeText, rupiah } from '../lib/format';
import { CategoryIcon, UIIcon } from '../lib/icons';

/**
 * Satu baris langganan. Di layar lebar menjadi baris tabel (grid),
 * di layar kecil menjadi kartu; semuanya diatur CSS (.sub-row).
 */
export default function SubscriptionRow({ sub, category, onEdit, onDelete }) {
  const active = sub.status === 'ACTIVE';
  const n = daysUntil(sub.next_billing_date);
  const status = STATUS_META[sub.status];
  const relClass = active ? (n < 0 ? 'rel-overdue' : n <= 7 ? 'rel-soon' : '') : '';
  const meta = [category?.name ?? 'Tanpa kategori', sub.notes].filter(Boolean).join(' · ');

  return (
    <div className={`sub-row${sub.status === 'CANCELLED' ? ' is-cancelled' : ''}`}>
      <div className="sub-main">
        <span className="icon-circle">
          <CategoryIcon name={category?.icon ?? 'tag'} />
        </span>
        <span className="sub-text">
          <span className="sub-name">{sub.service_name}</span>
          <span className="sub-meta">
            <span className="cycle-inline">{CYCLE_LABEL[sub.billing_cycle]} · </span>
            {meta}
          </span>
        </span>
      </div>
      <div className="sub-price">{rupiah(sub.price)}</div>
      <div className="sub-cycle">{CYCLE_LABEL[sub.billing_cycle]}</div>
      <div className="sub-date">
        <span>
          <span className="date-prefix">Tagihan </span>
          {formatDate(sub.next_billing_date)}
        </span>
        {active && <span className={`sub-rel ${relClass}`}>{relativeText(n)}</span>}
      </div>
      <div className="sub-status">
        <span className={`chip-status ${status.className}`}>{status.label}</span>
      </div>
      <div className="sub-actions">
        <button type="button" className="icon-btn" onClick={onEdit} aria-label={`Ubah ${sub.service_name}`}>
          <UIIcon name="edit" size={18} />
        </button>
        <button type="button" className="icon-btn icon-btn-danger" onClick={onDelete} aria-label={`Hapus ${sub.service_name}`}>
          <UIIcon name="trash" size={18} />
        </button>
      </div>
    </div>
  );
}
