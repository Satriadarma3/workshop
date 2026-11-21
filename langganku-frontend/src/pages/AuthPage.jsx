import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UIIcon } from '../lib/icons';

/* ---------- validasi helper ---------- */
function validateField(key, value, formData) {
  switch (key) {
    case 'name':
      if (!value.trim()) return 'Nama wajib diisi.';
      if (value.trim().length < 2) return 'Nama minimal 2 karakter.';
      return '';
    case 'email':
      if (!value.trim()) return 'Email wajib diisi.';
      if (!/^\S+@\S+\.\S+$/.test(value.trim())) return 'Format email belum valid.';
      return '';
    case 'password':
      if (!value) return 'Kata sandi wajib diisi.';
      if (value.length < 6) return 'Kata sandi minimal 6 karakter.';
      return '';
    case 'confirmPassword':
      if (!value) return 'Konfirmasi kata sandi wajib diisi.';
      if (value !== formData.password) return 'Kata sandi tidak cocok.';
      return '';
    default:
      return '';
  }
}

function PasswordInput({ value, onChange, autoComplete, placeholder, error, touched }) {
  const [show, setShow] = useState(false);
  return (
    <div className="password-wrap">
      <input
        className={`input${error && touched ? ' input-error' : ''}`}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        className="password-toggle"
        aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        onClick={() => setShow((s) => !s)}
      >
        {show ? (
          /* eye-off */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          /* eye */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const level = strength <= 1 ? 'lemah' : strength <= 3 ? 'sedang' : 'kuat';
  const color = strength <= 1 ? '#a32a2a' : strength <= 3 ? '#d97706' : '#15803d';
  const pct = `${(strength / 5) * 100}%`;

  return (
    <div className="strength-wrap">
      <div className="strength-bar-bg">
        <div className="strength-bar-fill" style={{ width: pct, background: color }} />
      </div>
      <span className="strength-label" style={{ color }}>
        Kekuatan: <strong>{level}</strong>
      </span>
    </div>
  );
}

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const isRegister = mode === 'register';

  /* --- ganti mode → reset state --- */
  function switchMode(next) {
    setMode(next);
    setForm({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setTouched({});
    setServerError('');
    setSuccess('');
  }

  /* --- input handler --- */
  function onInput(key) {
    return (e) => {
      const value = e.target.value;
      setForm((f) => {
        const next = { ...f, [key]: value };
        // validasi live kalau field sudah pernah disentuh
        if (touched[key]) {
          setErrors((err) => ({ ...err, [key]: validateField(key, value, next) }));
        }
        // re-validasi confirmPassword saat password berubah
        if (key === 'password' && touched.confirmPassword) {
          setErrors((err) => ({
            ...err,
            confirmPassword: validateField('confirmPassword', next.confirmPassword, next),
          }));
        }
        return next;
      });
      setServerError('');
    };
  }

  /* --- blur handler → tandai sebagai touched --- */
  function onBlur(key) {
    return () => {
      setTouched((t) => ({ ...t, [key]: true }));
      setErrors((err) => ({ ...err, [key]: validateField(key, form[key], form) }));
    };
  }

  /* --- submit --- */
  async function submit(e) {
    e.preventDefault();
    // validasi semua field sekaligus
    const fields = isRegister
      ? ['name', 'email', 'password', 'confirmPassword']
      : ['email', 'password'];
    const newErrors = {};
    fields.forEach((k) => {
      newErrors[k] = validateField(k, form[k], form);
    });
    setErrors(newErrors);
    setTouched(fields.reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    if (Object.values(newErrors).some(Boolean)) return;

    setBusy(true);
    setServerError('');
    try {
      if (isRegister) {
        await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
        setSuccess('Akun berhasil dibuat! Mengalihkan…');
      } else {
        await login({ email: form.email.trim(), password: form.password });
      }
      // RequireAuth / GuestOnly mengalihkan otomatis setelah user terisi
    } catch (err) {
      setServerError(err.message || 'Terjadi kesalahan. Coba lagi.');
      setBusy(false);
    }
  }

  /* --- helper: apakah field valid? --- */
  const isOk = (key) => touched[key] && !errors[key];
  const isErr = (key) => touched[key] && !!errors[key];

  return (
    <div className="auth">
      {/* ---- sisi kiri: hero ---- */}
      <section className="auth-hero">
        <span className="auth-disc auth-disc-slate" aria-hidden="true" />
        <span className="auth-disc auth-disc-yellow" aria-hidden="true" />
        <div className="brand brand-light">
          <span className="brand-mark">
            <UIIcon name="loop" size={21} strokeWidth={2} />
          </span>
          <span className="brand-name">Langganku</span>
        </div>
        <div className="auth-copy">
          <h1>
            Tagihan datang, kamu <span className="hl">sudah siap.</span>
          </h1>
          <p>Catat semua langganan di satu tempat, dan jangan lagi kaget saat notifikasi bank masuk.</p>

          {/* fitur singkat */}
          <ul className="auth-features">
            <li>
              <span className="auth-feature-icon">✓</span>
              Pantau tagihan bulanan &amp; tahunan
            </li>
            <li>
              <span className="auth-feature-icon">✓</span>
              Kelompokkan berdasarkan kategori
            </li>
            <li>
              <span className="auth-feature-icon">✓</span>
              Lihat tagihan yang akan datang
            </li>
          </ul>
        </div>
      </section>

      {/* ---- sisi kanan: form ---- */}
      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit} noValidate>
          <div>
            <h2>{isRegister ? 'Buat akun baru' : 'Selamat datang kembali'}</h2>
            <p className="muted">
              {isRegister
                ? 'Daftar gratis, mulai catat langgananmu.'
                : 'Masuk untuk melihat tagihanmu.'}
            </p>
          </div>

          {/* toggle login/register */}
          <div className="segmented" role="group" aria-label="Pilih mode">
            <button type="button" aria-pressed={!isRegister} onClick={() => switchMode('login')}>
              Masuk
            </button>
            <button type="button" aria-pressed={isRegister} onClick={() => switchMode('register')}>
              Daftar
            </button>
          </div>

          {/* ---- field nama (hanya register) ---- */}
          {isRegister && (
            <div className="field">
              <span className="field-label">
                Nama panggilan <span className="field-required">*</span>
              </span>
              <div className="input-wrap">
                <input
                  className={`input${isErr('name') ? ' input-error' : ''}`}
                  type="text"
                  autoComplete="name"
                  placeholder="Contoh: Budi"
                  value={form.name}
                  onChange={onInput('name')}
                  onBlur={onBlur('name')}
                />
                {isOk('name') && <span className="input-check">✓</span>}
              </div>
              {isErr('name') && (
                <p role="alert" className="field-error">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          {/* ---- field email ---- */}
          <div className="field">
            <span className="field-label">
              Email <span className="field-required">*</span>
            </span>
            <div className="input-wrap">
              <input
                className={`input${isErr('email') ? ' input-error' : ''}`}
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={onInput('email')}
                onBlur={onBlur('email')}
              />
              {isOk('email') && <span className="input-check">✓</span>}
            </div>
            {isErr('email') && (
              <p role="alert" className="field-error">
                {errors.email}
              </p>
            )}
          </div>

          {/* ---- field password ---- */}
          <div className="field">
            <span className="field-label">
              Kata sandi <span className="field-required">*</span>
            </span>
            <PasswordInput
              value={form.password}
              onChange={onInput('password')}
              onBlur={onBlur('password')}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder={isRegister ? 'Min. 6 karakter' : 'Kata sandimu'}
              error={errors.password}
              touched={touched.password}
            />
            {isErr('password') && (
              <p role="alert" className="field-error">
                {errors.password}
              </p>
            )}
            {/* indikator kekuatan kata sandi (hanya register) */}
            {isRegister && <StrengthBar password={form.password} />}
          </div>

          {/* ---- konfirmasi password (hanya register) ---- */}
          {isRegister && (
            <div className="field">
              <span className="field-label">
                Konfirmasi kata sandi <span className="field-required">*</span>
              </span>
              <PasswordInput
                value={form.confirmPassword}
                onChange={onInput('confirmPassword')}
                onBlur={onBlur('confirmPassword')}
                autoComplete="new-password"
                placeholder="Ulangi kata sandi"
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
              />
              {isErr('confirmPassword') && (
                <p role="alert" className="field-error">
                  {errors.confirmPassword}
                </p>
              )}
              {isOk('confirmPassword') && form.confirmPassword && (
                <p className="field-ok">✓ Kata sandi cocok</p>
              )}
            </div>
          )}

          {/* ---- error dari server ---- */}
          {serverError && (
            <div role="alert" className="alert-error">
              <span>⚠</span> {serverError}
            </div>
          )}

          {/* ---- sukses ---- */}
          {success && (
            <div role="status" className="alert-success">
              <span>✓</span> {success}
            </div>
          )}

          {/* ---- tombol submit ---- */}
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={busy}>
            {busy ? (
              <span className="btn-spinner">
                <span className="spinner" /> Tunggu sebentar…
              </span>
            ) : isRegister ? (
              'Buat akun'
            ) : (
              'Masuk'
            )}
          </button>

          {/* ---- link beralih mode ---- */}
          <p className="auth-switch">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => switchMode(isRegister ? 'login' : 'register')}
            >
              {isRegister ? 'Masuk di sini' : 'Daftar gratis'}
            </button>
          </p>

          {import.meta.env.VITE_USE_MOCK !== 'false' && (
            <p className="muted small auth-mock-note">
              Mode contoh aktif — data tersimpan di browser ini saja.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
