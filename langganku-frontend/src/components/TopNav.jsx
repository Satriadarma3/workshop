import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firstName } from '../lib/format';
import { UIIcon } from '../lib/icons';

const LINKS = [
  { to: '/', label: 'Beranda', icon: 'home', end: true },
  { to: '/langganan', label: 'Langganan', icon: 'list' },
  { to: '/kategori', label: 'Kategori', icon: 'grid' },
];

/** Navbar pil di layar lebar. Di layar kecil disembunyikan; BottomNav yang dipakai. */
export default function TopNav() {
  const { user, logout } = useAuth();
  const name = firstName(user.name);

  return (
    <header className="topnav-wrap">
      <div className="topnav">
        <NavLink to="/" className="brand" aria-label="Langganku, ke beranda">
          <span className="brand-mark">
            <UIIcon name="loop" size={20} strokeWidth={2} />
          </span>
          <span className="brand-name">Langganku</span>
        </NavLink>

        <nav className="topnav-links" aria-label="Navigasi utama">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="navlink">
              <UIIcon name={l.icon} size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="topnav-user">
          <span className="avatar" aria-hidden="true">
            {name.charAt(0)}
          </span>
          <span className="topnav-hello">Halo, {name}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            <UIIcon name="logout" size={18} />
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
