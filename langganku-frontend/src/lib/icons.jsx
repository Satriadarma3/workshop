/** Ikon kategori. Nilai `icon` yang disimpan di tabel CATEGORIES adalah kuncinya. */
export const CATEGORY_ICONS = {
  film: { label: 'Film', path: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM10 8.5v7l6-3.5z' },
  music: { label: 'Musik', path: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' },
  cloud: { label: 'Awan', path: 'M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.7 1.5A3.8 3.8 0 0 0 6.5 19z' },
  code: { label: 'Kode', path: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
  book: { label: 'Buku', path: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5' },
  gamepad: { label: 'Game', path: 'M6 11h4M8 9v4M15 12h.01M18 10h.01M17.3 5H6.7a4 4 0 0 0-3.9 3.1l-1.4 6.5A2.5 2.5 0 0 0 5.9 17l1.6-2h9l1.6 2a2.5 2.5 0 0 0 4.5-2.4l-1.4-6.5A4 4 0 0 0 17.3 5z' },
  bag: { label: 'Belanja', path: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0' },
  bolt: { label: 'Petir', path: 'M13 2L3 14h9l-1 8 10-12h-9z' },
  tag: { label: 'Label', path: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01' },
};

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

const UI_ICONS = {
  plus: 'M12 5v14M5 12h14',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  close: 'M18 6L6 18M6 6l12 12',
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  user: 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  loop: 'M21 12a9 9 0 1 1-3-6.7M21 4v5h-5',
};

export function Icon({ d, size = 20, strokeWidth = 1.8 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export const UIIcon = ({ name, ...props }) => <Icon d={UI_ICONS[name]} {...props} />;

export const CategoryIcon = ({ name, ...props }) => (
  <Icon d={(CATEGORY_ICONS[name] || CATEGORY_ICONS.tag).path} {...props} />
);
