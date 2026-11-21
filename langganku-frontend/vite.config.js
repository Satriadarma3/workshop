import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Saat VITE_USE_MOCK=false, panggilan /api diteruskan ke backend lokal Anda.
// Ubah target jika backend berjalan di port lain.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
