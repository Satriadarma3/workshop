/**
 * Klien HTTP untuk backend sungguhan.
 * Kontrak endpoint lengkap ada di docs/API.md.
 */
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'langganku.token';

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* abaikan */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* abaikan */
    }
  },
};

export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // kode HTTP
    this.errors = errors; // opsional: { field: 'pesan' }
  }
}

let onUnauthorized = () => {};
/** Dipanggil saat server membalas 401 untuk sesi yang sedang login. */
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

async function request(path, { method = 'GET', body, query } = {}) {
  const url = new URL(BASE + path, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const headers = { Accept: 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server.');
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* badan kosong atau bukan JSON */
  }

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(data?.message || `Permintaan gagal (${res.status}).`, res.status, data?.errors ?? null);
  }
  return data;
}

export function createRealApi() {
  return {
    auth: {
      register: (body) => request('/auth/register', { method: 'POST', body }),
      login: (body) => request('/auth/login', { method: 'POST', body }),
      me: () => request('/auth/me'),
    },
    categories: {
      list: () => request('/categories'),
      create: (body) => request('/categories', { method: 'POST', body }),
      update: (id, body) => request(`/categories/${id}`, { method: 'PUT', body }),
      remove: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
    },
    subscriptions: {
      list: (query) => request('/subscriptions', { query }),
      create: (body) => request('/subscriptions', { method: 'POST', body }),
      update: (id, body) => request(`/subscriptions/${id}`, { method: 'PUT', body }),
      remove: (id) => request(`/subscriptions/${id}`, { method: 'DELETE' }),
    },
  };
}
