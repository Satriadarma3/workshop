import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import { CATEGORY_ICONS, CATEGORY_ICON_KEYS, CategoryIcon, UIIcon } from '../lib/icons';

const EMPTY = { id: null, name: '', icon: 'tag' };

export default function CategoriesPage() {
  const { cats, subs, createCategory, updateCategory, deleteCategory } = useData();
  const { askConfirm } = useUI();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const editing = !!form.id;

  async function submit(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return setError('Nama kategori wajib diisi.');
    if (cats.some((c) => c.id !== form.id && c.name.toLowerCase() === name.toLowerCase()))
      return setError('Nama kategori sudah dipakai.');

    setSaving(true);
    try {
      if (editing) await updateCategory(form.id, { name, icon: form.icon });
      else await createCategory({ name, icon: form.icon });
      setForm(EMPTY);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan kategori.');
    } finally {
      setSaving(false);
    }
  }

  const remove = (c) =>
    askConfirm({
      title: `Hapus “${c.name}”?`,
      body: 'Kategori dihapus. Langganan di dalamnya tidak ikut terhapus, hanya menjadi tanpa kategori.',
      onConfirm: async () => {
        await deleteCategory(c.id);
        if (form.id === c.id) setForm(EMPTY);
      },
    });

  return (
    <div className="stack-lg">
      <div className="stack-sm">
        <h1 className="page-title">Kategori</h1>
        <p className="lead">
          Kelompokkan langgananmu biar lebih rapi. Kategori bersifat opsional, dan menghapusnya tidak menghapus langganan di dalamnya.
        </p>
      </div>

      <form className="card form-card" onSubmit={submit} noValidate>
        <h2 className="section-title">{editing ? 'Ubah kategori' : 'Tambah kategori'}</h2>
        <label className="field field-narrow">
          <span className="field-label">Nama kategori</span>
          <input
            className="input"
            type="text"
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              setError('');
            }}
          />
        </label>
        <div role="group" aria-label="Pilih ikon" className="field">
          <span className="field-label">Ikon</span>
          <div className="icon-picker">
            {CATEGORY_ICON_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className="icon-choice"
                aria-pressed={form.icon === key}
                aria-label={CATEGORY_ICONS[key].label}
                onClick={() => setForm((f) => ({ ...f, icon: key }))}
              >
                <CategoryIcon name={key} />
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="row-gap">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {editing ? 'Simpan perubahan' : 'Tambah kategori'}
          </button>
          {editing && (
            <button type="button" className="btn btn-ghost" onClick={() => { setForm(EMPTY); setError(''); }}>
              Batal
            </button>
          )}
        </div>
      </form>

      {cats.length === 0 ? (
        <p className="muted">Belum ada kategori. Tambahkan yang pertama di atas.</p>
      ) : (
        <div className="cat-grid">
          {cats.map((c) => {
            const count = subs.filter((s) => s.category_id === c.id).length;
            return (
              <div key={c.id} className="cat-card">
                <span className="icon-circle icon-circle-lg">
                  <CategoryIcon name={c.icon} size={22} />
                </span>
                <span className="sub-text">
                  <span className="sub-name">{c.name}</span>
                  <span className="sub-meta">{count} langganan</span>
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Ubah kategori ${c.name}`}
                  onClick={() => { setForm({ id: c.id, name: c.name, icon: c.icon }); setError(''); }}
                >
                  <UIIcon name="edit" size={18} />
                </button>
                <button type="button" className="icon-btn icon-btn-danger" aria-label={`Hapus kategori ${c.name}`} onClick={() => remove(c)}>
                  <UIIcon name="trash" size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
