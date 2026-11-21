import { NavLink } from 'react-router-dom';
import { UIIcon } from '../lib/icons';

const LEFT = [
  { to: '/', label: 'Beranda', icon: 'home', end: true },
  { to: '/langganan', label: 'Langganan', icon: 'list' },
];
const RIGHT = [
  { to: '/kategori', label: 'Kategori', icon: 'grid' },
  { to: '/akun', label: 'Akun', icon: 'user' },
];

const Item = ({ to, label, icon, end }) => (
  <NavLink to={to} end={end} className="bottomnav-item">
    <UIIcon name={icon} size={20} strokeWidth={1.9} />
    <span>{label}</span>
  </NavLink>
);

/** Navigasi bawah berbentuk pil, hanya tampil di layar kecil. */
export default function BottomNav({ onAdd }) {
  return (
    <nav className="bottomnav" aria-label="Navigasi utama">
      {LEFT.map((i) => (
        <Item key={i.to} {...i} />
      ))}
      <button type="button" className="fab" onClick={onAdd} aria-label="Tambah langganan">
        <UIIcon name="plus" size={26} strokeWidth={2.4} />
      </button>
      {RIGHT.map((i) => (
        <Item key={i.to} {...i} />
      ))}
    </nav>
  );
}
