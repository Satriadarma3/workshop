import { useState } from 'react';
import { useData } from '../context/DataContext';
import { addDays, toISODate } from '../lib/format';
import { UIIcon } from '../lib/icons';

const CYCLES = [
  ['MONTHLY', 'Bulanan'],
  ['YEARLY', 'Tahunan'],
];
const STATUSES = [
  ['ACTIVE', 'Aktif'],
  ['PAUSED', 'Dijeda'],
  ['CANCELLED', 'Dibatalkan'],
];

const blank = () => ({
  service_name: '',
  price: '',
  billing_cycle: 'MONTHLY',
  next_billing_date: toISODate(addDays(new Date(), 30)),
  status: 'ACTIVE',
  category_id: '',
  notes: '',
});

function Pills({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="field">
      <span className="field-label">{label}</span>
      <div className="pill-row">
        {options.map(([key, text]) => (
          <button
            key={key}
            type="button"
            className="chip"
            aria-pressed={value === key}
            onClick={() => onChange(key)}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Form tambah/ubah langganan: dialog di layar lebar, lembar dari bawah di layar kecil. */
export default function SubscriptionForm({ sub, onClose }) {
  const { cats, createSubscription, updateSubscription } = useData();
  const [form, setForm] = useState(
    sub
      ? {
          service_name: sub.service_name,
          price: String(sub.price),
          billing_cycle: sub.billing_cycle,
          next_billing_date: sub.next_billing_date,
          status: sub.status,
          category_id: sub.category_id || '',
          notes: sub.notes || '',
        }
      : blank(),
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  };
  const onInput = (key) => (e) => set(key)(e.target.value);

  async function submit(e) {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.service_name.trim()) return setError('Nama layanan wajib diisi.');
    if (form.price === '' || Number.isNaN(price) || price <= 0) return setError('Harga harus lebih dari 0.');
    if (!form.next_billing_date) return setError('Tanggal tagihan berikutnya wajib diisi.');

    const payload = {
      service_name: form.service_name.trim(),
      price,
      billing_cycle: form.billing_cycle,
      next_billing_date: form.next_billing_date,
      status: form.status,
      category_id: form.category_id || null,
      notes: form.notes.trim(),
    };

    setSaving(true);
    try {
      if (sub) await updateSubscription(sub.id, payload);
      else await createSubscription(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan.');
      setSaving(false);
    }
  }

  const title = sub ? 'Ubah langganan' : 'Tambah langganan';

  return (
    <div
      className="overlay overlay-sheet"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <form className="dialog" role="dialog" aria-modal="true" aria-labelledby="sub-form-title" onSubmit={submit} noValidate>
        <div className="sheet-grabber" aria-hidden="true" />
        <div className="dialog-head">
          <h2 id="sub-form-title">{title}</h2>
          <button type="button" className="icon-btn icon-btn-soft" onClick={onClose} aria-label="Tutup">
            <UIIcon name="close" />
          </button>
        </div>

        <label className="field">
          <span className="field-label">Nama layanan</span>
          <input className="input" type="text" placeholder="Contoh: Netflix" value={form.service_name} onChange={onInput('service_name')} autoFocus />
        </label>

        <div className="field-grid">
          <label className="field">
            <span className="field-label">Harga (Rp)</span>
            <input className="input" type="number" inputMode="numeric" min="0" step="1000" placeholder="0" value={form.price} onChange={onInput('price')} />
          </label>
          <Pills label="Siklus tagihan" options={CYCLES} value={form.billing_cycle} onChange={set('billing_cycle')} />
        </div>

        <label className="field">
          <span className="field-label">Tagihan berikutnya</span>
          <input className="input" type="date" value={form.next_billing_date} onChange={onInput('next_billing_date')} />
        </label>

        <Pills label="Status" options={STATUSES} value={form.status} onChange={set('status')} />
        <Pills
          label="Kategori (opsional)"
          options={[['', 'Tanpa kategori'], ...cats.map((c) => [c.id, c.name])]}
          value={form.category_id}
          onChange={set('category_id')}
        />

        <label className="field">
          <span className="field-label">Catatan (opsional)</span>
          <textarea className="input input-area" rows={3} placeholder="Misalnya: paket keluarga" value={form.notes} onChange={onInput('notes')} />
        </label>

        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}

        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan langganan'}
          </button>
        </div>
      </form>
    </div>
  );
}
