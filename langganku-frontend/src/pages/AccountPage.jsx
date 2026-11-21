import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { firstName } from '../lib/format';
import { UIIcon } from '../lib/icons';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { subs, cats } = useData();
  const name = firstName(user.name);

  return (
    <div className="stack-lg account">
      <h1 className="page-title">Akun</h1>

      <div className="profile">
        <span className="deco-hero deco-hero-b" aria-hidden="true" />
        <span className="avatar avatar-lg" aria-hidden="true">
          {name.charAt(0)}
        </span>
        <span className="profile-text">
          <span className="profile-name">{user.name}</span>
          <span className="profile-mail">{user.email}</span>
        </span>
      </div>

      <div className="two-up">
        <div className="stat">
          <span className="stat-value stat-value-dark">{subs.filter((s) => s.status === 'ACTIVE').length}</span>
          <span className="stat-sub">langganan aktif</span>
        </div>
        <div className="stat">
          <span className="stat-value stat-value-dark">{cats.length}</span>
          <span className="stat-sub">kategori</span>
        </div>
      </div>

      <button type="button" className="btn btn-ghost btn-lg" onClick={logout}>
        <UIIcon name="logout" size={18} />
        Keluar
      </button>
    </div>
  );
}
