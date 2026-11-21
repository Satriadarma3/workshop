import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import {
  CYCLE_LABEL,
  STATUS_META,
  daysUntil,
  firstName,
  greeting,
  monthlyTotal,
  relativeText,
  rupiah,
  sortSubscriptions,
  formatDate,
} from '../lib/format';
import { CategoryIcon, UIIcon } from '../lib/icons';

export default function HomePage() {
  const { user } = useAuth();
  const { subs, cats } = useData();
  const { openSubscriptionForm } = useUI();

  const catById = Object.fromEntries(cats.map((c) => [c.id, c]));
  const active = subs.filter((s) => s.status === 'ACTIVE');
  const monthly = monthlyTotal(subs);
  const upcoming = [...active].sort((a, b) => a.next_billing_date.localeCompare(b.next_billing_date));
  const next = upcoming[0];
  const name = firstName(user.name);

  const summary = active.length
    ? `Ada ${active.length} langganan aktif dengan total ${rupiah(monthly)} per bulan.` +
      (next ? ` Tagihan berikutnya: ${next.service_name}, ${relativeText(daysUntil(next.next_billing_date)).toLowerCase()}.` : '')
    : 'Belum ada langganan aktif. Tambahkan yang pertama biar tagihanmu tercatat.';

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div className="stack-sm greeting">
          <span className="eyebrow">{greeting()}</span>
          <h1 className="page-title">Halo, {name}.</h1>
          <p className="lead">{summary}</p>
        </div>
        <button type="button" className="btn btn-primary btn-lg hide-mobile" onClick={() => openSubscriptionForm()}>
          <UIIcon name="plus" size={18} strokeWidth={2.2} />
          Tambah langganan
        </button>
      </div>

      <div className="stats">
        <div className="stat stat-hero">
          <span className="deco-hero deco-hero-a" aria-hidden="true" />
          <span className="deco-hero deco-hero-b" aria-hidden="true" />
          <span className="stat-label">Pengeluaran per bulan</span>
          <span className="stat-value">{rupiah(monthly)}</span>
          <span className="stat-sub">
            {active.length} langganan aktif · setara {rupiah(monthly * 12)} per tahun
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Langganan aktif</span>
          <span className="stat-value stat-value-dark">{active.length}</span>
          <span className="stat-sub">
            dari {subs.length} langganan · {subs.filter((s) => s.status === 'PAUSED').length} dijeda ·{' '}
            {subs.filter((s) => s.status === 'CANCELLED').length} dibatalkan
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Tagihan terdekat</span>
          <span className="stat-value stat-value-dark">{next ? next.service_name : '—'}</span>
          <span className="stat-sub">
            {next
              ? `${formatDate(next.next_billing_date)} · ${relativeText(daysUntil(next.next_billing_date))} · ${rupiah(next.price)}`
              : 'Belum ada langganan aktif'}
          </span>
        </div>
      </div>

      <section className="stack-sm" aria-labelledby="h-upcoming">
        <h2 id="h-upcoming" className="section-title">
          Tagihan terdekat
        </h2>
        {upcoming.length === 0 ? (
          <p className="muted">Belum ada langganan aktif.</p>
        ) : (
          <div className="upcoming">
            {upcoming.slice(0, 5).map((s, i) => (
              <div key={s.id} className={`up-card${i === 0 ? ' is-first' : ''}`}>
                <span className="icon-circle">
                  <CategoryIcon name={catById[s.category_id]?.icon ?? 'tag'} />
                </span>
                <span className="up-name">{s.service_name}</span>
                <span className="up-price">{rupiah(s.price)}</span>
                <span className="up-chip">{relativeText(daysUntil(s.next_billing_date))}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stack-sm" aria-labelledby="h-recent">
        <div className="row-between">
          <h2 id="h-recent" className="section-title">
            Langgananmu
          </h2>
          <Link to="/langganan" className="link-btn">
            Lihat semua
          </Link>
        </div>
        <div className="mini-list">
          {sortSubscriptions(subs)
            .slice(0, 4)
            .map((s) => {
              const status = STATUS_META[s.status];
              const cat = catById[s.category_id];
              return (
                <div key={s.id} className="mini-row">
                  <span className="icon-circle">
                    <CategoryIcon name={cat?.icon ?? 'tag'} />
                  </span>
                  <span className="sub-text">
                    <span className="sub-name">{s.service_name}</span>
                    <span className="sub-meta">
                      {[CYCLE_LABEL[s.billing_cycle], cat?.name ?? 'Tanpa kategori'].join(' · ')}
                    </span>
                  </span>
                  <span className="mini-end">
                    <span className="sub-price">{rupiah(s.price)}</span>
                    <span className={`chip-status ${status.className}`}>{status.label}</span>
                  </span>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
}
